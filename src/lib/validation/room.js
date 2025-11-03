import { z } from "zod";

const requiredString = z.string().min(1, "Trường này là bắt buộc.");
const requiredNumber = z.coerce
  .number({ invalid_type_error: "Phải là số" })
  .min(0, "Phải là số dương.");

// --- File Schema ---
const requiredSingleFileSchema = z
  .instanceof(FileList)
  .refine((files) => files.length === 1, "Vui lòng chọn 1 ảnh đại diện.");

const optionalSingleFileSchema = z
  .instanceof(FileList)
  .refine(
    (files) => files.length === 0 || files.length === 1,
    "Chỉ chọn một ảnh."
  )
  .optional();

const optionalMultipleFilesSchema = z.instanceof(FileList).optional();
// --------------------


//  ADD==============
export const RoomAddSchema = z.object({
  code: requiredString,
  floor: requiredNumber,
  maxPeople: requiredNumber,
  rent: requiredNumber,
  area: requiredNumber,

  description: z.string().optional(),

  avatar: requiredSingleFileSchema,
  images: optionalMultipleFilesSchema,
});

//  edit
export const RoomEditSchema = z.object({
  // ID là null/optional khi Add, number khi Edit
  id: z.number().nullable().optional(),

  // Các trường bắt buộc
  code: requiredString,
  floor: requiredNumber,
  maxPeople: requiredNumber,
  rent: requiredNumber,
  area: requiredNumber,

  // Mô tả (Tùy chọn)
  description: z.string().optional(),

  // File upload
  avatar: optionalSingleFileSchema,
  images: optionalMultipleFilesSchema,
});
