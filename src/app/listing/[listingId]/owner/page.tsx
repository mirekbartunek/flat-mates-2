import { ListingOwnerPage } from "@/modules/listings/components/ListingOwnerPage/ListingOwnerPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
const Page = async ({ params }: { params: { listingId: string } }) => {
  const details = await api.listings.getListingById({
    listingId: params.listingId
  });
  if (!details) {
    return notFound();
  }
  return <ListingOwnerPage {...details} />;
};

export default Page;
