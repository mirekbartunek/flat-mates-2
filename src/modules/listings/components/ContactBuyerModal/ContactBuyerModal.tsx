"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export const ContactBuyerModal = () => {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  console.log(isButtonDisabled);
  return (
    <Dialog onOpenChange={() => setIsButtonDisabled(true)}>
      <DialogTrigger asChild>
        <Button>I’m interested</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action will contact the property owner
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            onCheckedChange={(checked) =>
              setIsButtonDisabled(checked === false)
            }
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I understand this action
          </label>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isButtonDisabled}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
