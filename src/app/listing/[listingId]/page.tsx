import { ListingDetailPage } from "@/modules/listings/components/ListingDetailPage/ListingDetailPage";

const Page = ({ params }: { params: { listingId: string } }) => {
  return <ListingDetailPage listingId={params.listingId} />;
};
export default Page;
