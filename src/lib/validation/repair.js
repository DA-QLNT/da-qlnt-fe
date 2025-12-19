import { z } from "zod";

// Schema cho file ảnh
const optionalFileSchema = z
  .instanceof(FileList)
  .refine(
    (files) => files.length === 0 || files.length <= 5,
    "Chỉ chọn tối đa 5 ảnh."
  )
  .optional();

// 🚨 SCHEMA CHUNG CHO TẠO VÀ SỬA
export const RepairRequestSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự."),

  description: z.string().optional(),

  images: optionalFileSchema,

  existingImageUrls: z.array(z.string()).optional(),
});

// owner
export const RepairCompletionSchema = z.object({
  note: z.string(),
  cost: z.coerce.number().min(0, "Chi phí phải là số dương."), // Dùng coerce để handle input number
});
