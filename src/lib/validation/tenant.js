import { z } from "zod";
const fileSchema = z
  .instanceof(FileList)
  .refine((files) => files.length > 0, { message: "Avatar is required." });

// thêm tenant lúc cập nhật contract
export const TenantAddSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  password: z.string().min(6, "Password must be at least 4 characters long"),
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
  fullName: z.string().min(1, "Full name is required"),
  email: z.email("Email is invalid").min(1, "Email is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters long")
    .max(11, "Phone number must be at most 11 characters long"),
  dob: z.date({ required_error: "Date of Birth is required." }),
  avatar: optionalFileSchema.optional(),
});

// Schema cho việc Tạo Tenant mới
export const NewTenantSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  idNumber: z
    .string()
    .min(12, "Id Persion must be at least 12 characters long"),
  phoneNumber: z
    .string()
    .min(10, "SĐT phải có ít nhất 10 số")
    .max(11, "SĐT không quá 11 số"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .min(1, "Email không được để trống"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
