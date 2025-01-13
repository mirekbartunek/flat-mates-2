ALTER TABLE "tenantSocials" RENAME TO "tenant_socials";--> statement-breakpoint
ALTER TABLE "tenant_socials" DROP CONSTRAINT "tenantSocials_tenantId_tenants_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tenant_socials" ADD CONSTRAINT "tenant_socials_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
