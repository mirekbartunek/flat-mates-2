import type { Listings } from "@/server/db/types";
import { Listing, ListingsFilter } from "@/modules/listings";
import { ResetHomePageParams } from "@/modules/listings/components/ResetHomePageParams/ResetHomePageParams";

type ListingAndImages = Listings & {
  imageUrls: string[];
};

type LandingPageProps = {
  listings: ListingAndImages[];
};

export const ListingsPage = async ({ listings }: LandingPageProps) => {
  if (listings.length === 0) {
    return (
      <main
        className="flex flex-col items-center justify-center gap-4 py-12"
        id="listings"
      >
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-semibold">Look for your new housing</h2>
          <p className="text-muted-foreground mt-2">
            Check back later for new properties
          </p>
          <ResetHomePageParams />
        </div>
      </main>
    );
  }

  return (
    <section className="container mx-auto py-12" id="listings">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Available listings</h2>
            <p className="text-muted-foreground mt-1">
              Showing {listings.length} available properties
            </p>
          </div>

          <div className="w-full md:w-auto">
            <ListingsFilter />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <Listing key={listing.id} {...listing} />
          ))}
        </div>
      </div>
    </section>
  );
};
