import { z } from "zod";

const requiredString = z.string().min(1, "Trường này là bắt buộc.");
const requiredNumber = z.coerce
  .number({ invalid_type_error: "Phải là số" })
  .min(0, "Phải là số dương.");
const statusSchema = z.string().min(1, "Trạng thái là bắt buộc."); // '0' hoặc '1'

// --- File Schema ---
const optionalSingleFileSchema = z
  .instanceof(FileList)
  .refine(
    (files) => files.length === 0 || files.length === 1,
    "Chỉ chọn một ảnh."
  )
  .optional();

const optionalMultipleFilesSchema = z.instanceof(FileList).optional();
// --------------------

export const RoomEditSchema = z.object({
  // ID là null/optional khi Add, number khi Edit
  id: z.number().nullable().optional(),

  // Các trường bắt buộc
  code: requiredString,
  floor: requiredNumber,
  maxPeople: requiredNumber,
  rent: requiredNumber,
  area: requiredNumber,
  status: statusSchema,

  // Mô tả (Tùy chọn)
  description: z.string().optional(),

  // File upload
  avatar: optionalSingleFileSchema,
  images: optionalMultipleFilesSchema,
});
