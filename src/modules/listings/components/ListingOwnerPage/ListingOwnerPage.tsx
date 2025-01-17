"use client";
import { Heading1 } from "@/modules/typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistance } from "date-fns";
import { Users, Home, Calendar, DollarSign, Check, Cross, X } from "lucide-react";

import type { InferSelectModel } from 'drizzle-orm'
import type { listingReservations, listings, tenants, users } from "@/server/db";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type ListingWithRelations = InferSelectModel<typeof listings> & {
  reservations: (InferSelectModel<typeof listingReservations> & {
    user: InferSelectModel<typeof users>;
  })[];
  creator: InferSelectModel<typeof users>;
  tenants: {
    tenant: InferSelectModel<typeof tenants>;
  }[];
}
type ListingOwnerPageProps = ListingWithRelations
export const ListingOwnerPage = ({
  title,
  description,
  current_capacity,
  maxTenants,
  monthly_price,
  creator,
  tenants,
  reservations,
}: ListingOwnerPageProps) => {
  const router = useRouter()
  const {mutate} = api.listings.resolveReservationRequest.useMutation({
    onSuccess: () => {
      toast("Successfully resolved request")
      router.refresh();
    }
  });
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReservations = reservations.filter((reservation) =>
    searchQuery
      ? reservation.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );
  return (
    <main className="container mx-auto space-y-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <Heading1>{title}</Heading1>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <Card className="w-[200px]">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <CardTitle>Price</CardTitle>
            </div>
            <CardDescription>Monthly rent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${monthly_price}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {current_capacity}/{maxTenants}
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
              <p className="text-sm text-muted-foreground">Owner</p>
            </div>
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
              <Card key={tenant.id}>
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
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="mt-6">
          <div className="space-y-4">
            <Input placeholder="Filter by email" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
            {filteredReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle>Reservation Request</CardTitle>
                      <CardDescription>
                        Created {formatDistance(new Date(reservation.createdAt), new Date(), { addSuffix: true })}
                      </CardDescription>
                      <CardDescription>
                        Created by {reservation.user.name} - <a href={`mailto:${reservation.user.email}`} className="underline">{reservation.user.email}</a>
                      </CardDescription>
                    </div>
                    <Badge variant={
                      reservation.status === 'accepted' ? 'default' :
                        reservation.status === 'rejected' ? 'destructive' :
                          'secondary'
                    }>
                      {reservation.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reservation.message ? <p className="text-muted-foreground">{reservation.message}</p> : null}

                    {/* Přidáme buttons jen pro 'pending' rezervace */}
                    {reservation.status === 'pending' ? <div className="flex gap-2">
                        <Button
                          onClick={() => mutate({
                            reservationId: reservation.id,
                            action: "ACCEPT"
                          })}
                          variant="outline"
                          className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => mutate({
                            reservationId: reservation.id,
                            action: "REJECT"
                          })}
                          variant="outline"
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div> : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
};
