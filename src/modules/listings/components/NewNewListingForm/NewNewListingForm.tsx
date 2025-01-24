"use client";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { createListingSchema, socialEnum } from "@/server/db/types";
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
import { UploadDropzone } from "@/lib/uploadthing";
import { cn, capitalizer } from "@/lib/utils";
import { ImageCarousel } from "@/modules/listings/components/ImageCarousel/ImageCarousel";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TenantSocial } from "@/server/db/enums";

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
  {
    title: "Images",
    description: "Upload image(s) showing the property",
  },
];

export const NewNewListingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [imageUrls, setImageUrls] = useState<string[] | null>(null);
  const [hasTenants, setHasTenants] = useState(false);

  const form = useForm<z.infer<typeof createListingSchema>>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      maxTenants: 0,
      title: "",
      description: "",
      monthly_price: 0,
      current_capacity: 0,
      imageIds: [],
      tenants: [],
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (hasTenants) {
      const currentCapacity = form.watch("current_capacity") || 0;
      const currentTenants = form.getValues("tenants") ?? [];

      if (currentTenants.length < currentCapacity) {
        const newTenants = Array.from({ length: currentCapacity }).map((_, i) => ({
          name: "",
          bio: "",
          socials: [],
          ...(currentTenants[i] ?? {}) // zachováme existující data
        }));
        form.setValue("tenants", newTenants);
      }
      else if (currentTenants.length > currentCapacity) {
        form.setValue("tenants", currentTenants.slice(0, currentCapacity));
      }
    } else {
      form.setValue("tenants", []);
    }
  }, [form, hasTenants, form.watch("current_capacity")]);

  const router = useRouter();
  const { mutate, status } = api.listings.createNewListing.useMutation({
    onSuccess: async (listingId) => {
      toast("Listing created!");
      await confetti({
        particleCount: 100,
        origin: { y: 0.6 },
      });
      router.push(`listing/${listingId}`);
    },
  });

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
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
          <section className="space-y-8">
            <Heading2 withBorder={false}>Let us get you started!</Heading2>
            <Paragraph>
              This form will take you through all the steps needed to list your
              property
            </Paragraph>
          </section>
        );
      case 1:
        return (
          <section className="space-y-8">
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
          </section>
        );
      case 2:
        return (
          <section className="space-y-8">
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
                      onChange={(e) => field.onChange(e.target.valueAsNumber ?? 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    How many tenants can be in this property
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasExistingTenants"
                  checked={hasTenants}
                  onCheckedChange={(checked) => {
                    if (!(checked === "indeterminate")) {
                      setHasTenants(checked);
                    }
                  }}
                />
                <label
                  htmlFor="hasExistingTenants"
                  className="text-sm font-medium leading-none"
                >
                  Property has existing tenants
                </label>
              </div>

              {hasTenants ? <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="current_capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current number of tenants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            max={form.getValues("maxTenants")}
                            onChange={(e) => field.onChange(e.target.valueAsNumber ?? 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    {Array.from({ length: form.watch("current_capacity") || 0 }).map((_, index) => {
                      const tenant = form.watch(`tenants.${index}`) || { name: "", bio: "", socials: [] };
                      return (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg font-semibold text-rose-500">
                              Tenant {index + 1}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <FormField
                              control={form.control}
                              name={`tenants.${index}.name`}
                              defaultValue=""
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
                              name={`tenants.${index}.bio`}
                              defaultValue=""
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
                                {(tenant.socials || []).map((_, socialIndex) => (
                                  <div key={socialIndex} className="flex space-x-2">
                                    <Select
                                      defaultValue={tenant.socials?.[socialIndex]?.label}
                                      onValueChange={(value) =>
                                        form.setValue(`tenants.${index}.socials.${socialIndex}.label`, value as TenantSocial)
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
                                        {...form.register(`tenants.${index}.socials.${socialIndex}.value`)}
                                      />
                                    </FormControl>

                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        const currentSocials = form.getValues(
                                          `tenants.${index}.socials`
                                        );
                                        form.setValue(
                                          `tenants.${index}.socials`,
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
                                    const currentSocials = form.getValues(
                                      `tenants.${index}.socials`
                                    ) || [];
                                    form.setValue(`tenants.${index}.socials`, [
                                      ...currentSocials,
                                      { label: "facebook", value: "" },
                                    ]);
                                  }}
                                >
                                  Add Social
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div> : null}
            </div>
          </section>
        );
      case 3:
        return (
          <section className="space-y-8">
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
                      placeholder="Monthly Price"
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
      case 4:
        return (
          <section className="space-y-8">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <UploadDropzone
                      endpoint="imageUploader"
                      config={{ cn: cn, appendOnPaste: true }}
                      appearance={{
                        button: buttonVariants({
                          variant: "secondary",
                        }),
                      }}
                      onClientUploadComplete={(res) => {
                        const ids = res
                          .map((response) => response.serverData.ids)
                          .flat();
                        const urls = res.map((response) => response.url);
                        setImageUrls(urls);
                        field.onChange(ids);
                      }}
                      onUploadError={(err) => {
                        toast.error("Whoops! Something went wrong", {
                          description: err.message,
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              control={form.control}
              name="imageIds"
            />
            {imageUrls && imageUrls.length > 0 ? (
              <ImageCarousel
                imageUrls={imageUrls}
                showDelete={true}
                showControls={true}
              />
            ) : null}
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="relative max-w-3xl mx-auto space-y-8">
        <div className="rounded-lg bg-card p-6 shadow-xs border">
          <div className="mb-6">
            <div className="flex justify-between mb-4">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                      index <= currentStep
                        ? "bg-rose-500 text-white"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-sm font-medium">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-300"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="rounded-lg bg-card p-6 shadow-xs border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-rose-500">
              {steps[currentStep]?.title}
            </h2>
            <p className="text-muted-foreground mt-1">
              {steps[currentStep]?.description}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Fragment key={currentStep}>{renderStep()}</Fragment>
              <div className="mt-8 flex justify-between">
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
        </div>
      </div>
    </div>
  );
};

