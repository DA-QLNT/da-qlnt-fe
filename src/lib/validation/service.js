import { z } from "zod";

export const ServiceSchema = z.object({
  id: z.number().nullable().optional(), 
  name: z.string().min(3, "Tên dịch vụ phải có ít nhất 3 ký tự."),
  unit: z.string().min(1, "Đơn vị tính là bắt buộc."),
  // Type cần là số (0, 1, 2) nhưng RHF Select trả về string
  type: z.coerce.number({
    invalid_type_error: "Vui lòng chọn loại tính tiền.",
  }),
});
