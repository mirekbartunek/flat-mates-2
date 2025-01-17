ALTER TABLE "listing_files" DROP CONSTRAINT "listingFilesId";--> statement-breakpoint
ALTER TABLE "listing_tenants" DROP CONSTRAINT "listing_tenants_listingId_tenantId_pk";--> statement-breakpoint
ALTER TABLE "listing_files" ALTER COLUMN "listingId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_files" ALTER COLUMN "fileId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_files" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_tenants" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;