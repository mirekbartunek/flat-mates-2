import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import z from "zod";
import { userRoleEnumValues, userVerifiedEnumValues } from "@/server/db/enums";
import {
  CAN_MODIFY_ROLE,
  RIGHT_TO_CHANGE_ROLES,
  RIGHT_TO_VERIFY_USERS,
} from "@/lib/constants";
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
      const canChangeToRoles = RIGHT_TO_CHANGE_ROLES[session.user.role];

      if (!canChangeToRoles.includes(input.role)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You cannot assign this role",
        });
      }

      const targetUser = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
        columns: { role: true },
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (!CAN_MODIFY_ROLE[session.user.role].includes(targetUser.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to modify this user's role",
        });
      }

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
    }),
});
