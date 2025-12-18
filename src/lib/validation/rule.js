import { z } from "zod";
export const RuleSchema = z.object({
  name: z.string().min(3, "Tên vai trò phải có ít nhất 3 ký tự"),
  description: z.string().min(3, "Mô tả phải có ít nhất 3 ký tự"),
});
