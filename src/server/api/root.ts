import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import {
  listingsRouter,
  adminRouter,
  locationRouter,
  tenantsRouter,
} from "@/server/api/routers";

export const appRouter = createTRPCRouter({
  listings: listingsRouter,
  admin: adminRouter,
  location: locationRouter,
  tenants: tenantsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
