"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type RemoveListingButtonProps = {
  listingId: string;
  listingTitle?: string;
};

export const RemoveListingButton = ({
  listingId,
  listingTitle,
}: RemoveListingButtonProps) => {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const { mutate, isPending } = api.listings.removeListing.useMutation({
    onSuccess: () => {
      toast.success("Listing successfully removed");
      router.replace("/");
    },
    onError: (e) => {
      toast.error("Failed to remove listing", {
        description: "Please try again later",
      });
      console.error(e);
    },
  });

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start"
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirmDialog(true);
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Listing
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-destructive h-5 w-5" />
              Delete Listing
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              {listingTitle ? `"${listingTitle}"` : "this listing"}? This action
              cannot be undone and will remove all associated data including
              reservations and tenant information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => mutate({ listingId })}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Deleting..." : "Delete Listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
