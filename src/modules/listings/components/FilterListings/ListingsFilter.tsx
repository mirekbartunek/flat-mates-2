"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationFilter } from "@/modules/listings/components/ListingLocationFilter/ListingLocationFilter";

export function ListingsFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    sort: searchParams.get("sort") ?? "newest",
    capacity: searchParams.get("capacity") ?? "all",
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minRooms: searchParams.get("minRooms") ?? "",
    minArea: searchParams.get("minArea") ?? "",
    city: searchParams.get("city") ?? "",
  });

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    // Update params with our form values
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    // Clear only our form filters, preserve location
    const params = new URLSearchParams();

    ["lat", "lng", "radius", "street", "city", "country", "zip"].forEach(
      (param) => {
        const value = searchParams.get(param);
        if (value) params.set(param, value);
      }
    );

    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    setFilters({
      sort: "newest",
      capacity: "all",
      minPrice: "",
      maxPrice: "",
      minRooms: "",
      minArea: "",
      city: "",
    });
  };

  return (
    <div className="mb-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Select
          value={filters.sort}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="capacity">Capacity</SelectItem>
            <SelectItem value="area">Area (m²)</SelectItem>
            <SelectItem value="rooms">Number of Rooms</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.capacity}
          onValueChange={(value) => handleFilterChange("capacity", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All capacities</SelectItem>
            <SelectItem value="1-2">1-2 people</SelectItem>
            <SelectItem value="3-4">3-4 people</SelectItem>
            <SelectItem value="5+">5+ people</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="w-full sm:w-[180px]"
          placeholder="Filter by city"
          value={filters.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
        />

        <div className="w-full sm:w-auto">
          <LocationFilter />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:flex sm:flex-wrap sm:items-center">
        <div className="flex items-center">
          <div className="mr-2 w-20 text-sm">Price range:</div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              className="w-[80px]"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <span className="text-sm">to</span>
            <Input
              type="number"
              placeholder="Max"
              className="w-[80px]"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-2 w-20 text-sm">Min rooms:</div>
          <Input
            type="number"
            min="1"
            className="w-[80px]"
            value={filters.minRooms}
            onChange={(e) => handleFilterChange("minRooms", e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <div className="mr-2 w-20 text-sm">Min area:</div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              className="w-[80px]"
              value={filters.minArea}
              onChange={(e) => handleFilterChange("minArea", e.target.value)}
            />
            <span className="text-sm">m²</span>
          </div>
        </div>

        <div className="flex gap-2 sm:ml-auto">
          {searchParams.toString() ? (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              type="button"
              className="flex-1 sm:flex-none"
            >
              Clear Filters
            </Button>
          ) : null}
          <Button
            onClick={applyFilters}
            type="button"
            className="flex-1 sm:flex-none"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
