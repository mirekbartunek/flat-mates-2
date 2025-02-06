"use client";
import { useState, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

type EditListingTitleProps = {
  currentTitle: string;
  listingId: string;
};

export const EditListingTitle = ({ currentTitle, listingId }: EditListingTitleProps) => {
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
    }
  });

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTitle(currentTitle);
        setIsEditing(false);
      }
    };

    document.addEventListener('keydown', handleEsc as unknown as EventListener);
    return () => document.removeEventListener('keydown', handleEsc as unknown as EventListener);
  }, [currentTitle]);

  const handleSubmit = () => {
    if (title !== currentTitle && !isPending) {
      mutate({ id: listingId, title });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isEditing) {
    return (
      <div className="group relative inline-flex items-center gap-2">
        <h1 className="text-4xl font-bold">{title}</h1>
        <button
          onClick={() => setIsEditing(true)}
          className="hidden group-hover:block text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-4xl font-bold h-auto py-1 max-w-xl"
        autoFocus
      />
      <Button
        size="sm"
        disabled={isPending || title === currentTitle}
        onClick={handleSubmit}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setTitle(currentTitle);
          setIsEditing(false);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
