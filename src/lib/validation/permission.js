import { z } from "zod";

export const PermissionSchema = z.object({
  id: z.number().nullable().optional(),
  code: z.string().min(3, "Mã quyền phải có ít nhất 3 ký tự").toUpperCase(),
  description: z.string().nullable().optional(),
});
