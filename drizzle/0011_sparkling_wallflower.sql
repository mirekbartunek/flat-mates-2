ALTER TABLE "listing_reservations" DROP CONSTRAINT "listing_reservations_listing_id_listings_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listing_reservations" ADD CONSTRAINT "listing_reservations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
