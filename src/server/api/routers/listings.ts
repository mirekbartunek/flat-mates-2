import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createListingSchema } from "@/server/db/types";
import { listings } from "@/server/db";

export const listingsRouter = createTRPCRouter({
  createNewListing: protectedProcedure
    .input(createListingSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const value = await db.insert(listings).values({
        userId: session.user.id,
        title: input.title,
        maxTenants: input.maxTenants,
        description: input.description,
        monthly_price: input.monthly_price,
      });
      return value;
    }),
});
