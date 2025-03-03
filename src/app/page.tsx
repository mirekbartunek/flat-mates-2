import { ListingsPage } from "@/modules/listings";
import { db, listings } from "@/server/db";
import { buttonVariants } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";
import { PageTop } from "@/modules/layout/components";
import { Home as HomeIcon, Search, Plus, ArrowRight } from "lucide-react";
import { eq } from "drizzle-orm";

export default async function Home() {
  const availableListings = await db.query.listings.findMany({
    with: {
      files: {
        with: {
          file: true,
        },
      },
    }, where: eq(listings.listing_status, "PUBLIC")

  });

  const mappedListings = availableListings.map((listing) => ({
    ...listing,
    imageUrls: listing.files.map((f) => f.file?.url).filter(Boolean),
  }));

  const t = await getTranslations("Index");

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_25%_at_50%_50%,rgba(220,38,38,0.1),transparent)]" />

        <PageTop>
          <div className="flex items-center justify-center gap-2">
            <HomeIcon className="h-12 w-12 text-rose-500" />
            <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
          </div>

            <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg">
            {t("description")}
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "group",
              })}
              href="#listings"
            >
              <Search className="mr-2 h-5 w-5" />
              {t("buttons.search-listings")}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "group",
              })}
              href="/list-your-property"
            >
              <Plus className="mr-2 h-5 w-5 transition-transform duration-500 ease-in-out group-hover:rotate-[180deg]" />
              {t("buttons.new-listing")}
            </Link>
          </div>

          <div className="mt-16 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-rose-500">
                {availableListings.length}+
              </div>
              <div className="text-muted-foreground mt-2 text-center text-sm">
                Available Properties
              </div>
            </div>
          </div>
        </PageTop>
      </div>

      <div className="bg-secondary/30 border-t">
        <div className="container mx-auto py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <Search className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Easy Search</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Find your perfect home with our advanced search filters
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <Plus className="h-6 w-6 text-rose-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Easy Listing</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                List your property in minutes
              </p>
            </div>
          </div>
        </div>
      </div>

      <ListingsPage listings={mappedListings} />
    </>
  );
}
