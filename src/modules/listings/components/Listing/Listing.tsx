import type { Listings } from "@/server/db/types";
import Link from "next/link";
import { ImageCarousel } from "@/modules/listings/components/ImageCarousel/ImageCarousel";
import { MapPin, Users } from "lucide-react";
import { isNewListing } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
}: ListingProps) => {
  return (
    <div className="group min-w-72 overflow-hidden rounded-xl bg-secondary shadow-md transition-all hover:shadow-lg">
      <Link href={`/listing/${id}`} className="flex h-full flex-col">
        <div className="relative aspect-square w-full">
          <ImageCarousel
            imageUrls={imageUrls}
            showDelete={false}
            animate={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <Badge className="flex max-w-72 items-center overflow-hidden break-all text-sm">
              {monthly_price.toLocaleString()}CZK
            </Badge>
            <Badge className="flex items-center text-sm">
              <Users className="mr-1 h-4 w-4" />
              {maxTenants}
            </Badge>
          </div>
        </div>
        <div className="flex flex-grow flex-col p-4">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold dark:text-foreground">
            {title}
          </h3>
          <p className="flex items-start text-sm text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-2">Prague</span>
          </p>
          <div className="mt-auto flex items-center justify-between pt-4 dark:text-secondary-foreground">
            <span className="text-sm">Capacity</span>{" "}
            {/*todo: add book capacity once done */}
            {isNewListing(createdAt) ? (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-200">
                New Listing
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </div>
  );
};
