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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TenantSocial } from "@/server/db/enums";
import { Loader2 } from "lucide-react";
import Map from "@/modules/listings/components/Map/Map";

export const fileValidator = {
  maxFileSize: "4MB",
  maxFileCount: 10,
  accepted: ["image/jpeg", "image/png", "image/webp"],
};

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
    title: "Location",
    description: "Where is your property located?",
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
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof createListingSchema>>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      max_tenants: 0,
      title: "",
      description: "",
      monthly_price: 0,
      current_capacity: 0,
      imageIds: [],
      tenants: [],
      area: 0,
      city: "",
      country: "",
      listing_status: "PRIVATE",
      location: [0, 0],
      rooms: 0,
      zip: "",
      street: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (hasTenants) {
      const currentCapacity = form.watch("current_capacity") || 0;
      const currentTenants = form.getValues("tenants") ?? [];

      if (currentTenants.length < currentCapacity) {
        const newTenants = Array.from({ length: currentCapacity }).map(
          (_, i) => ({
            name: "",
            bio: "",
            socials: [],
            ...(currentTenants[i] ?? {}),
          })
        );
        form.setValue("tenants", newTenants);
      } else if (currentTenants.length > currentCapacity) {
        form.setValue("tenants", currentTenants.slice(0, currentCapacity));
      }
    } else {
      form.setValue("tenants", []);
    }
  }, [form, hasTenants, form.watch("current_capacity")]); // eslint-disable-line

  const router = useRouter();
  const { mutate, status } = api.listings.createNewListing.useMutation({
    onSuccess: async (listingId) => {
      toast.success("Listing created successfully!");
      await confetti({
        particleCount: 100,
        origin: { y: 0.6 },
        colors: ["#e11d48", "#be123c", "#fb7185"],
      });
      router.push(`/listing/${listingId}`);
    },
    onError: (error) => {
      toast.error("Failed to create listing", {
        description: error.message,
      });
    },
  });

  const handleNext = async () => {
    const isValid = await form.trigger(getFieldsForStep(currentStep));
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const onSubmit = (data: z.infer<typeof createListingSchema>) => {
    if (isUploading) {
      toast.error("Please wait for images to finish uploading");
      return;
    }
    mutate(data);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getFieldsForStep = (
    step: number
  ): (keyof z.infer<typeof createListingSchema>)[] => {
    switch (step) {
      case 1:
        return ["title", "description"];
      case 2:
        return ["street", "city", "country", "zip", "location"];
      case 3:
        return ["max_tenants", "current_capacity", "tenants"];
      case 4:
        return ["monthly_price"];
      case 5:
        return ["imageIds"];
      default:
        return [];
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
                    <Input
                      placeholder="E.g., Cozy Apartment in Prague 6"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A catchy title helps your listing stand out
                  </FormDescription>
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
                    <Textarea
                      placeholder="Describe your property in detail..."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include important details about your property, amenities,
                    and surroundings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        );
      case 2:
        return (
          <section className="space-y-8">
            <Map
              onLocationSelect={(location) => {
                form.setValue("street", location.street);
                form.setValue("city", location.city);
                form.setValue("country", location.country);
                form.setValue("zip", location.zip);
                form.setValue("location", [location.lng, location.lat]);
              }}
              initialLocation={
                form.watch("location")?.[0]
                  ? {
                      lng: form.watch("location")[0],
                      lat: form.watch("location")[1],
                    }
                  : undefined
              }
              className="bg-card rounded-lg border p-1 shadow-sm"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Václavské náměstí 1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Prague" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 110 00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Czech Republic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (m²)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) ?? 0)
                        }
                        min={0}
                        value={isNaN(field.value) ? 0 : field.value}
                        placeholder="e.g., 75"
                      />
                    </FormControl>
                    <FormDescription>
                      Total area of the property
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of rooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber ?? 0)
                        }
                        value={field.value ?? 0}
                        placeholder="e.g., 3"
                      />
                    </FormControl>
                    <FormDescription>Total number of rooms</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>
        );
      case 3:
        return (
          <section className="space-y-8">
            <FormField
              control={form.control}
              name="max_tenants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum number of tenants</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      id="max_tenants"
                      min={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber ?? 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    How many tenants can live in this property
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
                      if (!checked) {
                        form.setValue("current_capacity", 0);
                      }
                    }
                  }}
                />
                <label
                  htmlFor="hasExistingTenants"
                  className="text-sm leading-none font-medium"
                >
                  Property has existing tenants
                </label>
              </div>

              {hasTenants ? (
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="current_capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current number of tenants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={form.getValues("max_tenants")}
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber ?? 0)
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Must be less than or equal to maximum tenants
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    {Array.from({
                      length: form.watch("current_capacity") || 0,
                    }).map((_, index) => {
                      const tenant = form.watch(`tenants.${index}`) || {
                        name: "",
                        bio: "",
                        socials: [],
                      };
                      return (
                        <Card key={index}>
                          <CardHeader className="pb-4">
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
                                    <Input
                                      placeholder="Tenant's name"
                                      type="text"
                                      {...field}
                                    />
                                  </FormControl>
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
                                      placeholder="Brief description of the tenant..."
                                      className="resize-none"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div>
                              <FormLabel>Social Media</FormLabel>
                              <div className="mt-2 space-y-3">
                                {(tenant.socials || []).map(
                                  (_, socialIndex) => (
                                    <div
                                      key={socialIndex}
                                      className="flex items-center space-x-2"
                                    >
                                      <Select
                                        defaultValue={
                                          tenant.socials?.[socialIndex]?.label
                                        }
                                        onValueChange={(value) =>
                                          form.setValue(
                                            `tenants.${index}.socials.${socialIndex}.label`,
                                            value as TenantSocial
                                          )
                                        }
                                      >
                                        <SelectTrigger className="w-32">
                                          <SelectValue placeholder="Platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.values(socialEnum.Values).map(
                                            (social) => (
                                              <SelectItem
                                                key={social}
                                                value={social}
                                              >
                                                {capitalizer(social)}
                                              </SelectItem>
                                            )
                                          )}
                                        </SelectContent>
                                      </Select>

                                      <FormControl>
                                        <Input
                                          type="url"
                                          placeholder="Profile URL"
                                          {...form.register(
                                            `tenants.${index}.socials.${socialIndex}.value`
                                          )}
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
                                            currentSocials.filter(
                                              (_, i) => i !== socialIndex
                                            )
                                          );
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  )
                                )}

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentSocials =
                                      form.getValues(
                                        `tenants.${index}.socials`
                                      ) || [];
                                    form.setValue(`tenants.${index}.socials`, [
                                      ...currentSocials,
                                      { label: "facebook", value: "" },
                                    ]);
                                  }}
                                >
                                  Add Social Media
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        );
      case 4:
        return (
          <section className="space-y-8">
            <FormField
              control={form.control}
              name="monthly_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly price (CZK)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g., 15000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>
                    Monthly rent in Czech Koruna
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        );

      case 5:
        return (
          <section className="space-y-8">
            <FormField
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Images</FormLabel>
                  <FormDescription>
                    Upload up to {fileValidator.maxFileCount} images (max{" "}
                    {fileValidator.maxFileSize} each)
                  </FormDescription>
                  <FormControl>
                    <UploadDropzone
                      endpoint="imageUploader"
                      config={{
                        ...fileValidator,
                        cn,
                      }}
                      appearance={{
                        button: buttonVariants({
                          variant: "secondary",
                        }),
                      }}
                      onUploadBegin={() => {
                        setIsUploading(true);
                      }}
                      onUploadProgress={(progress) => {
                        return (
                          <div className="bg-secondary h-2 w-full rounded-full">
                            <div
                              className="h-2 rounded-full bg-rose-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        );
                      }}
                      onClientUploadComplete={(res) => {
                        const ids = res
                          .map((response) => response.serverData.ids)
                          .flat();
                        const urls = res.map((response) => response.url);
                        setImageUrls(urls);
                        field.onChange(ids);
                        setIsUploading(false);
                        toast.success(
                          `Successfully uploaded ${res.length} images`
                        );
                      }}
                      onUploadError={(err) => {
                        setIsUploading(false);
                        if (err.code === "TOO_MANY_FILES") {
                          toast.error(
                            `Maximum ${fileValidator.maxFileCount} images allowed`
                          );
                        } else if (err.code === "FILE_LIMIT_EXCEEDED") {
                          toast.error(
                            `Files must be under ${fileValidator.maxFileSize}`
                          );
                        } else {
                          toast.error("Failed to upload images");
                        }
                      }}
                    />
                  </FormControl>
                  {imageUrls && imageUrls.length > 0 ? (
                    <div className="mt-4">
                      <div className="text-muted-foreground mb-2 text-sm">
                        {imageUrls.length} of {fileValidator.maxFileCount}{" "}
                        images uploaded
                      </div>
                      <ImageCarousel
                        imageUrls={imageUrls}
                        showDelete
                        showControls
                        onDelete={(index) => {
                          const newUrls = [...imageUrls];
                          newUrls.splice(index, 1);
                          setImageUrls(newUrls);
                          const newIds = [...field.value];
                          newIds.splice(index, 1);
                          field.onChange(newIds);
                        }}
                      />
                    </div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
              control={form.control}
              name="imageIds"
            />
          </section>
        );
      default:
        return null;
    }
  };
  return (
    <div className="container mx-auto py-8">
      <div className="relative mx-auto max-w-3xl space-y-8">
        {/* Progress Bar Card */}
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="mb-6">
            <div className="mb-4 flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                      index <= currentStep
                        ? "bg-rose-500 text-white"
                        : index < currentStep
                          ? "bg-rose-200 text-rose-700"
                          : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 max-w-[100px] truncate text-center text-sm font-medium">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-secondary h-2 rounded-full">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-300"
                style={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-rose-500">
              {steps[currentStep]?.title}
            </h2>
            <p className="text-muted-foreground mt-1">
              {steps[currentStep]?.description}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Fragment key={currentStep}>{renderStep()}</Fragment>

              <div className="flex items-center justify-between border-t pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    disabled={status === "pending" || isUploading}
                    className="min-w-[100px]"
                  >
                    {status === "pending" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Publish"
                    )}
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

        {/* Optional: Help text */}
        <p className="text-muted-foreground text-center text-sm">
          Need help? Contact support at{" "}
          <a
            href="mailto:support@flatmates.com"
            className="text-rose-500 hover:underline"
          >
            support@flatmates.com
          </a>
        </p>
      </div>
    </div>
  );
};
