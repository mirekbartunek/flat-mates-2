"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Home, Calendar, DollarSign, Trash2, Eye } from "lucide-react";

import type { InferSelectModel } from "drizzle-orm";
import {
  type files,
  type listingReservations,
  type listings,
  type tenants,
  type users,
} from "@/server/db";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { EditListingPrice } from "@/modules/listings/components/EditListingPrice/EditListingPrice";
import { AddForeignTenantDialog } from "@/modules/listings/components/AddForeignTenantDialog/AddForeignTenantDialog";
import { EditListingTitle } from "@/modules/listings/components/EditListingTitle/EditListingTitle";
import { EditListingDescription } from "@/modules/listings/components/EditListingDescription/EditListingDescription";
import { EditListingCapacity } from "@/modules/listings/components/EditListingCapacity/EditListingCapacity";
import { EditListingStatus } from "@/modules/listings/components/EditListingStatus/EditListingStatus";
import { displayListingStatusDescription } from "@/modules/listings/utils/displayListingStatusDescription";
import { ReservationCard } from "@/modules/listings/components/ReservationCard/ReservationCard";
import { ImageCell } from "@/modules/listings/components/ImageCell/ImageCell";
import { AddListingImageModal } from "@/modules/listings/components/AddListingImageModal/AddListingImageModal";
import { MAX_FILE_COUNT } from "@/lib/constants";

type ListingWithRelations = InferSelectModel<typeof listings> & {
  reservations: (InferSelectModel<typeof listingReservations> & {
    user: InferSelectModel<typeof users>;
  })[];
  creator: InferSelectModel<typeof users>;
  tenants: {
    tenant: InferSelectModel<typeof tenants>;
  }[];
  files: {
    id: string;
    listingId: string;
    fileId: string;
    file: InferSelectModel<typeof files>;
  }[];
};

type ListingOwnerPageProps = ListingWithRelations;

export const ListingOwnerPage = ({
  title,
  description,
  max_tenants,
  monthly_price,
  creator,
  tenants,
  id,
  reservations,
  listing_status,
  files,
}: ListingOwnerPageProps) => {
  const router = useRouter();

  const { mutate: deleteTenant } = api.tenants.removeTenant.useMutation({
    onSuccess: () => {
      toast("Successfully removed tenant from listing!");
      router.refresh();
    },
  });

  const { mutate: removeImage } =
    api.listings.removeImageFromListing.useMutation({
      onSuccess: () => {
        toast.success("Successfully removed image");
        router.refresh();
      },
    });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredReservations = reservations.filter((reservation) =>
    searchQuery
      ? reservation.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const numberOfPendingReservations = reservations.filter(
    (reservation) => reservation.status === "pending"
  ).length;

  const imageUrlsWithId = files.map((f) => ({ url: f.file.url, id: f.fileId }));

  return (
    <main className="container mx-auto space-y-6 px-4 py-6 md:py-8">
      {/* Title, description and price section */}
      <div className="flex flex-col items-start gap-6 md:flex-row md:justify-between">
        <div className="w-full md:w-auto">
          <EditListingTitle currentTitle={title} listingId={id} />
          <EditListingDescription
            currentDescription={description}
            listingId={id}
          />
        </div>
        <Card className="group/edit relative mt-4 w-full sm:w-[200px] md:mt-0">
          <EditListingPrice previousPrice={monthly_price} listingId={id} />
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <CardTitle>Price</CardTitle>
            </div>
            <CardDescription>Monthly rent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              CZK{monthly_price.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="group/edit relative">
          <EditListingCapacity previous_capacity={max_tenants} listingId={id} />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {tenants.length}/{max_tenants}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reservations.length}</p>
            <p className="text-sm">
              Of which {numberOfPendingReservations} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Listed by
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={creator.image ?? ""} />
              <AvatarFallback>{creator.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{creator.name}</p>
              <p className="text-muted-foreground text-sm">Owner</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Listing Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-3">
            <EditListingStatus currentStatus={listing_status} listingId={id} />
            <p className="text-sm">
              {displayListingStatusDescription(listing_status)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Images section */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {imageUrlsWithId.map((image) => (
            <ImageCell
              key={image.id}
              src={image.url}
              alt="Property image"
              allowDelete={true}
              onDelete={() => removeImage({ listingId: id, fileId: image.id })}
              width={300}
              height={300}
              className="aspect-square w-full rounded-md border object-cover"
            />
          ))}

          {imageUrlsWithId.length < MAX_FILE_COUNT ? (
            <div className="aspect-square w-full overflow-hidden rounded-md border">
              <AddListingImageModal
                listingId={id}
                onImagesAdded={() => router.refresh()}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Tabs section */}
      <Tabs defaultValue="tenants" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="tenants" className="flex-1 sm:flex-none">
            Current Tenants
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex-1 sm:flex-none">
            Reservations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tenants.map(({ tenant }) => (
              <Card key={tenant.id} className="group relative">
                <Button
                  variant="ghost"
                  className="hover:bg-primary absolute top-1 right-1 hidden border-none group-hover:block"
                  onClick={() =>
                    deleteTenant({
                      tenantId: tenant.id,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader className="flex flex-row items-center gap-4 p-4 sm:p-6">
                  <Avatar>
                    <AvatarFallback>{tenant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      {tenant.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs sm:text-sm">
                      {tenant.bio}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
            {tenants.length === max_tenants ? null : (
              <AddForeignTenantDialog listingId={id} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="mt-6">
          <div className="space-y-4">
            <Input
              placeholder="Filter by email"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-full sm:max-w-md"
            />
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <ReservationCard
                  {...reservation}
                  key={reservation.id}
                  disableActions={tenants.length === max_tenants}
                />
              ))
            ) : (
              <p className="text-muted-foreground py-4">
                No reservations found.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};
