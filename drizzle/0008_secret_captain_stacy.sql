ALTER TABLE "listing_tenants" DROP CONSTRAINT "listingTenantsId";--> statement-breakpoint
ALTER TABLE "listing_tenants" ALTER COLUMN "listingId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_tenants" ALTER COLUMN "tenantId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "listing_tenants" ADD CONSTRAINT "listing_tenants_listingId_tenantId_pk" PRIMARY KEY("listingId","tenantId");