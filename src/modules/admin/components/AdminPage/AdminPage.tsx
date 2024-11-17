import { UserVerificationForm } from "@/modules/admin/components/UserVerificationForm/UserVerificationForm";
import type { Users } from "@/server/db/types";
import { type UserRole } from "@/server/db/enums";
type AdminPageProps = {
  users: Users[];
  adminRole: UserRole;
};

export const AdminPage = ({ users, adminRole }: AdminPageProps) => {
  return (
    <main>
      <UserVerificationForm users={users} adminRole={adminRole} />
    </main>
  );
};
