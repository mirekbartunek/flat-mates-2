import { ErrorPage, PageTop } from "@/modules/layout";
import { getServerAuthSession } from "@/server/auth";
import { NewListingForm } from "@/modules/listings/components/NewListingForm/NewListingForm";
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

  if (session.user.verified_status === "UNVERIFIED")
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
        <NewListingForm />
      </section>
    </main>
  );
};
export default Page;
