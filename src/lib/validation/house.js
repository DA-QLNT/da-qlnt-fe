import { z } from "zod";
export const HouseAddSchema = z.object({
  name: z.string().min(1, "Yêu cầu tên nhà trọ"),
  province: z.string().min(1, "Yêu cầu tên tỉnh"),
  district: z.string().min(1, "Yêu cầu tên quận/huyện"),
  address: z.string().min(3, "Địa chỉ là bắt buộc."),
  area: z.number().optional().or(z.literal("")),
  ruleIds: z.array(z.number()).optional(),
});

export const HouseEditSchema = z.object({
  id: z.number(),
  province: z.string().min(1, "Yêu cầu tên tỉnh"),
  district: z.string().min(1, "Yêu cầu tên quận/huyện"),
  address: z.string().min(3, "Địa chỉ là bắt buộc."),
  area: z.number().optional().or(z.literal("")),
  ruleIds: z.array(z.number()).optional(),
});
