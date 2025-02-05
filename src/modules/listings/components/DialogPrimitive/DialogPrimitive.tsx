"use client";
import { type ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
type DialogPrimitiveProps = {
  onOpenChange?: (open: boolean) => void;
  dialogTrigger: ReactNode;
  dialogTriggerClassName?: string;
  dialogTitle: ReactNode;
  dialogDescription: ReactNode;
  dialogBody: ReactNode;
  dialogFooter?: ReactNode;
  inForm?: boolean; // assumes that dialogFooter is in dialogBody
};
export const DialogPrimitive = ({
  onOpenChange,
  dialogTrigger,
  dialogTitle,
  dialogDescription,
  dialogBody,
  dialogTriggerClassName,
  dialogFooter,
  inForm = false,
}: DialogPrimitiveProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onOpenChange ? onOpenChange(open) : null;
      }}
    >
      <DialogTrigger className={dialogTriggerClassName}>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {dialogBody}
        {inForm ? null : <DialogFooter>{dialogFooter}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
};
