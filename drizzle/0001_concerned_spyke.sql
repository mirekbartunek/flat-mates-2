ALTER TABLE "listings" RENAME COLUMN "max_tenants" TO "maxTenants";--> statement-breakpoint
ALTER TABLE "listings" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "tenantSocials" DROP CONSTRAINT "tenantSocials_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "tenantSocials" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "tenantSocials" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "tenantSocials" ADD COLUMN "tenantId" uuid NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tenantSocials" ADD CONSTRAINT "tenantSocials_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
