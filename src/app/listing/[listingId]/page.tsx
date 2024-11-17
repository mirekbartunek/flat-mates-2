import { ListingDetailPage } from "@/modules/listings/components/ListingDetailPage/ListingDetailPage";

const Page = async (props: { params: Promise<{ listingId: string }> }) => {
  const params = await props.params;
  return <ListingDetailPage listingId={params.listingId} />;
};
export default Page;
