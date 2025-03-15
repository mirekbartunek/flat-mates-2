import { ListingOwnerPage } from "@/modules/listings/components/ListingOwnerPage/ListingOwnerPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { ErrorPage } from "@/modules/layout";
const Page = async ({ params }: { params: Promise<{ listingId: string }> }) => {
  const { listingId } = await params;
  const details = await api.listings.getListingById({
    listingId: listingId,
  });

  const user = await getServerAuthSession();
  const mappedListing = {
    ...details,
    tenants: details.tenants.map((t) => ({
      tenant: t.tenant,
    })),
  };
  if (!user)
    return (
      <main>
        <ErrorPage
          title="Unauthenticated"
          desc="You must be authenticated to access this page"
        />
      </main>
    );
  if (!details) {
    return notFound();
  }

  if (user.user.id !== details.userId) {
    return (
      <main>
        <ErrorPage
          title="Unauthorized"
          desc="You are not authorized to view this page"
        />
      </main>
    );
  }

  return <ListingOwnerPage {...mappedListing} />;
};

export default Page;
