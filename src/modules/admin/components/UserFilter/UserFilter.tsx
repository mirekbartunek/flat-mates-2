"use client";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

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
    <div className={cn("relative", className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        className="pl-10"
        placeholder="Search users by name"
        value={queryValue ?? ""}
        onChange={(e) => setQueryValue(e.target.value)}
        {...props}
      />
    </div>
  );
};
