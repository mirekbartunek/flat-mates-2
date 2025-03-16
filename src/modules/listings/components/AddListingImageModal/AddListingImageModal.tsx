import { useState } from "react";
import { DialogPrimitive } from "@/modules/listings/components/DialogPrimitive/DialogPrimitive";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { fileValidator } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadDropzone } from "@/lib/uploadthing";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

interface AddListingImageModalProps {
  listingId: string;
  onImagesAdded?: () => void;
}

export const AddListingImageModal = ({
  listingId,
  onImagesAdded,
}: AddListingImageModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const { mutate: addImagesToListing } =
    api.listings.addImagesToListing.useMutation({
      onSuccess: () => {
        toast.success("Images added successfully!");
        router.refresh();
        onImagesAdded?.();
      },
      onError: (error) => {
        toast.error("Failed to add images to listing", {
          description: error.message,
        });
      },
    });

  return (
    <DialogPrimitive
      dialogTrigger={
        <Card className="flex h-full w-full cursor-pointer items-center justify-center bg-black text-white hover:bg-black/80">
          <div className="flex items-center gap-3">
            <Plus className="h-6 w-6" />
            <span className="text-xl">Add image</span>
          </div>
        </Card>
      }
      dialogTitle="Add listing image"
      dialogDescription="Upload additional images to your listing"
      dialogBody={
        <UploadDropzone
          endpoint="imageUploader"
          config={{
            ...fileValidator,
            cn,
          }}
          appearance={{
            button: buttonVariants({
              variant: "secondary",
            }),
          }}
          onUploadBegin={() => {
            setIsUploading(true);
          }}
          onUploadProgress={(progress) => {
            return (
              <div className="bg-secondary h-2 w-full rounded-full">
                <div
                  className="h-2 rounded-full bg-rose-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            );
          }}
          onClientUploadComplete={(res) => {
            const fileIds = res
              .map((response) => response.serverData.ids)
              .flat();

            addImagesToListing({
              listingId,
              fileIds,
            });

            setIsUploading(false);
            toast.success(`Successfully uploaded ${res.length} images`);
          }}
          onUploadError={(err) => {
            setIsUploading(false);
            if (err.code === "TOO_MANY_FILES") {
              toast.error(
                `Maximum ${fileValidator.maxFileCount} images allowed`
              );
            } else if (err.code === "FILE_LIMIT_EXCEEDED") {
              toast.error(`Files must be under ${fileValidator.maxFileSize}`);
            } else {
              toast.error("Failed to upload images");
            }
          }}
        />
      }
      dialogFooter={
        <div className="text-muted-foreground text-sm">
          {isUploading
            ? "Uploading..."
            : "You can upload up to 10 images per listing"}
        </div>
      }
    />
  );
};
