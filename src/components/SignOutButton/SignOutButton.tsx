"use client";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { getUrl } from "@/lib/utils";

export const SignOutButton = () => {
  return (
    <Button
      onClick={() =>
        signOut({
          redirect: true,
          callbackUrl: `${getUrl()}/?signOut=true`,
        })
      }
    >
      Sign Out
    </Button>
  );
};
