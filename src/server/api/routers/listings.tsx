import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createListingSchema } from "@/server/db/types";
import {
  db,
  listingFiles,
  listingReservations,
  listings,
  users,
} from "@/server/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { OwnerBookingMessage } from "@/components/emails/owner-booking-message";

export const listingsRouter = createTRPCRouter({
  createNewListing: protectedProcedure
    .input(createListingSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;

      const id = await db.transaction(async (tx) => {
        const [listing] = await tx
          .insert(listings)
          .values({
            userId: session.user.id,
            title: input.title,
            maxTenants: input.maxTenants,
            description: input.description,
            monthly_price: input.monthly_price,
            current_capacity: input.current_capacity,
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
      });
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
        from: "Acme <onboarding@resend.dev>",
        to: listing.creator.email,
        subject: "Wohooo! Someone is interested in your listing!",
        react: (
          <OwnerBookingMessage
            ownerName={listing.creator.name!}
            linkToDashBoard={`https://flatmates.com/listing/${listing.id}/dashboard`}
            tenantName={tenant.name!}
            propertyTitle={listing.title}
            tenantEmail={tenant.email}
            message={input.messageToOwner}
          />
        ),
      });
      console.log("sent");
    }),
});
