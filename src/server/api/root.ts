import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { listingsRouter, usersRouter } from "@/server/api/routers";
import { adminRouter } from "@/server/api/routers/admin";
import { tenantsRouter } from "@/server/api/routers/tenants";
import { locationRouter } from "@/server/api/routers/location";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  listings: listingsRouter,
  users: usersRouter,
  admin: adminRouter,
  tenants: tenantsRouter,
  location: locationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
