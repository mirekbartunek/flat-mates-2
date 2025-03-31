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
import {
  CAN_MODIFY_ROLE,
  RIGHT_TO_CHANGE_ROLES,
  RIGHT_TO_VERIFY_USERS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type UserRowProps = {
  name: string | null;
  role: UserRole;
  verified_status: UserVerified;
  adminRole: UserRole;
  id: string;
  email: string;
};

export const UserRow = ({
  name,
  role,
  verified_status,
  adminRole,
  id,
  email,
}: UserRowProps) => {
  const [formValues, setFormValues] = useState<{
    role: UserRole;
    verified_status: UserVerified;
  }>({
    role,
    verified_status,
  });

  const router = useRouter();

  const canModifyThisUser = CAN_MODIFY_ROLE[adminRole].includes(role);

  const { mutate: mutateVerification } = api.admin.verifyUser.useMutation({
    onError: (error) =>
      toast.error("Whoops!", {
        description: error.message || "Something went wrong",
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
    onError: (error) =>
      toast.error("Whoops", {
        description: error.message || "Something went wrong",
      }),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!(formValues.role === role) && canModifyThisUser) {
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
    <Card>
      <CardContent className="py-4">
        <form
          className="flex flex-wrap items-center gap-4 md:flex-nowrap"
          onSubmit={handleSubmit}
        >
          <div className="flex min-w-[200px] items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              <p>{name}</p>{" "}
              <span className="text-primaey/50 text-xs">{email}</span>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-4 md:flex-nowrap">
            <Select
              defaultValue={role}
              onValueChange={(res: UserRole) =>
                setFormValues({
                  ...formValues,
                  role: res,
                })
              }
              disabled={!canModifyThisUser}
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
                <SelectValue placeholder="Verification status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {userVerifiedEnumValues.map((verifiedEnumValue) => (
                    <SelectItem
                      value={verifiedEnumValue}
                      key={crypto.randomUUID()}
                      disabled={!RIGHT_TO_VERIFY_USERS[adminRole]}
                    >
                      {verifiedEnumValue}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              disabled={
                !canModifyThisUser ||
                (formValues.role === role
                  ? formValues.verified_status === verified_status
                  : false)
              }
              type="submit"
              className="ml-auto"
              variant="default"
            >
              Update
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
