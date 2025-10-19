import { z } from "zod";
export const RoleAddSchema = z.object({
  name: z
    .string()
    .min(3, "Role name must be at least 3 characters long")
    .toUpperCase("Tên Role phải viết HOA."),
});
