"use client";
import { useState } from "react";
import {
  type UserRole,
  userRoleEnumValues,
  type UserVerified,
  userVerifiedEnumValues,
} from "@/server/db/enums";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RIGHT_TO_CHANGE_ROLES, RIGHT_TO_VERIFY_USERS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type UserRowProps = {
  name: string | null;
  role: UserRole;
  verified_status: UserVerified;
  adminRole: UserRole;
  id: string;
};

export const UserRow = ({
  name,
  role,
  verified_status,
  adminRole,
  id,
}: UserRowProps) => {
  const [formValues, setFormValues] = useState<{
    role: UserRole;
    verified_status: UserVerified;
  }>({
    role,
    verified_status,
  });

  const router = useRouter();

  const { mutate: mutateVerification } = api.admin.verifyUser.useMutation({
    onError: () =>
      toast.error("Whoops!", {
        description: "Something went wrong",
      }),
    onSuccess: () => {
      router.refresh();
      toast.success("Success!", {
        description: "Changed user verified status",
      });
    },
  });

  const { mutate: mutateUserRole } = api.admin.changeUserRole.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Success", {
        description: "Changed user role",
      });
    },
    onError: () =>
      toast.error("Whoops", {
        description: "Something went wrong",
      }),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!(formValues.role === role)) {
      mutateUserRole({
        userId: id,
        role: formValues.role,
      });
    }
    if (!(formValues.verified_status === verified_status)) {
      mutateVerification({
        userId: id,
        user_verified: formValues.verified_status,
      });
    }
  };

  return (
    <div className="flex w-10/12 flex-row items-center justify-between">
      <div className="font-bold">{name}</div>
      <form className="contents flex-row" onSubmit={handleSubmit}>
        <Select
          defaultValue={role}
          onValueChange={(res: UserRole) =>
            setFormValues({
              ...formValues,
              role: res,
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="User role" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {userRoleEnumValues.map((userRoleEnumValue) => (
                <SelectItem
                  value={userRoleEnumValue}
                  key={crypto.randomUUID()}
                  disabled={
                    !RIGHT_TO_CHANGE_ROLES[adminRole].includes(
                      userRoleEnumValue
                    )
                  }
                >
                  {userRoleEnumValue}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          defaultValue={verified_status}
          onValueChange={(res: UserVerified) =>
            setFormValues({ ...formValues, verified_status: res })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="User verification status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {userVerifiedEnumValues.map((verifiedEnumValue) => (
                <SelectItem
                  value={verifiedEnumValue}
                  key={crypto.randomUUID()}
                  disabled={!RIGHT_TO_VERIFY_USERS[adminRole]}
                  className="disabled:cursor-not-allowed"
                >
                  {verifiedEnumValue}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          disabled={
            /* eslint-disable-line*/ formValues.role === role &&
            formValues.verified_status === verified_status
          }
          type="submit"
        >
          Update
        </Button>
      </form>
    </div>
  );
};
