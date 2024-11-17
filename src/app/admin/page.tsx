import { getServerAuthSession } from "@/server/auth";
import { ADMIN_ROLES } from "@/lib/constants";
import { ErrorPage } from "@/modules/layout";
import { getTranslations } from "next-intl/server";
import { AdminPage } from "@/modules/admin/components/AdminPage/AdminPage";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

const Page = async ({
  searchParams,
}: {
  params: { slug: string };
  searchParams?: Promise<Record<"user", string | undefined>>;
}) => {
  const u = await getServerAuthSession();
  const unauthenticatedTranslations = await getTranslations("Unauthenticated");
  const unauthorizedTranslations = await getTranslations("Unauthorized");

  if (!u?.user.id) {
    return (
      <main>
        <ErrorPage
          title={unauthenticatedTranslations("title")}
          desc={unauthenticatedTranslations("description")}
        />
      </main>
    );
  }

  if (!ADMIN_ROLES.includes(u.user.role)) {
    return (
      <main>
        <ErrorPage
          title={unauthorizedTranslations("title")}
          desc={unauthorizedTranslations("description")}
        />
      </main>
    );
  }
  const searchedUserQueryString = await searchParams;
  const searchedUser =
    searchedUserQueryString?.user === undefined
      ? "%"
      : `%${searchedUserQueryString.user}%`;
  const users = await db.query.users.findMany({
    where: sql`LOWER(users.name) LIKE ${searchedUser.toLowerCase()}`,
  });
  return <AdminPage users={users} adminRole={u.user.role} />;
};

export default Page;
