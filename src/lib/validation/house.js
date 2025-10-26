import { z } from "zod";
export const HouseAddSchema = z.object({
  name: z.string().min(1, "Name is required"),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  address: z.string().min(3, "Address must be at least 3 characters long"),
  area: z.number().optional().or(z.literal("")),
  ruleIds: z.array(z.number()).optional(),
});
