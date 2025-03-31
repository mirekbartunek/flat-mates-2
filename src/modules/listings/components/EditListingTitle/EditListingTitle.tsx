"use client";
import { useState, useEffect, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type EditListingTitleProps = {
  currentTitle: string;
  listingId: string;
};

export const EditListingTitle = ({
  currentTitle,
  listingId,
}: EditListingTitleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(currentTitle);

  const { mutate, isPending } = api.listings.editListing.useMutation({
    onSuccess: () => {
      toast.success("Title updated");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update title");
      setTitle(currentTitle);
    },
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTitle(currentTitle);
        setIsEditing(false);
      }
    };

    document.addEventListener("keydown", handleEsc as unknown as EventListener);
    return () =>
      document.removeEventListener(
        "keydown",
        handleEsc as unknown as EventListener
      );
  }, [currentTitle]);

  const handleSubmit = () => {
    if (title !== currentTitle && !isPending) {
      mutate({ id: listingId, title });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTitleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  if (!isEditing) {
    return (
      <div className="group relative flex w-full items-start gap-2">
        <h1
          className="cursor-pointer pr-8 text-2xl font-bold sm:text-3xl md:text-4xl"
          onClick={handleTitleClick}
        >
          {title}
        </h1>
        <button
          onClick={() => setIsEditing(true)}
          className="text-muted-foreground hover:text-primary absolute top-1 right-0 md:hidden md:group-hover:block"
          aria-label="Edit title"
        >
          <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-auto w-full py-1 text-xl font-bold sm:text-2xl md:text-4xl"
        autoFocus
      />
      <div className="mt-2 flex gap-2 sm:mt-0">
        <Button
          size="sm"
          disabled={isPending || title === currentTitle}
          onClick={handleSubmit}
        >
          <Check className="mr-1 h-4 w-4" /> Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setTitle(currentTitle);
            setIsEditing(false);
          }}
        >
          <X className="mr-1 h-4 w-4" /> Cancel
        </Button>
      </div>
    </div>
  );
};
