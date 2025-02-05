import { UserFilter } from "@/modules/admin/components/UserFilter/UserFilter";
import { UserRow } from "@/modules/admin/components/UserRow/UserRow";
import type { UserRole } from "@/server/db/enums";
import type { Users } from "@/server/db/types";

type UserVerificationFormProps = {
  users: Users[];
  adminRole: UserRole;
};
export const UserVerificationForm = ({
  users,
  adminRole,
}: UserVerificationFormProps) => {
  return (
    <main className="container mx-auto space-y-8 py-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-rose-500">User Management</h1>
        <UserFilter className="w-full max-w-2xl" />
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <UserRow {...user} key={user.id} adminRole={adminRole} />
        ))}
      </div>
    </main>
  );
};
