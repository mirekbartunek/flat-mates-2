"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListingStatus, listingStatusEnumValues } from "@/server/db/enums";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type EditListingStatusProps = {
  currentStatus: ListingStatus;
  listingId: string;
};

export const EditListingStatus = ({ currentStatus, listingId }: EditListingStatusProps) => {
  const [isChanging, setIsChanging] = useState(false);
  const router = useRouter();
  const { mutate } = api.listings.editListing.useMutation({
    onMutate: () => {
      setIsChanging(true);
    },
    onSuccess: () => {
      router.refresh();
      toast.success("Listing status updated");
      setIsChanging(false);
    },
    onError: () => {
      toast.error("Failed to update listing status");
      setIsChanging(false);
    }
  });

  return (
    <Select
      defaultValue={currentStatus}
      disabled={isChanging}
      onValueChange={(value: ListingStatus) => {
        mutate({
          id: listingId,
          listing_status: value
        });
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select visibility">
          {isChanging ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </div>
          ) : (
            currentStatus
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {listingStatusEnumValues.map((status) => (
          <SelectItem
            key={status}
            value={status}
            className="flex items-center gap-2"
          >
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
