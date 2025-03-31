import { and, eq, gte, lte, like, desc, asc } from "drizzle-orm";
import { db, listings } from "@/server/db";
import type { Listings } from "@/server/db/types";

type ListingWithImages = Listings & {
  imageUrls: string[];
};

type ListingWithDistance = ListingWithImages & {
  distance: number;
};

export async function getFilteredListings(
  searchParams: Record<string, string | string[] | undefined>
) {
  const whereConditions = [eq(listings.listing_status, "PUBLIC")];

  if (searchParams.capacity && searchParams.capacity !== "all") {
    switch (searchParams.capacity) {
      case "1-2":
        whereConditions.push(gte(listings.max_tenants, 1));
        whereConditions.push(lte(listings.max_tenants, 2));
        break;
      case "3-4":
        whereConditions.push(gte(listings.max_tenants, 3));
        whereConditions.push(lte(listings.max_tenants, 4));
        break;
      case "5+":
        whereConditions.push(gte(listings.max_tenants, 5));
        break;
    }
  }

  if (searchParams.city) {
    whereConditions.push(like(listings.city, `%${String(searchParams.city)}%`));
  }

  if (searchParams.minPrice) {
    whereConditions.push(
      gte(listings.monthly_price, parseInt(String(searchParams.minPrice)))
    );
  }
  if (searchParams.maxPrice) {
    whereConditions.push(
      lte(listings.monthly_price, parseInt(String(searchParams.maxPrice)))
    );
  }

  if (searchParams.minRooms) {
    whereConditions.push(
      gte(listings.rooms, parseInt(String(searchParams.minRooms)))
    );
  }

  if (searchParams.minArea) {
    whereConditions.push(
      gte(listings.area, parseInt(String(searchParams.minArea)))
    );
  }

  const sort = searchParams.sort ? String(searchParams.sort) : "newest";
  let orderBy;
  switch (sort) {
    case "newest":
      orderBy = [desc(listings.createdAt)];
      break;
    case "price-asc":
      orderBy = [asc(listings.monthly_price)];
      break;
    case "price-desc":
      orderBy = [desc(listings.monthly_price)];
      break;
    case "capacity":
      orderBy = [desc(listings.max_tenants)];
      break;
    case "area":
      orderBy = [desc(listings.area)];
      break;
    case "rooms":
      orderBy = [desc(listings.rooms)];
      break;
    default:
      orderBy = [desc(listings.createdAt)];
  }

  const allListings = await db.query.listings.findMany({
    where: and(...whereConditions),
    with: {
      files: {
        with: {
          file: true,
        },
      },
    },
    orderBy: orderBy,
  });

  const mappedListings: ListingWithImages[] = allListings.map((listing) => {
    const imageUrls: string[] = [];
    for (const fileRel of listing.files) {
      if (fileRel.file?.url) {
        imageUrls.push(fileRel.file.url);
      }
    }

    return {
      ...listing,
      imageUrls,
    };
  });

  const lat = searchParams.lat ? parseFloat(String(searchParams.lat)) : null;
  const lng = searchParams.lng ? parseFloat(String(searchParams.lng)) : null;
  const radius = searchParams.radius
    ? parseFloat(String(searchParams.radius))
    : 5;

  if (lat !== null && lng !== null) {
    const withDistance = mappedListings.map((listing) => {
      const listingLng = listing.location[0];
      const listingLat = listing.location[1];

      const distance = calculateDistance(lat, lng, listingLat, listingLng);

      return {
        ...listing,
        distance,
      } as ListingWithDistance;
    });
    console.dir(withDistance, {
      depth: Infinity,
    });

    return withDistance
      .filter((listing) => listing.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }

  return mappedListings;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Poloměr Země v km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
