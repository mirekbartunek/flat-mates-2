import { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Heading2Props = {
  children?: ReactNode;
} & ComponentProps<"h2">;
export const Heading2 = ({ children, ...props }: Heading2Props) => {
  return (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        props.className
      )}
    >
      {children}
    </h2>
  );
};
