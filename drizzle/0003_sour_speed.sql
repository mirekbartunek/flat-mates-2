CREATE TABLE IF NOT EXISTS "listing_tenants" (
	"listingId" uuid,
	"tenantId" uuid,
	CONSTRAINT "listingTenantsId" PRIMARY KEY("listingId","tenantId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing_tenants" ADD CONSTRAINT "listing_tenants_listingId_listings_id_fk" FOREIGN KEY ("listingId") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing_tenants" ADD CONSTRAINT "listing_tenants_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
