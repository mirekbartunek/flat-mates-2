import { Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RemoveListingButton } from "@/modules/listings/components/RemoveListingButton/RemoveListingButton";
import { buttonVariants } from "@/components/ui/button";

type ListingAdminActionsProps = {
  listingId: string;
};

export const ListingAdminActions = ({
  listingId,
}: ListingAdminActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({
          variant: "outline",
        })}
      >
        <Shield />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Admin actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <RemoveListingButton listingId={listingId} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
