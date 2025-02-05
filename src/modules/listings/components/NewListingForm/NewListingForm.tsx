"use client";
import { useForm } from "react-hook-form";
import { createListingSchema } from "@/server/db/types";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

/**
 * @deprecated Use NewNewListingForm for now
 */
export const NewListingForm = () => {
  const { mutate } = api.listings.createNewListing.useMutation({
    onSuccess: () => {
      toast("Listing created!", {
        className: buttonVariants(),
      });
    },
  });

  const form = useForm<z.infer<typeof createListingSchema>>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      max_tenants: 0,
      title: "",
      description: "",
      monthly_price: 0,
    },
  });
  function onSubmit(values: z.infer<typeof createListingSchema>) {
    mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Title" {...field} />
              </FormControl>
              <FormDescription>The title of this listing</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description" {...field} />
              </FormControl>
              <FormDescription>Property description</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="max_tenants"
          render={({ field: { value, onChange } }) => (
            <FormItem>
              <FormLabel>Maximum number of tenants</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={40}
                  step={1}
                  defaultValue={[value]}
                  onValueChange={(n) => onChange(n.at(0))}
                />
              </FormControl>
              <span>{form.getValues("max_tenants")}</span>
              <FormDescription>
                How many tenants can be in this property
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="monthly_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Montly Price"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber ?? 0)}
                />
              </FormControl>
              <FormDescription>Rent (CZK)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">List property</Button>
      </form>
    </Form>
  );
};
