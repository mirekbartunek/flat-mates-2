import { ErrorPage, PageTop } from "@/modules/layout";
import { db, users } from "@/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "@/server/auth";
import { NewNewListingForm } from "@/modules/listings/components/NewNewListingForm/NewNewListingForm";
const Page = async () => {
  const session = await getServerAuthSession();

  if (!session?.user.id) {
    return (
      <main>
        <ErrorPage
          title="Unauthenticated"
          desc="You must be authenticated to access this page"
        />
      </main>
    );
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  const role = dbUser?.verified_status;

  if (role === "UNVERIFIED")
    return (
      <main>
        <ErrorPage
          title="Unauthorized"
          desc="You are not authorized to view this page"
        />
      </main>
    );

  return (
    <main>
      <PageTop>
        <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
          Create a new listing
        </h1>
      </PageTop>
      <section className="container">
        <NewNewListingForm />
      </section>
    </main>
  );
};
export default Page;
