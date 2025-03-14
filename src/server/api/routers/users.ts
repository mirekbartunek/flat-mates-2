import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const usersRouter = createTRPCRouter({
  protectedMe: protectedProcedure.query(({ ctx }) => {
    const { session } = ctx;
    console.log(`>>> ROLE: ${session.user.role}`);
    return session.user;
  }),
  publicMe: publicProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    if (!session?.user) return false;
    return session.user;
  }),
  hasAuth: publicProcedure.query(async ({ ctx }) => {
    const { session } = ctx;
    return Boolean(session);
  }),
});
