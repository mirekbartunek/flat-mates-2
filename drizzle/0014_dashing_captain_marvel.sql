ALTER TABLE "tenants" ADD COLUMN "flat_mates_user_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tenants" ADD CONSTRAINT "tenants_flat_mates_user_id_user_id_fk" FOREIGN KEY ("flat_mates_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
