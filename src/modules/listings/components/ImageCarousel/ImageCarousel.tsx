"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import Autoplay from "embla-carousel-autoplay";

type ImageCarouselProps = {
  imageUrls: string[];
  showDelete?: boolean;
  animate?: boolean;
  showControls?: boolean;
  onDelete?: (index: number) => void;
};

export const ImageCarousel = ({
  imageUrls,
  showDelete = false,
  animate = false,
  showControls = false,
  onDelete,
}: ImageCarouselProps) => {
  const [showActions, setShowActions] = useState<boolean>(false);

  return (
    <Carousel
      className="mx-auto w-full"
      plugins={animate ? [Autoplay({ delay: 5000 })] : undefined}
    >
      <CarouselContent>
        {imageUrls.map((url, index) => (
          <CarouselItem key={url} className="relative aspect-square">
            <Image
              src={url}
              alt="Listing Image"
              fill
              onMouseEnter={() => setShowActions(true)}
              onMouseLeave={() => setShowActions(false)}
              className="rounded-md object-cover"
            />
            {showDelete && showActions ? (
              <button
                onClick={() => onDelete?.(index)}
                className="absolute top-2 right-2 z-20 rounded-full bg-black/50 p-2 transition-colors hover:bg-black/70"
                aria-label="Delete image"
              >
                <Trash2 className="stroke-white" width={20} height={20} />
              </button>
            ) : null}
          </CarouselItem>
        ))}
      </CarouselContent>
      {showControls ? (
        <>
          <CarouselPrevious type="button" />
          <CarouselNext type="button" />
        </>
      ) : null}
    </Carousel>
  );
};
