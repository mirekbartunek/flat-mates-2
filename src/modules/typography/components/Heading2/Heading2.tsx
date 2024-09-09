import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Heading2Props = {
  children?: ReactNode;
  withBorder?: boolean;
} & ComponentProps<"h2">;
export const Heading2 = ({
  children,
  withBorder = true,
  ...props
}: Heading2Props) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        withBorder ? "border-b" : null,
        props.className
      )}
    >
      {children}
    </h2>
  );
};
