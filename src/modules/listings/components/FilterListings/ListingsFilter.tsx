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
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Sort filter */}
        <Select
          value={filters.sort}
          onValueChange={(value) => handleFilterChange("sort", value)}
        >
          <SelectTrigger className="w-[180px]">
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

        {/* Capacity filter */}
        <Select
          value={filters.capacity}
          onValueChange={(value) => handleFilterChange("capacity", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All capacities</SelectItem>
            <SelectItem value="1-2">1-2 people</SelectItem>
            <SelectItem value="3-4">3-4 people</SelectItem>
            <SelectItem value="5+">5+ people</SelectItem>
          </SelectContent>
        </Select>

        {/* City filter */}
        <Input
          className="w-[180px]"
          placeholder="Filter by city"
          value={filters.city}
          onChange={(e) => handleFilterChange("city", e.target.value)}
        />

        {/* Location filter */}
        <LocationFilter />
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Price range */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min price"
            className="w-28"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />
          <span>to</span>
          <Input
            type="number"
            placeholder="Max price"
            className="w-28"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />
        </div>

        {/* Rooms filter */}
        <div className="flex items-center gap-2">
          <span>Min rooms:</span>
          <Input
            type="number"
            min="1"
            className="w-20"
            value={filters.minRooms}
            onChange={(e) => handleFilterChange("minRooms", e.target.value)}
          />
        </div>

        {/* Area filter */}
        <div className="flex items-center gap-2">
          <span>Min area:</span>
          <Input
            type="number"
            min="1"
            className="w-20"
            value={filters.minArea}
            onChange={(e) => handleFilterChange("minArea", e.target.value)}
          />
          <span>m²</span>
        </div>

        {/* Filter buttons */}
        <div className="ml-auto flex gap-2">
          {searchParams.toString() ? (
            <Button variant="outline" onClick={clearAllFilters} type="button">
              Clear Filters
            </Button>
          ) : null}
          <Button onClick={applyFilters} type="button">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
