import { z } from "zod";
export const HouseAddSchema = z.object({
  name: z.string().min(1, "Yêu cầu tên nhà trọ"),
  province: z.string().min(1, "Yêu cầu tên tỉnh"),
  district: z.string().min(1, "Yêu cầu tên quận/huyện"),
  address: z.string().min(3, "Địa chỉ là bắt buộc."),
  area: z.preprocess((val) => {
    // Nếu val là chuỗi rỗng hoặc undefined/null, trả về undefined
    if (val === "" || val === null || val === undefined) return undefined;
    // Nếu là number hợp lệ, trả về number
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().positive("Diện tích phải là số dương").optional()),
  ruleIds: z.array(z.number()).optional(),
});

export const HouseEditSchema = z.object({
  id: z.number(),
  province: z.string().min(1, "Yêu cầu tên tỉnh"),
  district: z.string().min(1, "Yêu cầu tên quận/huyện"),
  address: z.string().min(3, "Địa chỉ là bắt buộc."),
  area: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }, z.number().positive("Diện tích phải là số dương").optional()),
  ruleIds: z.array(z.number()).optional(),
});
