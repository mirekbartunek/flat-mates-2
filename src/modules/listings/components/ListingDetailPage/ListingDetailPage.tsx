import { db, listings } from "@/server/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ImageCell } from "@/modules/listings/components/ImageCell/ImageCell";
import { DollarSign, Users, Calendar, Square, DoorOpen } from "lucide-react";
import { ContactBuyerModal } from "@/modules/listings/components/ContactBuyerModal/ContactBuyerModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { getServerAuthSession } from "@/server/auth";
import { Link } from "next-view-transitions";
import { getUrl, isAdmin } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ListingAdminActions } from "@/modules/listings/components/ListingAdminActions/ListingAdminActions";
import { ListingLocation } from "@/modules/listings/components/ListingLocation/ListingLocation";

type ListingDetailPageProps = {
  listingId: string;
};

export const ListingDetailPage = async ({
  listingId,
}: ListingDetailPageProps) => {
  const listingDetails = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
    with: {
      files: {
        with: {
          file: true,
        },
      },
      creator: {
        columns: {
          name: true,
          email: true,
          image: true,
          id: true,
        },
      },
      tenants: {
        with: {
          tenant: true,
        },
      },
    },
  });
  const user = await getServerAuthSession();

  if (!listingDetails) return notFound();

  if (listingDetails.listing_status === "HIDDEN") {
    if (listingDetails.userId !== user?.user.id) {
      return notFound();
    }
  }

  const imageUrls = listingDetails.files.map((f) => f.file?.url);

  const addressString = `${listingDetails.street}, ${listingDetails.city}, ${listingDetails.country}`;

  return (
    <main className="container mx-auto space-y-8 py-8">
      {listingDetails.listing_status === "HIDDEN" ? <div className="absolute bottom-1 right-1">This is only visible to you</div> : null}
      <div className="relative h-[400px] overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <ImageCell
            src={imageUrls.at(0)!}
            alt={listingDetails.title}
            width={1200}
            height={400}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 p-8 text-white">
          <h1 className="mb-2 text-4xl font-bold">{listingDetails.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20">
              {listingDetails.tenants.length}/{listingDetails.max_tenants}{" "}
              Tenants
            </Badge>
            <Badge variant="secondary" className="bg-white/20">
              {listingDetails.monthly_price.toLocaleString()} CZK/month
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About this property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {listingDetails.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {imageUrls.map((image) => (
                  <ImageCell
                    key={image}
                    src={image}
                    alt="Property image"
                    width={300}
                    height={300}
                    className="rounded-lg transition hover:opacity-90"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{addressString}</p>
              <ListingLocation coordinates={listingDetails.location} />
            </CardContent>
          </Card>

          {listingDetails.tenants.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {listingDetails.tenants.map(({ tenant }) => (
                    <div key={tenant?.id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{tenant?.name.at(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{tenant?.name}</p>
                        <p className="text-muted-foreground max-w-[200px] truncate text-sm">
                          {tenant?.bio}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Listed by</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage>{listingDetails.creator.image}</AvatarImage>
                <AvatarFallback>
                  {listingDetails.creator.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{listingDetails.creator.name}</p>
                <p className="text-muted-foreground text-sm">Property Owner</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.tenants.length}/{listingDetails.max_tenants}{" "}
                    tenants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="font-medium">Monthly Rent</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.monthly_price.toLocaleString()} CZK
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="font-medium">Listed</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDistance(
                      new Date(listingDetails.createdAt),
                      new Date(),
                      { addSuffix: true }
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Square className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="font-medium">Area</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.area} m<sup>2</sup>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DoorOpen className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="font-medium">Rooms</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.rooms} rooms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-row gap-5">
            {user?.user.id === listingDetails.creator.id ? (
              <Link
                href={`${getUrl()}/listing/${listingDetails.id}/owner`}
                className={buttonVariants()}
              >
                Go to dashboard
              </Link>
            ) : (
              <ContactBuyerModal listingId={listingId} />
            )}
            {isAdmin(user?.user.role ?? "USER") ? (
              <ListingAdminActions listingId={listingId} />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
};
