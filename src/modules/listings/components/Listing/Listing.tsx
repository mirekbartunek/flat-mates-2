import type { Listings } from "@/server/db/types";
import Link from "next/link";

type ListingProps = Listings;
//eslint-disable-next-line no-unused-vars
export const Listing = ({ maxTenants, id, monthly_price }: ListingProps) => {
  return (
    <div
      key={id}
      className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-950"
    >
      <Link href="#" className="block" prefetch={false}>
        image goes here
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">${monthly_price}/month</h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {maxTenants} maximal occupants
          </div>
        </div>
        <p className="truncate text-gray-500 dark:text-gray-400">{"prague"}</p>
      </div>
    </div>
  );
};
