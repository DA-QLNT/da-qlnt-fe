import { z } from "zod";

const requiredNumber = z.coerce.number().min(0, "Phải là số dương.");

// Schema cho mỗi khách thuê
export const TenantSchema = z.object({
  fullName: z.string().min(3, "Tên khách thuê là bắt buộc."),
  phoneNumber: z.string().min(10, "SĐT bắt buộc phải có 10 số."),
});

// Schema cho việc tạo hợp đồng
export const ContractAddSchema = z.object({
  // Foreign Keys (hidden)
  roomId: z.number(),
  ownerId: z.number(),

  // Thông tin cơ bản
  startDate: z.date({ required_error: "Ngày bắt đầu là bắt buộc." }),
  endDate: z.date({ required_error: "Ngày kết thúc là bắt buộc." }),
  rent: requiredNumber.min(1000, "Giá thuê phải lớn hơn 1,000 VNĐ."),
  deposit: requiredNumber.min(1000, "Giá cọc phải lớn hơn 1,000 VNĐ."),
  penaltyAmount: requiredNumber.min(1000, "Phí phạt phải lớn hơn 1,000 VNĐ."),
  paymentCycle: z.coerce
    .number()
    .min(1, "Chu kỳ thanh toán tối thiểu là 1 tháng."),

  // Danh sách dịch vụ và khách thuê
  houseServiceIds: z.array(z.number()).optional(),
  tenants: z.array(TenantSchema).min(1, "Hợp đồng cần ít nhất một khách thuê."),
});
