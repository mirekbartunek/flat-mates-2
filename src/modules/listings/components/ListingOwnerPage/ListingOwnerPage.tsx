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
import { DialogPrimitive } from "@/modules/listings/components/DialogPrimitive/DialogPrimitive";

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

  const { mutate: deleteListing } = api.listings.removeListing.useMutation({
    onSuccess: () => {
      toast.success("Listing has been deleted successfully");
      router.push("/");
    },
    onError: (error) => {
      toast.error(`Failed to delete listing: ${error.message}`);
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
    <main className="container mx-auto space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 md:py-8">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex w-full flex-col gap-2 md:max-w-[70%]">
            <div className="flex items-start justify-between">
              <EditListingTitle currentTitle={title} listingId={id} />
            </div>

            <div className="w-full overflow-hidden break-words">
              <EditListingDescription
                currentDescription={description}
                listingId={id}
              />
            </div>

            <DialogPrimitive
              dialogTrigger={
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2 flex w-fit items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Listing
                </Button>
              }
              dialogTitle="Delete Listing"
              dialogDescription="Are you sure you want to delete this listing?"
              dialogBody={
                <div>
                  <p className="text-muted-foreground text-sm">
                    This action cannot be undone. This will permanently delete
                    this listing and remove all associated data including
                    reservations and tenant assignments.
                  </p>
                </div>
              }
              dialogFooter={
                <div className="flex w-full justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => deleteListing({ listingId: id })}
                  >
                    Delete
                  </Button>
                </div>
              }
            />
          </div>
          <Card className="group/edit relative mt-4 w-full md:mt-0 md:w-[200px] md:flex-shrink-0">
            <EditListingPrice previousPrice={monthly_price} listingId={id} />
            <CardHeader className="space-y-1 p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <CardTitle className="text-base sm:text-lg">Price</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Monthly rent
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-lg font-bold sm:text-2xl">
                CZK{monthly_price.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group/edit relative">
            <EditListingCapacity
              previous_capacity={max_tenants}
              listingId={id}
            />
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4" />
                Occupancy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-lg font-bold sm:text-2xl">
                {tenants.length}/{max_tenants}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4" />
                Reservations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-lg font-bold sm:text-2xl">
                {reservations.length}
              </p>
              <p className="text-xs sm:text-sm">
                Of which {numberOfPendingReservations} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Home className="h-4 w-4" />
                Listed by
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 p-4 pt-0 sm:gap-3 sm:p-6 sm:pt-0">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={creator.image ?? ""} />
                <AvatarFallback>{creator.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium sm:text-base">
                  {creator.name}
                </p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Owner
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Eye className="h-4 w-4" />
                Listing Status
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-start gap-2 p-4 pt-0 sm:gap-3 sm:p-6 sm:pt-0">
              <EditListingStatus
                currentStatus={listing_status}
                listingId={id}
              />
              <p className="text-xs leading-tight sm:text-sm">
                {displayListingStatusDescription(listing_status)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Images</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 p-4 pt-0 sm:grid-cols-3 sm:gap-3 sm:p-6 sm:pt-0 md:grid-cols-4 lg:grid-cols-5">
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

      <Tabs defaultValue="tenants" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
          <TabsTrigger value="tenants">Current Tenants</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-4 sm:mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {tenants.map(({ tenant }) => (
              <Card key={tenant.id} className="group relative">
                <Button
                  variant="ghost"
                  className="hover:bg-primary absolute top-1 right-1 hidden border-none group-hover:block"
                  size="sm"
                  onClick={() =>
                    deleteTenant({
                      tenantId: tenant.id,
                    })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader className="flex flex-row items-center gap-2 p-3 sm:gap-4 sm:p-6">
                  <Avatar className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                    <AvatarFallback>{tenant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-sm sm:text-base">
                      {tenant.name}
                    </CardTitle>
                    <CardDescription className="mt-0.5 line-clamp-2 text-xs sm:mt-1 sm:text-sm">
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

        <TabsContent value="reservations" className="mt-4 sm:mt-6">
          <div className="space-y-3 sm:space-y-4">
            <Input
              placeholder="Filter by email"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-full sm:max-w-md"
            />
            <div className="space-y-3 sm:space-y-4">
              {filteredReservations.length > 0 ? (
                filteredReservations.map((reservation) => (
                  <ReservationCard
                    {...reservation}
                    key={reservation.id}
                    disableActions={tenants.length === max_tenants}
                  />
                ))
              ) : (
                <p className="text-muted-foreground py-3 text-sm sm:py-4">
                  No reservations found.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};
