import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import z from "zod";
import { userRoleEnumValues, userVerifiedEnumValues } from "@/server/db/enums";
import { RIGHT_TO_CHANGE_ROLES, RIGHT_TO_VERIFY_USERS } from "@/lib/constants";
import { TRPCError } from "@trpc/server";
import { users } from "@/server/db";
import { eq } from "drizzle-orm";
export const adminRouter = createTRPCRouter({
  verifyUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        user_verified: z.enum(userVerifiedEnumValues),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { session, db } = ctx;

      const canVerifyUser = RIGHT_TO_VERIFY_USERS[session.user.role];
      if (!canVerifyUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Your role is not sufficient",
        });
      }

      const res = await db
        .update(users)
        .set({ verified_status: input.user_verified })
        .where(eq(users.id, input.userId));

      return res;
    }),
  changeUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(userRoleEnumValues),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { session, db } = ctx;
      const canChangeUserRole = RIGHT_TO_CHANGE_ROLES[session.user.role];
      if (!canChangeUserRole) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Your role is not sufficient",
        });
      }
      const res = await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return res;
    }),
});
