import { z } from "zod";
export const RoleAddSchema = z.object({
  name: z
    .string()
    .min(3, "Vai trò phải có ít nhất 3 ký tự")
    .toUpperCase("Tên Role phải viết HOA."),
});
