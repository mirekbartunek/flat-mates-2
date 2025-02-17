import type { ListingStatus } from "@/server/db/enums";

export const displayListingStatusDescription = (status: ListingStatus) => {
  switch (status) {
    case "HIDDEN":
      return "Your listing is not visible by anyone.";
    case "PRIVATE":
      return "Your listing is visible by link only";
    case "PUBLIC":
      return "Your listing is visible for everyone"
  }
}
