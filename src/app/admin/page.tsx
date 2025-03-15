import { getServerAuthSession } from "@/server/auth";
import { ADMIN_ROLES } from "@/lib/constants";
import { ErrorPage } from "@/modules/layout";
import { AdminPage } from "@/modules/admin/components/AdminPage/AdminPage";
import { db } from "@/server/db";
import { sql } from "drizzle-orm";

const Page = async ({
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<"user", string | undefined>>;
}) => {
  const u = await getServerAuthSession();

  if (!u?.user.id) {
    return (
      <main>
        <ErrorPage
          title="Unauthenticated"
          desc="You must be authenticated to access this page"
        />
      </main>
    );
  }

  if (!ADMIN_ROLES.includes(u.user.role)) {
    return (
      <main>
        <ErrorPage
          title="Unauthorized"
          desc="You are not authorized to view this page"
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
