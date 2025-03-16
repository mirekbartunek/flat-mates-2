import { ListingOwnerPage } from "@/modules/listings/components/ListingOwnerPage/ListingOwnerPage";
import { notFound } from "next/navigation";
import { getServerAuthSession } from "@/server/auth";
import { ErrorPage } from "@/modules/layout";
import { eq } from "drizzle-orm";
import { db, listings } from "@/server/db";
const Page = async ({ params }: { params: Promise<{ listingId: string }> }) => {
  const { listingId } = await params;
  const details = await db.query.listings.findFirst({
    where: eq(listings.id, listingId),
    with: {
      reservations: {
        with: {
          user: true,
        },
      },
      creator: true,
      tenants: {
        with: {
          tenant: true,
        },
      },
      files: {
        with: {
          file: true,
        },
      },
    },
  });

  const user = await getServerAuthSession();

  if (!details) return notFound();
  const mappedListing = {
    ...details,
    tenants: details.tenants.map((t) => ({
      tenant: t.tenant,
    })),
  };
  if (!user)
    return (
      <main>
        <ErrorPage
          title="Unauthenticated"
          desc="You must be authenticated to access this page"
        />
      </main>
    );
  if (!details) {
    return notFound();
  }

  if (user.user.id !== details.userId) {
    return (
      <main>
        <ErrorPage
          title="Unauthorized"
          desc="You are not authorized to view this page"
        />
      </main>
    );
  }

  return <ListingOwnerPage {...mappedListing} />;
};

export default Page;
