import type {
  users,
  listings,
  tenants,
  listingReservations,
  listingFiles,
  files,
} from "./index";
import { z } from "zod";
import {
  listingStatusEnumValues,
  tenantSocialsEnumValues,
} from "@/server/db/enums";

export type Users = typeof users.$inferSelect; // when queried
export type Listings = typeof listings.$inferSelect;
export type Tenants = typeof tenants.$inferSelect;
export type Reservations = typeof listingReservations.$inferSelect;
export type ListingFiles = typeof listingFiles.$inferSelect;
export type Files = typeof files.$inferSelect;

export const newTenant = z.object({
  name: z.string().min(1, { message: "Tenant name is required" }),
  bio: z.string().min(1, { message: "Tenant bio is required" }),
  socials: z.array(
    z.object({
      label: z.enum(tenantSocialsEnumValues),
      value: z.string().url({ message: "Please enter a valid URL" }),
    })
  ),
});

const pointSchema = z.tuple([
  z.number().min(-180).max(180).describe("longitude"),
  z.number().min(-90).max(90).describe("latitude"),
]);

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
  max_tenants: z
    .number({
      message: "Maximal number of tenants must be included",
    })
    .min(1, {
      message: "Listing should have 1 tenant",
    }),
  monthly_price: z
    .number({
      message: "Monthly price must be included",
    })
    .min(0, { message: "Price cannot be negative" }),
  imageIds: z.string().array().min(1, {
    message:
      "Listing must include atleast 1 image. Have you clicked the Upload button?",
  }),
  current_capacity: z
    .number({
      message: "Please provide the current number of residents",
    })
    .default(0),
  tenants: z.array(newTenant).optional(),
  listing_status: z.enum(listingStatusEnumValues).default("HIDDEN").optional(),
  street: z.string({
    message: "Street must be included",
  }),
  zip: z
    .string()
    .min(1, "ZIP code is required")
    .max(10, "ZIP code too long")
    .regex(
      /^[A-Z0-9\s-]*$/i,
      "ZIP code can only contain letters, numbers, spaces and hyphens"
    )
    .transform((val) => val.trim().toUpperCase()),
  city: z.string({
    message: "City must be included",
  }),
  country: z.string({
    message: "Country must be included",
  }),
  location: pointSchema,
  area: z
    .number({
      message: "Area must be included",
    })
    .min(0),
  rooms: z
    .number({
      message: "Number of rooms must be included",
    })
    .min(0),
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

export const updateListingSchema = createListingSchema.partial().extend({
  id: z.string().uuid(),
});

export const updatePriceFormSchema = z.object({
  monthly_price: z.number(),
});

export const updateListingCapacityFormSchema = z.object({
  max_tenants: z.number(),
});

export const updateListingStatusFormSchema = z.object({
  listing_status: z.enum(listingStatusEnumValues),
});

export type UpdateListingCapacityFormSchema = z.infer<
  typeof updateListingCapacityFormSchema
>;

export type UpdatePriceFormSchema = z.infer<typeof updatePriceFormSchema>;

export const addTenantFormSchema = newTenant;

export type AddTenantFormSchema = z.infer<typeof addTenantFormSchema>;
