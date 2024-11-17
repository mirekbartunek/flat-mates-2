import type { Users } from "@/server/db/types";
import { type UserRole } from "@/server/db/enums";
import { UserRow } from "@/modules/admin/components/UserRow/UserRow";
import { UserFilter } from "@/modules/admin/components/UserFilter/UserFilter";

type UserVerificationFormProps = {
  users: Users[];
  adminRole: UserRole;
};
export const UserVerificationForm = ({
  users,
  adminRole,
}: UserVerificationFormProps) => {
  return (
    <main className="space-y-10">
      <UserFilter className="m-auto" />
      <section className="m-auto flex w-10/12 flex-col items-center gap-5">
        {/*todo edit width*/}
        {users.map((user) => (
          <UserRow {...user} key={user.id} adminRole={adminRole} />
        ))}
      </section>
    </main>
  );
};
