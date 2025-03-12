"use client";
import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import maplibregl from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export const ListingLocation = ({
  coordinates: [lng, lat],
}: {
  coordinates: [number, number];
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  const { data: mapStyle } = api.location.getMapStyle.useQuery(undefined, {
    staleTime: Infinity,
  });

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (!map.current && mapStyle && mapContainer.current) {
      const mapInstance = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [lng, lat],
        zoom: 15,
        interactive: false,
      });

      mapInstance.on("load", () => {
        map.current = mapInstance;

        marker.current = new maplibregl.Marker({
          color: "#e11d48",
          scale: 1.5,
        })
          .setLngLat([lng, lat])
          .addTo(mapInstance);
      });
    }
  }, [mapStyle, lng, lat]);

  return (
    <div className="group relative overflow-hidden rounded-lg border">
      <div ref={mapContainer} className="h-[300px] w-full" />
      <Button
        onClick={openInGoogleMaps}
        className="absolute right-4 bottom-4 opacity-90 shadow-md hover:opacity-100"
        size="sm"
      >
        <MapPin className="mr-2 h-4 w-4" />
        Open in Google Maps
      </Button>
    </div>
  );
};
