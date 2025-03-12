import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  type UpdateListingCapacityFormSchema,
  updateListingCapacityFormSchema,
} from "@/server/db/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { DialogPrimitive } from "@/modules/listings/components/DialogPrimitive/DialogPrimitive";
import { Pencil } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type EditListingCapacityProps = {
  previous_capacity: number;
  listingId: string;
};

export const EditListingCapacity = ({
  previous_capacity,
  listingId: id,
}: EditListingCapacityProps) => {
  const router = useRouter();
  const form = useForm<UpdateListingCapacityFormSchema>({
    resolver: zodResolver(updateListingCapacityFormSchema),
    defaultValues: {
      max_tenants: previous_capacity,
    },
  });
  const { mutate, isPending } = api.listings.editListing.useMutation({
    onSuccess: () => {
      toast("Successfully updated the capacity");
      router.refresh();
    },
  });
  const onSubmit = ({ max_tenants }: UpdateListingCapacityFormSchema) => {
    mutate({
      id,
      max_tenants,
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
      dialogTitle="Edit capacity"
      dialogDescription="Edit listing capacity"
      dialogBody={
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2 pb-4">
              <FormField
                control={form.control}
                name="max_tenants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="New capacity"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        value={field.value ?? 0}
                      />
                    </FormControl>
                    <FormDescription>
                      You can change the capacity here.
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
