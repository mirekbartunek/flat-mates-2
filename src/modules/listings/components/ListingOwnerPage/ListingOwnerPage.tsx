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
import type {
  listingReservations,
  listings,
  tenants,
  users,
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

type ListingWithRelations = InferSelectModel<typeof listings> & {
  reservations: (InferSelectModel<typeof listingReservations> & {
    user: InferSelectModel<typeof users>;
  })[];
  creator: InferSelectModel<typeof users>;
  tenants: {
    tenant: InferSelectModel<typeof tenants>;
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
}: ListingOwnerPageProps) => {
  const router = useRouter();

  const { mutate: deleteTenant } = api.tenants.removeTenant.useMutation({
    onSuccess: () => {
      toast("Successfully removed tenant from listing!");
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
  return (
    <main className="container mx-auto space-y-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <EditListingTitle currentTitle={title} listingId={id} />
          <EditListingDescription
            currentDescription={description}
            listingId={id}
          />
        </div>
        <Card className="group/edit relative w-[200px]">
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

      <div className="grid grid-cols-3 gap-4">
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
            <p>{displayListingStatusDescription(listing_status)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tenants" className="w-full">
        <TabsList>
          <TabsTrigger value="tenants">Current Tenants</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="mt-6">
          <div className="grid grid-cols-3 gap-4">
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
                  <Trash2 />
                </Button>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{tenant.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{tenant.name}</CardTitle>
                    <CardDescription className="mt-1.5">
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
            />
            {filteredReservations.map((reservation) => (
              <ReservationCard
                {...reservation}
                key={reservation.id}
                disableActions={tenants.length === max_tenants}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};
