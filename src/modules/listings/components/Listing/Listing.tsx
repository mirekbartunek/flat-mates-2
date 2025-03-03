import type { Listings } from "@/server/db/types";
import Link from "next/link";
import { ImageCarousel } from "@/modules/listings/components/ImageCarousel/ImageCarousel";
import { MapPin, Users } from "lucide-react";
import { isNewListing } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ListingProps = Listings & {
  imageUrls: string[];
  mode?: "OWNER_VIEW" | "USER_VIEW";
};

export const Listing = ({
  max_tenants,
  id,
  monthly_price,
  imageUrls,
  title,
  createdAt,
  description,
  mode = "USER_VIEW",
}: ListingProps) => {
  return (
    <div className="group bg-card overflow-hidden rounded-xl transition-all hover:shadow-lg">
      <Link href={`/listing/${id}`} className="flex h-full flex-col">
        <div className="relative aspect-video w-full">
          <ImageCarousel
            imageUrls={imageUrls}
            showDelete={false}
            animate={true}
          />
          {isNewListing(createdAt) ? (
            <div className="absolute top-4 left-4">
              <Badge className="bg-green-500/80 text-white">New</Badge>
            </div>
          ) : null}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/90 text-black">
              {monthly_price.toLocaleString()} CZK/month
            </Badge>
          </div>
        </div>

        <div className="flex grow flex-col p-4">
          <h3 className="group-hover:text-primary mb-2 line-clamp-2 text-lg font-semibold transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground mb-4 line-clamp-2 text-sm">
            {description}
          </p>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground h-4 w-4" />
                  <span>{max_tenants} tenants max</span>
                </div>
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span>Prague</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};
