import { db, listings } from "@/server/db";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ImageCell } from "@/modules/listings/components/ImageCell/ImageCell";
import { DollarSign, Users, Calendar } from "lucide-react";
import { ContactBuyerModal } from "@/modules/listings/components/ContactBuyerModal/ContactBuyerModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";

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
          image:true
        },
      },
      tenants: {
        with: {
          tenant: true,
        },
      },
    },
  });

  if (!listingDetails) return notFound();

  const imageUrls = listingDetails.files.map((f) => f.file?.url);

  return (
    <main className="container mx-auto space-y-8 py-8">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <ImageCell
            src={imageUrls.at(0)!}
            alt={listingDetails.title}
            width={1200}
            height={400}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 p-8 text-white">
          <h1 className="mb-2 text-4xl font-bold">{listingDetails.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20">
              {listingDetails.current_capacity}/{listingDetails.maxTenants}{" "}
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
                        <p className="max-w-[200px] truncate text-sm text-muted-foreground">
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
                <p className="text-sm text-muted-foreground">Property Owner</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Facts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {listingDetails.current_capacity}/
                    {listingDetails.maxTenants} tenants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Monthly Rent</p>
                  <p className="text-sm text-muted-foreground">
                    {listingDetails.monthly_price.toLocaleString()} CZK
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Listed</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistance(
                      new Date(listingDetails.createdAt),
                      new Date(),
                      { addSuffix: true }
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ContactBuyerModal listingId={listingId} />
        </div>
      </div>
    </main>
  );
};
