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
};
export const ImageCarousel = ({
  imageUrls,
  showDelete = false,
  animate = false,
  showControls = false,
}: ImageCarouselProps) => {
  const [showActions, setShowActions] = useState<boolean>(false);
  return (
    <Carousel
      className="mx-auto w-full"
      plugins={animate ? [Autoplay({ delay: 5000 })] : undefined}
    >
      <CarouselContent>
        {imageUrls.map((url) => (
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
              <Trash2
                className="absolute right-1 top-1 z-20 stroke-neutral-300"
                width={20}
                height={20}
                onClick={() => alert("Deleted")}
              />
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
