import { z } from "zod";
const fileSchema = z
  .instanceof(FileList)
  .refine((files) => files.length > 0, {
    message: "Ảnh đại diện là bắt buộc.",
  });
export const UserAddSchema = z.object({
  username: z.string().min(3, "Tên người dùng phải có ít nhất 3 ký tự"),
  password: z.string().min(4, "Mật khẩu phải có ít nhất 4 ký tự"),
  email: z
    .string()
    .email("Địa chỉ email không hợp lệ")
    .min(1, "Yêu cầu nhập email"),
  address: z.string().min(1, "Địa chỉ là bắt buộc."),
  phoneNumber: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(11, "Số điện thoại không quá 11 số"),
  dob: z.date({
    required_error: "Ngày sinh là bắt buộc.",
  }),
  avatar: fileSchema,
});

const optionalFileSchema = z
  .instanceof(FileList)
  .refine(
    (files) => files.length === 0 || files.length === 1,
    "Chỉ chọn một ảnh."
  )
  .optional();
export const UserEditSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.email("Email không hợp lệ").min(1, "Yêu cầu nhập email"),
  address: z.string().min(1, "Địa chỉ là bắt buộc."),
  phoneNumber: z
    .string()
    .min(10, "Số điện thoại phải có ít nhất 10 số")
    .max(11, "Số điện thoại không quá 11 số"),
  dob: z.date({ required_error: "Ngày sinh là bắt buộc." }),
  avatar: optionalFileSchema.optional(),
});
