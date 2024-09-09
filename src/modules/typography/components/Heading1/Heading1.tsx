import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Heading1Props = {
  children: ReactNode;
} & ComponentProps<"h1">;
export const Heading1 = ({ children, ...props }: Heading1Props) => {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl",
        props.className
      )}
    >
      {children}
    </h1>
  );
};
