"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  type ContactBuyerFormSchema,
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
import { DialogPrimitive } from "@/modules/listings/components/DialogPrimitive/DialogPrimitive";
import { DialogFooter } from "@/components/ui/dialog";

type ContactBuyerModalProps = {
  listingId: string;
  disabled?: boolean;
};
export const ContactBuyerModal = ({
  listingId,
  disabled = false,
}: ContactBuyerModalProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  const form = useForm<ContactBuyerFormSchema>({
    resolver: zodResolver(contactBuyerFormSchema),
    defaultValues: {
      message: "",
      terms: false,
    },
  });

  const { mutate, isPending } = api.listings.bookListing.useMutation({
    onSuccess: () => {
      toast("Success", {
        description: "Owner is contacted. They will be in touch soon",
      });
      form.reset();
    },
  });
  const { data: sessionData } = useSession();
  const onSubmit = (data: ContactBuyerFormSchema) => {
    mutate({
      listingId,
      messageToOwner: data.message,
      tenantId: sessionData?.user.id!, // eslint-disable-line
    });
  };

  return (
    <DialogPrimitive
      onOpenChange={(open) => {
        if (!open) {
          form.reset();
        }
      }}
      dialogTrigger={<Button disabled={disabled}>I&#39;m interested</Button>}
      dialogTitle={"Are you sure?"}
      dialogDescription={"This action will contact the property owner."}
      dialogBody={
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
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
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
              <Button type="submit" disabled={isPending || disabled}>
                Contact owner
              </Button>
            </DialogFooter>
          </form>
        </Form>
      }
      inForm={true}
    />
  );
};
