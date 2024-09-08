//todo: this needs to be refactored
"use client";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { createListingSchema } from "@/server/db/types";
import confetti from "canvas-confetti";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Heading2, Paragraph } from "@/modules/typography";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { DevTool } from "@hookform/devtools";

const steps = [
  {
    title: "Welcome",
    description: "Let us list your property",
  },
  {
    title: "Description",
    description: "How would you describe your property?",
  },
  {
    title: "About the property",
    description:
      "What is the maximum number of tenants in the listing? Are pets allowed? Let us know",
  },
  {
    title: "Price",
    description: "What is the monthly price? Price is listed in CZK",
  },
];
export const NewNewListingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const form = useForm<z.infer<typeof createListingSchema>>({
    //TODO: move infer to another file
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      maxTenants: 0,
      title: "",
      description: "",
      monthly_price: 0,
    },
    mode: "all",
  });
  const { mutate, status } = api.listings.createNewListing.useMutation({
    onSuccess: async () => {
      toast("Listing created!");
      await confetti({
        particleCount: 100,
        origin: { y: 0.6 },
      });
    },
  });

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      const isValid = await form.trigger();
      if (isValid || currentStep === 0) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };
  const onSubmit = (data: z.infer<typeof createListingSchema>) => {
    mutate(data);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <section>
            <Heading2 withBorder={false}>Let us get you started!</Heading2>
            <Paragraph>
              This form will take you through all the steps needed to list your
              property
            </Paragraph>
          </section>
        );
      case 1:
        return (
          <section>
            <FormField
              control={form.control}
              name="title"
              key={1024}
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
              key={492}
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
          </section>
        );
      case 2:
        return (
          <section>
            <FormField
              control={form.control}
              name="maxTenants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum number of tenants</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      id="maxTenants"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>
                    How many tenants can be in this property
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        );
      case 3:
        return (
          <section>
            <FormField
              control={form.control}
              name="monthly_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      id="price"
                      placeholder="Montly Price"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>Rent (CZK)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-accent p-6 shadow-xl">
        <div className="mb-8">
          <div className="mb-2 flex justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${index <= currentStep ? "bg-primary text-white" : "bg-secondary text-gray-500"}`}
                >
                  {index + 1}
                </div>
                <span className="mt-1 text-xs">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="h-2 rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="mb-8">
          <Heading2 className="font-semibold">
            {steps[currentStep]?.title}
          </Heading2>
          <Paragraph className="text-secondary-foreground">
            {steps[currentStep]?.description}
          </Paragraph>
        </div>
        <Form {...form}>
          <form className="mb-8" onSubmit={form.handleSubmit(onSubmit)}>
            <Fragment key={currentStep}>{renderStep()}</Fragment>
            <div className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              {currentStep === steps.length - 1 ? (
                <Button type="submit" disabled={status === "pending"}>
                  Submit
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  type="button"
                  key={currentStep + 1}
                >
                  Next
                </Button>
              )}
            </div>
          </form>
        </Form>
        {/*<DevTool control={form.control} />*/}
      </div>
    </div>
  );
};