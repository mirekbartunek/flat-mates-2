import { ListingsPage } from "@/modules/listings";
import { db } from "@/server/db";
import { buttonVariants } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";
import { PageTop } from "@/modules/layout/components";
import { getServerAuthSession } from "@/server/auth";
export default async function Home() {
  const listings = await db.query.listings.findMany();
  const t = await getTranslations("Index");
  const u = await getServerAuthSession();
  return (
    <>
      <PageTop>
        <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg">{t("description")}</p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            className={buttonVariants({
              variant: "default",
            })}
            href="#listings"
          >
            {t("buttons.search-listings")}
          </Link>
          <Link
            className={buttonVariants({
              variant: "secondary",
            })}
            href="/list-your-property"
          >
            {t("buttons.new-listing")}
          </Link>
        </div>
      </PageTop>
      <ListingsPage listings={listings} />

    </>
  );
}
