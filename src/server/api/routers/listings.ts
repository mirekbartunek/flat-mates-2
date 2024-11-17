import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createListingSchema } from "@/server/db/types";
import { listingFiles, listings } from "@/server/db";
import { TRPCError } from "@trpc/server";

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
});
