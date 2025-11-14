import { z } from "zod";
const fileSchema = z
  .instanceof(FileList)
  .refine((files) => files.length > 0, { message: "Avatar is required." });
export const TenantAddSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long")
    .max(11, "Phone number must be at most 11 characters long"),
  dob: z.date({
    required_error: "Date of Birth is required.",
  }),
  avatar: fileSchema,
});

const optionalFileSchema = z
  .instanceof(FileList)
  .refine(
    (files) => files.length === 0 || files.length === 1,
    "Choose only one file"
  )
  .optional();
export const TenantEditSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.email("Email is invalid").min(1, "Email is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long")
    .max(11, "Phone number must be at most 11 characters long"),
  dob: z.date({ required_error: "Date of Birth is required." }),
  avatar: optionalFileSchema.optional(),
});
