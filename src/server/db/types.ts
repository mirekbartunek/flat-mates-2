import { users, listings, tenants, listingReservations } from "./index";
import { z } from "zod";
import { tenantSocialsEnumValues } from "@/server/db/enums";

export type Users = typeof users.$inferSelect; // when queried
export type Listings = typeof listings.$inferSelect;
export type Tenants = typeof tenants.$inferSelect;
export type Resevations = typeof listingReservations.$inferSelect
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
  imageIds: z.string().array().min(1, {
    message:
      "Listing must include atleast 1 image. Have you clicked the Upload button?",
  }),
  current_capacity: z
    .number({
      message: "Please provide the current number of residents",
    })
    .default(0),
  tenants: z.array(
    z.object({
      name: z.string().min(1, { message: "Tenant name is required" }),
      bio: z.string().min(1, { message: "Tenant bio is required" }),
      socials: z.array(
        z.object({
          label: z.enum(tenantSocialsEnumValues), // Tady je ta změna
          value: z.string().url({ message: "Please enter a valid URL" })
        })
      ).default([])
    })
  ).optional(),
});
export const socialEnum = z.enum(tenantSocialsEnumValues);

const socials = z.object({
  label: socialEnum,
  value: z
    .string({
      message: "Must be included",
    })
    .url({
      message: "This is not a valid URL",
    }),
});

export const createTenantSchema = z.object({
  name: z.string({
    message: "Tenant must have a name",
  }),
  bio: z.string({
    message: "Tenant must have a bio",
  }),
  socials: socials.array().optional(),
});
export type TenantSchema = z.infer<typeof createTenantSchema>;
