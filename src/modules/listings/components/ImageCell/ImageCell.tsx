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
              className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/90 p-4 md:p-8"
              onClick={() => setIsOpened(false)}
            >
              <div className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-lg">
                {isLoading ? (
                  <Skeleton className="absolute inset-0 m-auto h-20 w-20" />
                ) : null}
                <Image
                  {...props}
                  width={1200}
                  height={1200}
                  sizes="(max-width: 768px) 90vw, 70vw"
                  className="max-h-[85vh] max-w-[85vw] object-contain"
                  alt={props.alt || "Listing image detail"}
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
};
