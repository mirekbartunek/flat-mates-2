import { Button } from "@/components/ui/button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import {
  createTenantSchema,
  type TenantSchema,
  socialEnum,
} from "@/server/db/types";
import { capitalizer } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TenantSocial } from "@/server/db/enums";

/**
 * @deprecated Marked for deletion
 */
export const TenantDescriptionForm = () => {
  const form = useForm<TenantSchema>({
    resolver: zodResolver(createTenantSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socials",
  });
  const onSubmit = () => {
    console.log(form.getValues());
  };

  return (
    <main>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mx-auto max-w-3xl space-y-8 py-10"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Joe" type="text" {...field} />
                </FormControl>
                <FormDescription>Tenant’s name</FormDescription>
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
            <div className="flex flex-col gap-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex space-x-2">
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        form.setValue(
                          `socials.${index}.label`,
                          value as TenantSocial
                        )
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Select a social" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(socialEnum.Values).map((social) => (
                          <SelectItem key={crypto.randomUUID()} value={social}>
                            {capitalizer(social)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="URL"
                      {...form.register(`socials.${index}.value` as const)}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="mt-2"
              onClick={() => append({ label: "facebook", value: "" })}
            >
              Add Social
            </Button>
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </main>
  );
};
