import { UserProfilePage } from "@/modules/user/components/UserProfilePage/UserProfilePage";
import { getServerAuthSession } from "@/server/auth";
import Unauthorized from "next/dist/client/components/unauthorized-error";

const PersonalPage = async () => {
  const session = await getServerAuthSession();
  if (!session?.user) {
    return <Unauthorized />;
  }

  return <UserProfilePage userId={session.user.id} />;
};

export default PersonalPage;
