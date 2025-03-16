"use client";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImageCellProps = Omit<ImageProps, "onClick"> & {
  allowDelete?: boolean;
  onDelete?: () => void;
};

export const ImageCell = ({
  allowDelete = false,
  onDelete,
  ...props
}: ImageCellProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setConfirmDelete(false);
    if (confirmDelete) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [confirmDelete]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpened(false);
      }
    };

    if (isOpened) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpened]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirmDelete) {
      onDelete?.();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Automaticky resetuj potvrzení po 3 sekundách
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <>
      <div className="group relative">
        {allowDelete && onDelete ? (
          <Button
            variant={confirmDelete ? "destructive" : "secondary"}
            size="sm"
            className="absolute top-2 right-2 z-10 opacity-70 transition hover:opacity-100"
            onClick={handleDeleteClick}
          >
            {confirmDelete ? (
              <>
                <AlertTriangle className="mr-1 h-3 w-3" />
                Confirm
              </>
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        ) : null}

        <Image
          {...props}
          onClick={() => setIsOpened(true)}
          alt={props.alt || "Listing image"}
          className={`cursor-pointer rounded-md ${props.className ?? ""}`}
        />
      </div>

      {isOpened
        ? createPortal(
            <div
              className="fixed top-0 left-0 z-[100] flex h-screen w-screen items-center justify-center bg-neutral-800/80"
              onClick={() => setIsOpened(false)}
              onKeyDown={(key) =>
                key.key === "Escape" ? setIsOpened(false) : null
              }
            >
              {isLoading ? (
                <Skeleton className="bg-secondary absolute inset-0 m-auto size-4/12" />
              ) : null}
              <Image
                {...props}
                width={800}
                height={800}
                fill={false}
                alt={props.alt || "Listing image detail"}
                onLoad={() => setIsLoading(false)}
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
};
