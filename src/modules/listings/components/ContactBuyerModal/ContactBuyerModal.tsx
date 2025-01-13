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
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ContactBuyerFormSchema,
  contactBuyerFormSchema,
} from "@/modules/listings/components/ContactBuyerModal/contact-buyer-form.schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSession } from "next-auth/react";

type ContactBuyerModalProps = {
  listingId: string;
};
export const ContactBuyerModal = ({ listingId }: ContactBuyerModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ContactBuyerFormSchema>({
    resolver: zodResolver(contactBuyerFormSchema),
    defaultValues: {
      message: "",
      terms: false,
    },
  });

  const { mutate } = api.listings.bookListing.useMutation({
    onSuccess: () => {
      toast("Success nemas translaci", {
        description:
          "Owner is contacted. They will be in touch soon nemas translaci",
      });
      form.reset();
      setIsOpen(false);
    },
  });
  const { data: sessionData } = useSession();
  const onSubmit = (data: ContactBuyerFormSchema) => {
    mutate({
      listingId,
      messageToOwner: data.message,
      tenantId: sessionData?.user.id!,
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>I&#39;m interested</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action will contact the property owner.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2 pb-4">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your message..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a message to the property owner.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I understand this action</FormLabel>
                      <FormDescription>
                        By sending this, the owner is notified
                      </FormDescription>
                      <FormMessage />
                    </div>

                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Contact owner</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
