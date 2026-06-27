import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .pipe(z.url().nullable());

export const supplierFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Supplier name is required."),
  facebook_link: optionalUrl,
  messenger_link: optionalUrl,
  notes: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value)),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
