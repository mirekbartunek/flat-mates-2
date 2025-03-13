import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createListingSchema, updateListingSchema } from "@/server/db/types";
import {
  listingFiles,
  listingReservations,
  listings,
  listingTenants,
  tenants,
  tenantSocials,
  users,
} from "@/server/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { OwnerBookingMessage } from "@/components/emails/owner-booking-message";
import { AcceptedTenantMessage } from "@/components/emails/tenant-accepted-email";
import { RejectedTenantMessage } from "@/components/emails/tenant-reject-email";

export const listingsRouter = createTRPCRouter({
  createNewListing: protectedProcedure
    .input(createListingSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      console.dir(input);
      const id = await db.transaction(async (tx) => {
        const [listing] = await tx
          .insert(listings)
          .values({
            userId: session.user.id,
            title: input.title,
            max_tenants: input.max_tenants,
            description: input.description,
            monthly_price: input.monthly_price,
            location: input.location,
            area: input.area,
            street: input.street,
            zip: input.zip,
            city: input.city,
            country: input.country,
            rooms: input.rooms,
          })
          .returning({ id: listings.id });
        if (!listing) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Listing could not be retrieved",
          });
        }
        await tx.insert(listingFiles).values(
          input.imageIds.map((id) => ({
            listingId: listing.id,
            fileId: id,
          }))
        );
        if (input?.tenants && input.tenants.length > 0) {
          const addedTenants = await tx
            .insert(tenants)
            .values(
              input.tenants.map((tenant) => ({
                name: tenant.name,
                bio: tenant.bio,
              }))
            )
            .returning();
          await tx.insert(listingTenants).values(
            addedTenants.map((tenant) => ({
              listingId: listing.id,
              tenantId: tenant.id,
            }))
          );
          const socialValues = addedTenants.flatMap((tenant) => {
            const inputTenant = input.tenants!.find(
              (t) => t.name === tenant.name
            );
            if (!inputTenant?.socials) return [];

            return inputTenant.socials.map((social) => ({
              tenantId: tenant.id,
              social_enum: social.label,
              url: social.value,
            }));
          });

          if (socialValues.length > 0) {
            await tx.insert(tenantSocials).values(socialValues);
          }
        }

        return listing.id;
      });
      return id;
    }),
  getListingById: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const res = await db.query.listings.findFirst({
        where: eq(listings.id, input.listingId),
        with: {
          reservations: {
            with: {
              user: true,
            },
          },
          creator: true,
          tenants: {
            with: {
              tenant: true,
            },
          },
        },
      });

      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }
      return res;
    }),
  bookListing: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
        tenantId: z.string(),
        messageToOwner: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const listing = await db.query.listings.findFirst({
        where: eq(listings.id, input.listingId),
        with: {
          creator: true,
        },
      });
      if (!listing?.creator.email) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not retrieve property owner email",
        });
      }
      const tenant = await db.query.users.findFirst({
        where: eq(users.id, input.tenantId),
      });
      if (!tenant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find tenant",
        });
      }

      await db.insert(listingReservations).values({
        listing_id: input.listingId,
        user_id: input.tenantId,
        message: input.messageToOwner,
      });
      await resend.emails.send({
        from: "Flat Mates <flatmates@miroslavbartunek.com>",
        to: listing.creator.email,
        subject: "Wohooo! Someone is interested in your listing!",
        react: OwnerBookingMessage({
          ownerName: listing.creator.name!,
          linkToDashBoard: `https://flat-matess-2-vercel.app/listing/${listing.id}/dashboard`,
          tenantName: tenant.name!,
          propertyTitle: listing.title,
          tenantEmail: tenant.email,
          message: input.messageToOwner,
        }),
      });
    }),
  resolveReservationRequest: protectedProcedure
    .input(
      z.object({
        reservationId: z.string(),
        action: z.enum(["REJECT", "ACCEPT"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const res = await db.query.listingReservations.findFirst({
        where: eq(listingReservations.id, input.reservationId),
        with: {
          listing: {
            with: {
              creator: true,
              tenants: true,
            },
          },
          user: true,
        },
      });
      if (!res) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Could not find such reservation",
        });
      }
      if (res.listing.creator.id !== session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only listing owner can perform such action",
        });
      }
      let isListingFull = false;
      switch (input.action) {
        case "ACCEPT": {
          await db.transaction(async (tx) => {
            await tx.update(listingReservations).set({
              status: "accepted",
            });

            const [user] = await tx
              .insert(tenants)
              .values({
                name: res.user.name!,
                bio: "Flat Mates user!",
              })
              .returning();
            if (!user?.id) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create tenant",
                cause: "error",
              });
            }
            await tx.insert(listingTenants).values({
              tenantId: user.id,
              listingId: res.listing.id,
            });
            /*
            await tx
              .update(listings)
              .set({
                current_capacity: sql`${listings.current_capacity} + 1`,
              })
              .where(eq(listings.id, res.listing.id));
             */
          });
          await resend.emails.send({
            from: "Flat Mates <flatmates@miroslavbartunek.com>",
            to: res.user.email,
            subject: "Pack your bags! You just got accepted!",
            react: AcceptedTenantMessage({
              tenantName: res.user.name!,
              ownerName: res.listing.creator.name!,
              propertyTitle: res.listing.title,
              ownerEmail: res.listing.creator.email,
              monthlyPrice: res.listing.monthly_price,
            }),
          });
          if (res.listing.tenants.length + 1 === res.listing.max_tenants) {
            await db
              .update(listings)
              .set({ listing_status: "PRIVATE" })
              .where(eq(listings.id, res.listing.id));
            isListingFull = true;
          }
          break;
        }
        case "REJECT": {
          await db
            .update(listingReservations)
            .set({
              status: "rejected",
            })
            .where(eq(listingReservations.id, input.reservationId));
          await resend.emails.send({
            from: "Flat Mates <flatmates@miroslavbartunek.com>",
            to: res.user.email,
            subject: `Update on your ${res.listing.title} application`,
            react: RejectedTenantMessage({
              tenantName: res.user.name!,
              ownerName: res.listing.creator.name!,
              propertyTitle: res.listing.title,
            }),
          });
        }
      }
      return {
        isListingFull,
      };
    }),
  editListing: protectedProcedure
    .input(updateListingSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const listing = await db.query.listings.findFirst({
        where: eq(listings.id, input.id),
        with: {
          creator: true,
        },
      });

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      if (listing.creator.id !== session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Only listing owner can edit this listing",
        });
      }

      const { id, tenants: tenantsInput, ...updateData } = input;

      await db.transaction(async (tx) => {
        if (Object.keys(updateData).length !== 0) {
          await tx.update(listings).set(updateData).where(eq(listings.id, id));
        }
        if (tenantsInput?.length) {
          const addedTenants = await tx
            .insert(tenants)
            .values(
              tenantsInput.map((tenant) => ({
                name: tenant.name,
                bio: tenant.bio,
              }))
            )
            .returning();

          await tx.insert(listingTenants).values(
            addedTenants.map((tenant) => ({
              tenantId: tenant.id,
              listingId: id,
            }))
          );

          const socialValues = addedTenants.flatMap((tenant) => {
            const inputTenant = tenantsInput.find(
              (t) => t.name === tenant.name
            );
            if (!inputTenant?.socials) return [];

            return inputTenant.socials.map((social) => ({
              tenantId: tenant.id,
              social_enum: social.label,
              url: social.value,
            }));
          });

          if (socialValues.length > 0) {
            await tx.insert(tenantSocials).values(socialValues);
          }
        }
      });

      return { success: true };
    }),
  removeListing: protectedProcedure
    .input(
      z.object({
        listingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const listing = await db.query.listings.findFirst({
        where: eq(listings.id, input.listingId),
      });
      if (!listing)
        throw new TRPCError({
          message: "Listing not found",
          code: "NOT_FOUND",
        });
      if (
        listing.userId !== session.user.id ||
        !["ADMIN", "SUPERADMIN"].includes(session.user.role)
      )
        throw new TRPCError({ message: "Unauthorized", code: "UNAUTHORIZED" });

      await db.delete(listings).where(eq(listings.id, listing.id));
    }),
});
