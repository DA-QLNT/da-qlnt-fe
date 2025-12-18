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
  fullName: z.string().min(1, "Yê cầu tên đầy đủ"),
  email: z.email("Email is invalid").min(1, "Yêu cầu nhập email"),
  address: z.string().min(1, "Yêu cầu nhập địa chỉ"),
  phoneNumber: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(11, "Số điện thoại không quá 11 số"),
  dob: z.date({ required_error: "Ngày sinh là bắt buộc." }),
  avatar: optionalFileSchema.optional(),
});

// Schema cho việc Tạo Tenant mới
export const NewTenantSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống"),
  idNumber: z.string().min(12, "ID phải ít nhất 12 số"),
  phoneNumber: z
    .string()
    .min(10, "SĐT phải có ít nhất 10 số")
    .max(11, "SĐT không quá 11 số"),
  email: z.string().email("Email không hợp lệ"),
  address: z.string().min(3, "Địa chỉ là bắt buộc."),
  dob: z.date({ required_error: "Ngày sinh là bắt buộc." }),
  //   .min(1, "Email không được để trống"),
  // password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
