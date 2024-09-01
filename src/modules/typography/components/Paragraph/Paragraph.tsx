import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ParagraphProps = {
  children?: ReactNode;
} & ComponentProps<"p">;
export const Paragraph = ({ children, ...props }: ParagraphProps) => {
  return (
    <p className={cn("leading-7 [&:not(:first-child)]:mt-6", props.className)}>
      {children}
    </p>
  );
};
