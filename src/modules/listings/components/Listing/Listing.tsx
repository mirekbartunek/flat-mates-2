import type { Listings } from "@/server/db/types";
import Link from "next/link";
import { ImageCarousel } from "@/modules/listings/components/ImageCarousel/ImageCarousel";
import { MapPin, Users } from "lucide-react";
import { isNewListing } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

type ListingProps = Listings & {
  imageUrls: string[];
};

export const Listing = ({
  maxTenants,
  id,
  monthly_price,
  imageUrls,
  title,
  createdAt,
  current_capacity,
  description,
}: ListingProps) => {
  return (
    <div className="group overflow-hidden rounded-xl bg-card transition-all hover:shadow-lg">
      <Link href={`/listing/${id}`} className="flex h-full flex-col">
        <div className="relative aspect-video w-full">
          <ImageCarousel
            imageUrls={imageUrls}
            showDelete={false}
            animate={true}
          />
          {isNewListing(createdAt) ? (
            <div className="absolute left-4 top-4">
              <Badge className="bg-green-500/80 text-white">New</Badge>
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Badge variant="secondary" className="bg-white/90 text-black">
              {monthly_price.toLocaleString()} CZK/month
            </Badge>
          </div>
        </div>

        <div className="flex flex-grow flex-col p-4">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold transition-colors group-hover:text-primary">
            {title}
          </h3>

          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {current_capacity}/{maxTenants} tenants
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>Prague</span>
              </div>
            </div>

            <Progress
              value={(current_capacity / maxTenants) * 100}
              className="h-1.5"
            />
          </div>
        </div>
      </Link>
    </div>
  );
};
