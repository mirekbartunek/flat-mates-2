import { db, listings } from "@/server/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ImageCell } from "@/modules/listings/components/ImageCell/ImageCell";
import {
  DollarSign,
  Users,
  Calendar,
  Square,
  DoorOpen,
  EyeOff,
} from "lucide-react";
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
import { type TenantSocial } from "@/server/db/enums";
import { type JSX } from "react";
import {
  FacebookLogo,
  InstagramLogo,
  PinterestLogo,
  XLogo,
} from "@/components/icons";

type ListingDetailPageProps = {
  listingId: string;
};

const tenantSocialIcon: Record<TenantSocial, JSX.Element> = {
  instagram: <InstagramLogo className="h-5 w-5 fill-white" />,
  facebook: <FacebookLogo className="h-5 w-5 fill-white" />,
  pinterest: <PinterestLogo className="h-5 w-5 fill-white" />,
  x: <XLogo />,
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
          tenant: {
            with: {
              socials: true,
            },
          },
        },
      },
      reservations: true,
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

  const isUserInListing = user
    ? listingDetails.tenants.some(
        (tenant) => tenant.tenant.flat_mates_user_id === user.user.id
      )
    : false;

  const isUserInReservations = user
    ? listingDetails.reservations.some(
        (tenant) => tenant.user_id === user.user.id
      )
    : false;

  return (
    <main className="container mx-auto max-w-full space-y-8 px-4 py-8">
      {listingDetails.listing_status === "HIDDEN" ? (
        <div className="border-primary fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg border-1 bg-black/85 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <EyeOff className="h-5 w-5" />
          <span>Visible to you only</span>
        </div>
      ) : null}
      <div className="relative h-[250px] overflow-hidden rounded-xl sm:h-[300px] md:h-[400px]">
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
        <div className="absolute bottom-0 p-4 text-white sm:p-6 md:p-8">
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">
            {listingDetails.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
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

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>About this property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground overflow-hidden break-words">
                {listingDetails.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {imageUrls.map((image) => (
                <ImageCell
                  key={image}
                  src={image}
                  alt="Property image"
                  width={300}
                  height={300}
                  className="aspect-square w-full rounded-md border object-cover"
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="break-words">{addressString}</p>

              <div className="mt-4 h-[350px] overflow-hidden rounded-lg">
                <ListingLocation coordinates={listingDetails.location} />
              </div>
            </CardContent>
          </Card>

          {listingDetails.tenants.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Tenants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {listingDetails.tenants.map(({ tenant }) => (
                    <div key={tenant?.id} className="flex items-start gap-3">
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback>{tenant?.name.at(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{tenant?.name}</p>
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {tenant?.bio}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {tenant.socials.map((social) => (
                            <Link
                              href={social.url}
                              key={social.id}
                              target="_blank"
                              className="inline-block"
                            >
                              {tenantSocialIcon[social.social_enum]}
                            </Link>
                          ))}
                        </div>
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
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage>{listingDetails.creator.image}</AvatarImage>
                <AvatarFallback>
                  {listingDetails.creator.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {listingDetails.creator.name}
                </p>
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
                <Users className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.tenants.length}/{listingDetails.max_tenants}{" "}
                    tenants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Monthly Rent</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.monthly_price.toLocaleString()} CZK
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground h-5 w-5 flex-shrink-0" />
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
                <Square className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Area</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.area} m<sup>2</sup>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DoorOpen className="text-muted-foreground h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Rooms</p>
                  <p className="text-muted-foreground text-sm">
                    {listingDetails.rooms} rooms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex flex-col gap-3 sm:flex-row">
            {user?.user.id === listingDetails.creator.id ? (
              <Link
                href={`${getUrl()}/listing/${listingDetails.id}/owner`}
                className={buttonVariants({ className: "w-full sm:w-auto" })}
              >
                Go to dashboard
              </Link>
            ) : (
              <ContactBuyerModal
                listingId={listingId}
                disabled={!user || isUserInListing || isUserInReservations}
              />
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
