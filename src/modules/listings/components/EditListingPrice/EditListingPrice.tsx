"use client";
import { DialogPrimitive } from "@/modules/listings/components/DialogPrimitive/DialogPrimitive";
import { Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  updatePriceFormSchema,
  type UpdatePriceFormSchema,
} from "@/server/db/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export type EditListingPriceProps = {
  previousPrice: number;
  listingId: string;
};

export const EditListingPrice = ({
  previousPrice,
  listingId: id,
}: EditListingPriceProps) => {
  const router = useRouter();
  const form = useForm<UpdatePriceFormSchema>({
    resolver: zodResolver(updatePriceFormSchema),
    defaultValues: {
      monthly_price: previousPrice,
    },
  });
  const { mutate, isPending } = api.listings.editListing.useMutation({
    onSuccess: () => {
      toast("Successfully updated the price");
      router.refresh();
    },
  });
  const onSubmit = ({ monthly_price }: UpdatePriceFormSchema) => {
    mutate({
      id,
      monthly_price,
    });
  };

  return (
    <DialogPrimitive
      onOpenChange={(open) => {
        if (open) {
          form.reset();
        }
      }}
      dialogTrigger={
        <Pencil className="text-muted-foreground hover:text-primary absolute top-2 right-2 h-5 w-5 cursor-pointer opacity-70 transition-all hover:scale-110 hover:opacity-100" />
      }
      dialogTriggerClassName="absolute top-1 right-1"
      dialogTitle="Edit price"
      dialogDescription="Edit listing monthly price"
      dialogBody={
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2 pb-4">
              <FormField
                control={form.control}
                name="monthly_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="New price"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormDescription>
                      You can change the monthly price here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                Edit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      }
    />
  );
};
