"use client";
import { DialogPrimitive } from "@/modules/listings/components/DialogPrimitive/DialogPrimitive";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TenantSocial } from "@/server/db/enums";
import {
  addTenantFormSchema,
  type AddTenantFormSchema,
  socialEnum,
} from "@/server/db/types";
import { capitalizer } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AddForeignTenantFormProps = {
  listingId: string;
};

const AddForeignTenantForm = ({ listingId }: AddForeignTenantFormProps) => {
  const form = useForm<AddTenantFormSchema>({
    resolver: zodResolver(addTenantFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      socials: [],
    },
  });
  const router = useRouter();
  const { mutate } = api.listings.editListing.useMutation({
    onSuccess: () => {
      toast("Tenant successfully added");
      router.refresh();
    },
    onError: (e) => {
      console.error(e);
      toast("Could not add tenant");
    },
  });

  const onSubmit = (data: AddTenantFormSchema) => {
    console.log(data);
    mutate({
      id: listingId,
      tenants: [
        {
          ...data,
        },
      ],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Joe" type="text" {...field} />
              </FormControl>
              <FormDescription>Tenant&#39;s name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="ČVUT Student, likes cats..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>Describe the tenant</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Socials</FormLabel>
          <div className="mt-2 space-y-3">
            {form.watch("socials")?.map((_, socialIndex) => (
              <div key={socialIndex} className="flex space-x-2">
                <Select
                  defaultValue={form.watch(`socials.${socialIndex}.label`)}
                  onValueChange={(value) =>
                    form.setValue(
                      `socials.${socialIndex}.label`,
                      value as TenantSocial
                    )
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select a social" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(socialEnum.Values).map((social) => (
                      <SelectItem key={social} value={social}>
                        {capitalizer(social)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormControl>
                  <Input
                    type="url"
                    placeholder="URL"
                    {...form.register(`socials.${socialIndex}.value`)}
                  />
                </FormControl>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const currentSocials = form.getValues("socials");
                    form.setValue(
                      "socials",
                      currentSocials.filter((_, i) => i !== socialIndex)
                    );
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentSocials = form.getValues("socials") || [];
                form.setValue("socials", [
                  ...currentSocials,
                  { label: "facebook", value: "" },
                ]);
              }}
            >
              Add Social
            </Button>
          </div>
        </div>

        <Button type="submit" className="mt-6">
          Add Tenant
        </Button>
      </form>
    </Form>
  );
};

type AddForeignTenantDialogProps = {
  listingId: string;
};

export const AddForeignTenantDialog = ({
  listingId,
}: AddForeignTenantDialogProps) => {
  return (
    <DialogPrimitive
      dialogTriggerClassName="flex flex-row"
      dialogTrigger={
        <Card className="group relative">
          <CardHeader className="flex flex-row items-center gap-4">
            <Plus />
            <div>
              <CardTitle className="w-fit">Add tenant</CardTitle>
              <CardDescription>
                Add any tenant that came outside Flat Mates
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      }
      dialogTitle="Add tenant outside of Flat Mates"
      dialogDescription="Here you can add any other tenants which came elsewhere"
      dialogBody={<AddForeignTenantForm listingId={listingId} />}
    />
  );
};
