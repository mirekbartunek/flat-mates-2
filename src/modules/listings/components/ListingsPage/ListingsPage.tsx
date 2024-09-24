import type { Listings } from "@/server/db/types";
import { getTranslations } from "next-intl/server";

type LandingPageProps = {
  listings: Listings[];
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
    <main className="flex flex-col items-center justify-center" id="listings">
      <div>
        <h1>{t("title")}</h1>
      </div>
      <pre className="max-w-full">{JSON.stringify(listings, null, 2)}</pre>
    </main>
  );
};
