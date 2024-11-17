"use client";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UserFilterProps = Omit<InputProps, "type" | "value" | "onChange">;

export const UserFilter = ({ className, ...props }: UserFilterProps) => {
  const params = useSearchParams();
  const defaultVal = params.get("user");
  const [queryValue, setQueryValue] = useState<string>(defaultVal ?? "");
  const [debouncedQueryValue] = useDebouncedValue(queryValue, 200);
  const router = useRouter();

  useEffect(() => {
    if (debouncedQueryValue === undefined || debouncedQueryValue === "") {
      router.push("/admin");
      return;
    }
    router.push(`/admin?user=${debouncedQueryValue}`);
  }, [debouncedQueryValue, router]);

  return (
    <Input
      type="text"
      className={cn("w-5/12", className)}
      placeholder="Search for users"
      value={queryValue ?? ""}
      onChange={(e) => setQueryValue(e.target.value)}
      {...props}
    />
  );
};
