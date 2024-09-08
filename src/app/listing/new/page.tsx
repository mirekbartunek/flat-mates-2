import { ErrorPage, PageTop } from "@/modules/layout";
import { db, users } from "@/server/db";
import { eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { NewListingForm } from "@/modules/listings";
import { getServerAuthSession } from "@/server/auth";
const Page = async () => {
  const session = await getServerAuthSession();
  const unauthenticatedTranslations = await getTranslations("Unauthenticated");
  if (!session?.user?.id)
    return (
      <main>
        <ErrorPage
          title={unauthenticatedTranslations("title")}
          desc={unauthenticatedTranslations("description")}
        />
      </main>
    );
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });
  const role = dbUser?.verified_status;
  const unauthorizedTranslations = await getTranslations("Unauthorized");
  if (role === "UNVERIFIED")
    return (
      <main>
        <ErrorPage
          title={unauthorizedTranslations("title")}
          desc={unauthorizedTranslations("description")}
        />
      </main>
    );
  const t = await getTranslations("Create-a-new-listing");
  return (
    <main>
      <PageTop>
        <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
          {t("title")}
        </h1>
      </PageTop>
      <section className="container">
        <NewListingForm />
      </section>
    </main>
  );
};
export default Page;
