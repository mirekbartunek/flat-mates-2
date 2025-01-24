import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { tenants } from "@/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const tenantsRouter = createTRPCRouter({
  removeTenant: protectedProcedure
    .input(
      z.object({
        tenantId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, input.tenantId)
      });
      if (!tenant) throw new TRPCError({code: "NOT_FOUND", message: "Tenant could not be found"})
      await db.delete(tenants).where(eq(tenants.id, input.tenantId)).returning();
    }),
});
