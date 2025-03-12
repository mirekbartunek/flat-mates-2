"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, X } from "lucide-react";
import { Map } from "@/modules/listings/components/Map/Map";

type Coordinates = {
  lat: number;
  lng: number;
};

type LocationInfo = Coordinates & {
  street: string;
  city: string;
  country: string;
  zip: string;
};

export function LocationFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse values from URL with proper fallbacks
  const currentRadius = searchParams.get("radius") ?? "5";
  const currentLat = searchParams.get("lat");
  const currentLng = searchParams.get("lng");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [radiusValue, setRadiusValue] = useState(parseInt(currentRadius));
  const [tempLocation, setTempLocation] = useState<LocationInfo | null>(
    currentLat && currentLng
      ? {
          lat: parseFloat(currentLat),
          lng: parseFloat(currentLng),
          street: searchParams.get("street") ?? "",
          city: searchParams.get("city") ?? "",
          country: searchParams.get("country") ?? "",
          zip: searchParams.get("zip") ?? "",
        }
      : null
  );

  // Check if location filter is active
  const isLocationFilterActive = Boolean(currentLat && currentLng);

  // Handler for location selection from map
  const handleLocationSelect = (location: LocationInfo) => {
    setTempLocation(location);
  };

  // Apply the location filter
  const applyFilter = () => {
    if (!tempLocation) return;

    // Create params from current URL
    const params = new URLSearchParams(searchParams.toString());

    // Update location params
    params.set("lat", tempLocation.lat.toString());
    params.set("lng", tempLocation.lng.toString());
    params.set("radius", radiusValue.toString());
    params.set("street", tempLocation.street);
    params.set("city", tempLocation.city);
    params.set("country", tempLocation.country);
    params.set("zip", tempLocation.zip);

    // Navigate with updated params
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setDialogOpen(false);
  };

  // Clear the location filter
  const clearFilter = () => {
    // Create params from current URL
    const params = new URLSearchParams(searchParams.toString());

    // Remove location params
    params.delete("lat");
    params.delete("lng");
    params.delete("radius");
    params.delete("street");
    params.delete("city");
    params.delete("country");
    params.delete("zip");

    // Navigate with updated params
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setTempLocation(null);
    setDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={isLocationFilterActive ? "default" : "outline"}
            className="flex items-center gap-2"
            type="button"
          >
            <MapPin className="h-4 w-4" />
            {isLocationFilterActive
              ? `Within ${currentRadius}km of ${searchParams.get("city") ?? "location"}`
              : "Location Filter"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Filter by Location</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Map
              onLocationSelect={handleLocationSelect}
              initialLocation={
                tempLocation
                  ? { lat: tempLocation.lat, lng: tempLocation.lng }
                  : undefined
              }
              className="w-full"
            />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Distance radius: {radiusValue} km</span>
                {tempLocation ? (
                  <div className="text-muted-foreground text-sm">
                    {tempLocation.city}, {tempLocation.country}
                  </div>
                ) : null}
              </div>

              <Slider
                min={1}
                max={50}
                step={1}
                value={[radiusValue]}
                onValueChange={(value) => setRadiusValue(value[0] ?? 0)}
              />
            </div>

            <div className="flex justify-end gap-2">
              {isLocationFilterActive ? (
                <Button
                  variant="destructive"
                  onClick={clearFilter}
                  type="button"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Location Filter
                </Button>
              ) : null}
              <Button
                onClick={applyFilter}
                disabled={!tempLocation}
                type="button"
              >
                Apply Filter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isLocationFilterActive ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFilter}
          type="button"
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear location filter</span>
        </Button>
      ) : null}
    </div>
  );
}
