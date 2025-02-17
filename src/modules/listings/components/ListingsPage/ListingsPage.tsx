import type { Listings } from "@/server/db/types";
import { getTranslations } from "next-intl/server";
import { Listing } from "@/modules/listings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type ListingAndImages = Listings & {
  imageUrls: string[];
};
type LandingPageProps = {
  listings: ListingAndImages[];
};

export const ListingsPage = async ({ listings }: LandingPageProps) => {
  const t = await getTranslations("Listings");

  if (listings.length === 0) {
    return (
      <main
        className="flex flex-col items-center justify-center gap-4 py-12"
        id="listings"
      >
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{t("not-found")}</h2>
          <p className="text-muted-foreground mt-2">
            Check back later for new properties
          </p>
        </div>
      </main>
    );
  }

  return (
    <section className="container mx-auto py-12" id="listings">
      <div className="space-y-8">
        {/* Header with filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">{t("title")}</h2>
            <p className="text-muted-foreground mt-1">
              Showing {listings.length} available properties
            </p>
          </div>

          <div className="flex gap-3">
            <Select defaultValue="newest">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="capacity">Capacity</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All capacities</SelectItem>
                <SelectItem value="1-2">1-2 people</SelectItem>
                <SelectItem value="3-4">3-4 people</SelectItem>
                <SelectItem value="5+">5+ people</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <Listing key={listing.id} {...listing}   />
          ))}
        </div>
      </div>
    </section>
  );
};
