import { ErrorPage, PageTop } from "@/modules/layout";
import { Heading2 } from "@/modules/typography";
import { Listing } from "@/modules/listings";
import { db, listingReservations, listings, users } from "@/server/db";
import { count, eq, desc } from "drizzle-orm";
import { Plus, Home, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReservationPreviewCard } from "@/modules/listings/components/ReservationPreviewCard/ReservationPreviewCard";

type UserProfilePageProps = {
  userId: string;
};

export const UserProfilePage = async ({ userId }: UserProfilePageProps) => {
  const [listingCount, reservationCount] = await Promise.all([
    db
      .select({ count: count() })
      .from(listings)
      .where(eq(listings.userId, userId)),
    db
      .select({ count: count() })
      .from(listingReservations)
      .where(eq(listingReservations.user_id, userId)),
  ]);

  const numberOfReservations = reservationCount.at(0)?.count;
  const numberOfListings = listingCount.at(0)?.count;

  if (numberOfReservations === undefined || numberOfListings === undefined) {
    return (
      <ErrorPage
        title="Something went wrong"
        desc="Something went wrong while fetching your information"
      />
    );
  }

  const [user, userListings, userReservations] = await Promise.all([
    db.query.users.findFirst({
      where: eq(users.id, userId),
    }),
    db.query.listings.findMany({
      with: {
        files: {
          with: {
            file: true,
          },
        },
      },
      where: eq(listings.userId, userId),
    }),
    db.query.listingReservations.findMany({
      where: eq(listingReservations.user_id, userId),
      orderBy: [desc(listingReservations.createdAt)],
      with: {
        listing: {
          with: {
            files: {
              with: {
                file: true,
              },
              limit: 1,
            },
          },
        },
      },
    }),
  ]);

  const mappedListings = userListings.map((listing) => ({
    ...listing,
    imageUrls: listing.files.map((f) => f.file?.url).filter(Boolean),
  }));

  if (!user) {
    return (
      <ErrorPage
        title="Something went wrong"
        desc="Something went wrong while fetching your information"
      />
    );
  }

  return (
    <main className="overflow-x-hidden">
      <PageTop>
        <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg">
          Here you can manage your listings
        </p>
      </PageTop>

      <div className="container mx-auto px-4 py-5">
        <Heading2 className="mb-5">Your listings</Heading2>

        {numberOfListings === 0 && user.verified_status === "VERIFIED" ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mb-4 rounded-full bg-rose-500/10 p-3">
              <Home className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-medium">No listings yet</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              You haven&#39;t created any listings yet. Create your first
              listing to attract potential tenants.
            </p>
            <Button asChild className="mt-6 bg-rose-500 hover:bg-rose-600">
              <Link href="/list-your-property">
                <Plus className="mr-2 h-4 w-4" /> Create your first listing
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mappedListings.map((listing) => (
              <Listing {...listing} key={listing.id} mode={"OWNER_VIEW"} />
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto mt-8 px-4 pb-12">
        <Heading2 className="mb-5">Your reservations</Heading2>

        {numberOfReservations === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mb-4 rounded-full bg-rose-500/10 p-3">
              <Calendar className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-medium">No reservations yet</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              You don&#39;t have any active reservations. Browse available
              listings to find your next place to stay.
            </p>
            <Button asChild className="mt-6 bg-rose-500 hover:bg-rose-600">
              <Link href="/">
                <span className="flex items-center">
                  Browse listings <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userReservations.map((reservation) => (
              <ReservationPreviewCard
                key={reservation.id}
                reservation={reservation}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
