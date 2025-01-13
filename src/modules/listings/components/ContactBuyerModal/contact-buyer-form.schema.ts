import z from "zod";

export const contactBuyerFormSchema = z.object({
  message: z.string().min(1, {
    message: "Message is required.",

  }),
  terms: z.boolean({
  }).refine((value) => value, {
    message: "You must agree.",
  }),
});

export type ContactBuyerFormSchema = z.infer<typeof contactBuyerFormSchema>
