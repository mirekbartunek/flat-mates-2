import { ListingOwnerPage } from "@/modules/listings/components/ListingOwnerPage/ListingOwnerPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { getTranslations } from "next-intl/server";
import { ErrorPage } from "@/modules/layout";
const Page = async ({ params }: { params: Promise<{ listingId: string }> }) => {
  const { listingId } = await params;
  const details = await api.listings.getListingById({
    listingId: listingId,
  });

  const unauthenticatedTranslations = await getTranslations("Unauthenticated");
  const unauthorizedTranslations = await getTranslations("Unauthorized");

  const user = await getServerAuthSession();
  const mappedListing = {
    ...details,
    tenants: details.tenants.map((t) => ({
      tenant: t.tenant,
    })),
  };
  if (!user)
    return (
      <ErrorPage
        title={unauthenticatedTranslations("title")}
        desc={unauthenticatedTranslations("description")}
      />
    );
  if (!details) {
    return notFound();
  }

  if (user.user.id !== details.userId) {
    return (
      <ErrorPage
        title={unauthorizedTranslations("title")}
        desc={unauthorizedTranslations("description")}
      />
    );
  }

  return <ListingOwnerPage {...mappedListing} />;
};

export default Page;
