import { z } from "zod";

export const PermissionSchema = z.object({
  id: z.number().nullable().optional(),
  code: z
    .string()
    .min(3, "Code must be at least 3 characters long")
    .toUpperCase(),
  description: z.string().nullable().optional(),
});
