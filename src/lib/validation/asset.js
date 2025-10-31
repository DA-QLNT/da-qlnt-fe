import { z } from "zod";

export const AssetSchema = z.object({
  // id là null/optional khi Add, number khi Edit
  id: z.number().nullable().optional(),

  name: z.string().min(2, "Tên tài sản phải có ít nhất 2 ký tự."),
});
