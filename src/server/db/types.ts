import type { users, listings } from "./index";
import { z } from "zod";

export type Users = typeof users.$inferSelect; // when queried
export type Listings = typeof listings.$inferSelect;
export const createListingSchema = z.object({
  title: z
    .string({ message: "Title must be included" })
    .min(5, {
      message: "Title should be at least 5 characters long",
    })
    .trim(),
  description: z
    .string({ message: "Description must be included" })
    .min(20, {
      message: "Description should be at least 20 characters long",
    })
    .trim(),
  maxTenants: z.number({
    message: "Maximal number of tenants must be included",
  }),
  monthly_price: z.number({
    message: "Monthly price must be included",
  }),
});
