import { PageTop } from "@/modules/layout";
import { Heading2 } from "@/modules/typography";
import { Listing } from "@/modules/listings";
import { db, listingReservations, listings, users } from "@/server/db";
import { count, eq } from "drizzle-orm";

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
    return <p>Err</p>;
  }

  const [user, userListings] = await Promise.all([
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
  ]);

  const mappedListings = userListings.map((listing) => ({
    ...listing,
    imageUrls: listing.files.map((f) => f.file?.url).filter(Boolean),
  }));

  if (!user) {
    return <p>err</p>;
  }

  return (
    <main>
      <PageTop>
        <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-center text-lg">
          Here you can manage your account
        </p>
      </PageTop>
      {numberOfListings === 0 ? null : (
        <div className="m-auto w-10/12">
          <Heading2>Your listings</Heading2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mappedListings.map((listing) => (
              <Listing {...listing} key={listing.id} mode={"OWNER_VIEW"} />
            ))}
          </div>
        </div>
      )}
      {numberOfReservations === 0 ? null : (
        <div className="m-auto w-10/12">
          <Heading2>Your reservations</Heading2>
          {/*
          TODO: Přidat, zda je uživatel v listingu nebo jestli je pending, nebo jestli je resolved
          */}
        </div>
      )}
    </main>
  );
};
