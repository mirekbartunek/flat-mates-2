"use client";
import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Coords = {
  lat: number;
  lng: number;
}

type Location = {
  street: string;
  city: string;
  country: string;
  zip: string;
} & Coords;

type MapProps = {
  onLocationSelect: (location: Location) => void;
  initialLocation?: Coords;
  className?: string;
};

export const Map = ({ onLocationSelect, initialLocation, className }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  const [term, setTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { mutate: searchLocation, isPending: isSearchLoading } = api.location.getCoordinatesByTerm.useMutation({
    onSuccess: (res) => {
      const hit = res.at(0);
      if (!hit) {
        toast.error("Location not found");
        return;
      }
      const lng = hit.coordinates.at(0);
      const lat = hit.coordinates.at(1);
      if (!lng || !lat) {
        toast.error("Invalid coordinates");
        return;
      }
      marker.current?.setLngLat([lng, lat]);
      map.current?.setCenter([lng, lat]);
      map.current?.setZoom(15);
      setIsSearching(false);
    },
    onError: () => {
      toast.error("Failed to search location");
      setIsSearching(false);
    }
  });

  const { data: mapStyle } = api.location.getMapStyle.useQuery(undefined, {
    staleTime: Infinity,
    experimental_prefetchInRender: true,
  });

  const { mutateAsync: getLocation, isPending: isLocationLoading } = api.location.getAdressByCoords.useMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    setIsSearching(true);
    searchLocation({ term });
  };

  const handleLocationSelect = async (lng: number, lat: number) => {
    if (!marker.current || !map.current) return;

    try {
      marker.current.setLngLat([lng, lat]).addTo(map.current);
      const res = await getLocation({ lat, long: lng });

      onLocationSelect({
        lat,
        lng,
        city: res.city,
        country: res.country,
        street: res.street,
        zip: res.zip,
      });
    } catch (error) {
      toast.error("Failed to get address details");
    }
  };

  useEffect(() => {
    if (!map.current && mapStyle && mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: initialLocation
          ? [initialLocation.lng, initialLocation.lat]
          : [14.4378, 50.0755], // prague
        zoom: 12,
        maxZoom: 17,
        minZoom: 8,
      });

      map.current.addControl(new maplibregl.NavigationControl());

      marker.current = new maplibregl.Marker({
        draggable: true,
        color: "#e11d48"
      });

      if (initialLocation) {
        marker.current
          .setLngLat([initialLocation.lng, initialLocation.lat])
          .addTo(map.current);
      }

      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        handleLocationSelect(lng, lat);
      });

      marker.current.on("dragend", () => {
        if (!marker.current) return;
        const { lng, lat } = marker.current.getLngLat();
        handleLocationSelect(lng, lat);
      });
    }
  }, [mapStyle, initialLocation]);

  const isLoading = isSearchLoading || isLocationLoading;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <div ref={mapContainer} className={cn(
          "h-[400px] w-full rounded-lg",
          isLoading && "brightness-75 pointer-events-none"
        )} />
        {isLoading ? <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
          </div> : null}
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search location..."
            className="pl-9"
          />
          {term ? <button
              type="button"
              onClick={() => setTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button> : null}
        </div>
        <Button type="submit" disabled={isLoading || !term.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </form>
    </div>
  );
};

export default Map;
