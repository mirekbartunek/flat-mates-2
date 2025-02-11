CREATE TYPE "public"."listing_status" AS ENUM('PUBLIC', 'PRIVATE', 'HIDDEN');--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "area" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "rooms" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "location" "point" NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" ADD COLUMN "listing_status" "listing_status" DEFAULT 'HIDDEN' NOT NULL;--> statement-breakpoint
ALTER TABLE "listings" DROP COLUMN IF EXISTS "current_capacity";