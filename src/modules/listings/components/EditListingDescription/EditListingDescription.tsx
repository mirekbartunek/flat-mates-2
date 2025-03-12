"use client";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type EditListingDescriptionProps = {
  currentDescription: string;
  listingId: string;
};

export const EditListingDescription = ({
  currentDescription,
  listingId,
}: EditListingDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(currentDescription);

  const { mutate, isPending } = api.listings.editListing.useMutation({
    onSuccess: () => {
      toast.success("Description updated");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update description");
      setDescription(currentDescription);
    },
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDescription(currentDescription);
        setIsEditing(false);
      }
    };

    document.addEventListener("keydown", handleEsc as EventListener);
    return () =>
      document.removeEventListener("keydown", handleEsc as EventListener);
  }, [currentDescription]);

  const handleSubmit = () => {
    if (description !== currentDescription && !isPending) {
      mutate({ id: listingId, description });
    }
  };

  if (!isEditing) {
    return (
      <div className="group relative flex items-start gap-2">
        <p className="text-muted-foreground mt-2 max-w-3xl">{description}</p>
        <button
          onClick={() => setIsEditing(true)}
          className="text-muted-foreground hover:text-primary mt-2 hidden transition-colors group-hover:block"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="resize-vertical min-h-[100px]"
        placeholder="Describe your property..."
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          disabled={isPending || description === currentDescription}
          onClick={handleSubmit}
        >
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDescription(currentDescription);
            setIsEditing(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
