import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Home, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  Files,
  ListingFiles,
  Listings,
  Reservations,
} from "@/server/db/types";

type ReservationWithListing = Reservations & {
  listing: Listings & {
    files: Array<
      ListingFiles & {
        file: Files | null;
      }
    >;
  };
};

const ReservationStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="border-yellow-200 bg-yellow-50 text-yellow-700"
        >
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
    case "accepted":
      return (
        <Badge
          variant="outline"
          className="border-green-200 bg-green-50 text-green-700"
        >
          <CheckCircle className="mr-1 h-3 w-3" /> Accepted
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="border-red-200 bg-red-50 text-red-700"
        >
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const ReservationPreviewCard = ({
  reservation,
}: {
  reservation: ReservationWithListing;
}) => {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md">
      <div className="relative h-48 w-full">
        {reservation.listing.files[0]?.file?.url ? (
          <Image
            src={reservation.listing.files[0].file.url}
            alt={reservation.listing.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <ReservationStatusBadge status={reservation.status} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-medium">
          {reservation.listing.title}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {reservation.listing.street}, {reservation.listing.city}
        </p>
        <div className="text-muted-foreground mt-3 flex items-center justify-between text-sm">
          <span>
            {new Intl.NumberFormat("cs-CZ", {
              style: "currency",
              currency: "CZK",
            }).format(reservation.listing.monthly_price)}
            /month
          </span>
          <span>
            Requested{" "}
            {formatDistanceToNow(new Date(reservation.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="mt-4 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href={`/listing/${reservation.listing.id}`}>
              View listing
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
