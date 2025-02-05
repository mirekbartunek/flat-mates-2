"use client";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Skeleton } from "@/components/ui/skeleton";

type ImageCellProps = Omit<ImageProps, "onClick">;

export const ImageCell = ({ ...props }: ImageCellProps) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
    <>
      <Image {...props} onClick={() => setIsOpened(true)} alt="Listing image" />
      {isOpened
        ? createPortal(
            <div
              className="fixed top-1 right-1 z-50 flex h-screen w-screen items-center justify-center bg-neutral-800/80"
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
                width={600}
                height={600}
                alt="Listing image detail"
                onLoad={() => setIsLoading(false)}
              />
            </div>,
            document.body
          )
        : null}
    </>
  );
};
