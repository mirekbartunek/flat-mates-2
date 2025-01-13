import { Listings } from "@/server/db/types";

type ListingOwnerPageProps = Listings
export const ListingOwnerPage = ({title, description}: ListingOwnerPageProps) => {
return <div>
  cus ownere ty jsi vlastnik {title}
</div>
}
