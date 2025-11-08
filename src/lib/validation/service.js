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
export const ServiceHouseAssignmentSchema = z.object({
  serviceId: z.number(),

  method: z.coerce.number({ invalid_type_error: "Vui lòng chọn cách tính." }),
  price: z.coerce
    .number({ invalid_type_error: "Giá phải là số" })
    .min(0, "Giá phải là số dương."),
  effectiveDate: z.date({ required_error: "Ngày hiệu lực là bắt buộc." }),

  houseIds: z.array(z.number()).min(1, "Vui lòng chọn ít nhất một nhà trọ."),
});

export const HouseServiceRowSchema = z.object({
  method: z.coerce.number({ invalid_type_error: "Chọn cách tính." }),
  price: z.coerce
    .number({ invalid_type_error: "Giá phải là số" })
    .min(0, "Giá phải >= 0."),
  effectiveDate: z.date({ required_error: "Ngày hiệu lực là bắt buộc." }),
});