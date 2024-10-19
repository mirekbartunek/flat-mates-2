import type { Listings } from "@/server/db/types";
import { getTranslations } from "next-intl/server";
import { Listing } from "@/modules/listings";
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
      <main className="flex flex-col items-center justify-center" id="listings">
        <p>{t("not-found")}</p>
      </main>
    );
  }
  return (
    <main
      className="m-auto flex w-10/12 flex-col items-center justify-center"
      id="listings"
    >
      <div>
        <h1>{t("title")}</h1>
      </div>
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
        {listings.map((listing) => (
          <Listing
            {...listing}
            imageUrls={listing.imageUrls}
            key={listing.id}
          />
        ))}
      </div>
    </main>
  );
};
