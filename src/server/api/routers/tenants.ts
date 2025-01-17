import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createTenantSchema } from "@/server/db/types";

export const tenantsRouter = createTRPCRouter({
  addNewTenants: protectedProcedure
    .input(createTenantSchema.array())
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      /*
      await db.transaction(async (tx) => {
        await Promise.all(input.map(async (tenant) => {
          const [res] = await tx.insert(tenants).values({
            name: tenant.name,
            bio: tenant.bio,
            image: "https://i.imgur.com/OvMZBs9.jpg",
          }).returning();
          if (!res?.id) {
            tx.rollback()
            return;
          }
          await tx.insert(tenantSocials).values({
            tenantId: res.id,
tenantSocials: tenant.socials,
            url: tenant.socials.
          })
        }))
         });

 */
    }),

});

