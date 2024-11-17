import { db, files, listingFiles, listings, users } from "@/server/db";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ImageCell } from "@/modules/listings/components/ImageCell/ImageCell";
import { PageTop } from "@/modules/layout";
import { DollarSign, Users } from "lucide-react";
import { ContactBuyerModal } from "@/modules/listings/components/ContactBuyerModal/ContactBuyerModal";

type ListingDetailPageProps = {
  listingId: string;
};
export const ListingDetailPage = async ({
  listingId,
}: ListingDetailPageProps) => {
  const [listingDetails] = await db
    .select({
      id: listings.id,
      userId: listings.userId,
      title: listings.title,
      description: listings.description,
      maxTenants: listings.maxTenants,
      monthly_price: listings.monthly_price,
      imageUrls: sql<string[]>`JSON_AGG(${files.url})`,
      createdAt: listings.createdAt,
    })
    .from(listings)
    .innerJoin(listingFiles, eq(listings.id, listingFiles.listingId))
    .innerJoin(files, eq(files.id, listingFiles.fileId))
    .innerJoin(users, eq(listings.userId, users.id))
    .groupBy(listings.id)
    .where(eq(listings.id, listingId));
  const whenImplemented = {
    current: 4,
    capacity: 6,
  };

  if (!listingDetails) {
    return notFound();
  }
  return (
    <main className="flex flex-col items-center justify-center gap-10">
      <PageTop>
        <h1 className="text-4xl font-bold tracking-tight text-rose-500 md:text-5xl lg:text-6xl">
          {listingDetails.title}
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg">
          {listingDetails.description}
        </p>
      </PageTop>

      <div className="flex w-10/12 flex-col justify-around md:flex-row md:flex-wrap">
        <div className="flex flex-col items-center gap-2 text-rose-500">
          <div className="flex flex-col items-center">
            <Users width={75} height={75} />
            <span className="text-lg">
              {whenImplemented.current} / {whenImplemented.capacity}
            </span>
          </div>
          <h3 className="text-lg font-extrabold">Capacity</h3>
        </div>
        <div className="flex flex-col items-center gap-2 text-rose-500">
          <div className="flex flex-col items-center">
            <DollarSign width={75} height={75} />
            <span className="text-lg">
              {listingDetails.monthly_price.toLocaleString()} CZK
            </span>
          </div>
          <h3 className="text-lg font-extrabold">Per month</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {listingDetails.imageUrls.map((image) => (
          <ImageCell
            src={image}
            alt={image}
            key={image}
            width={300}
            height={300}
            className="h-auto max-w-full rounded-lg"
          />
        ))}
      </div>
      <div className="flex w-full flex-row items-center justify-center">
        <ContactBuyerModal />
      </div>
    </main>
  );
};
