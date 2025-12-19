import { email, z } from "zod";

const requiredNumber = z.coerce.number().min(0, "Phải là số dương.");
//  Helper cho Select: Chấp nhận number, hoặc undefined (tức là chưa chọn)
const requiredSelectNumber = z
  .union([z.number(), z.undefined()])
  .refine((val) => val !== undefined && val !== null, "Trường này là bắt buộc.")
  .pipe(z.coerce.number()); // Ép kiểu sau khi đảm bảo không phải undefined
// Schema cho mỗi khách thuê
export const TenantSchema = z.object({
  id: z.number({ required_error: "ID khách thuê là bắt buộc." }),
  fullName: z.string().min(3, "Tên khách thuê là bắt buộc."),
  phoneNumber: z.string().min(10, "SĐT bắt buộc phải có 10 số."),
  email: z.string().email("Email không hợp lệ."),
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
  houseServiceIds: z
    .array(
      z.object({
        serviceId: z.number(),
        houseServiceId: z.number(),
        // lastMeterReading: z.number().optional(), // lastMeterReading là tùy chọn
      })
    )
    .min(0, "Ít nhất một dịch vụ cần được chọn nếu có."), // Có thể là 0 nếu không có dịch vụ nào
  tenants: z.array(TenantSchema).min(1, "Hợp đồng cần ít nhất một khách thuê."),
});
//  SCHEMA CỦA FORM TẠO NHANH (EarlyContractAddSchema)
export const EarlyContractAddSchema = z.object({
  //  Dùng requiredSelectNumber cho House/Room
  houseId: requiredSelectNumber,
  roomId: requiredSelectNumber,
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
  houseServiceIds: z
    .array(z.object({ serviceId: z.number(), houseServiceId: z.number() }))
    .min(0, "Ít nhất một dịch vụ cần được chọn nếu có."),
  tenants: z.array(TenantSchema).min(1, "Hợp đồng cần ít nhất một khách thuê."),
});

export const ContractInforEditSchema = z.object({
  // ID hợp đồng bắt buộc cho việc Update
  id: z.number({ required_error: "Contract ID là bắt buộc." }),

  // Thông tin cơ bản
  startDate: z.date({ required_error: "Ngày bắt đầu là bắt buộc." }),
  endDate: z.date({ required_error: "Ngày kết thúc là bắt buộc." }),
  rent: requiredNumber.min(1000, "Giá thuê phải lớn hơn 1,000 VNĐ."),
  deposit: requiredNumber.min(1000, "Giá cọc phải lớn hơn 1,000 VNĐ."),
  penaltyAmount: requiredNumber.min(1000, "Phí phạt phải lớn hơn 1,000 VNĐ."),
  paymentCycle: z.coerce
    .number()
    .min(1, "Chu kỳ thanh toán tối thiểu là 1 tháng."),
});

export const ContractExtendSchema = z.object({
  newEndDate: z.date({ required_error: "Ngày kết thúc mới là bắt buộc." }),

  // Tùy chọn
  newRent: requiredNumber.min(1000, "Giá thuê phải lớn hơn 1,000 VNĐ."),

  note: z.string().optional(),
});

// Schema cho việc cập nhật đầy đủ hợp đồng
export const ContractFullUpdateSchema = z.object({
  // ID hợp đồng
  id: z.number(),

  // Thông tin cơ bản
  startDate: z.date({ required_error: "Ngày bắt đầu là bắt buộc." }),
  endDate: z.date({ required_error: "Ngày kết thúc là bắt buộc." }),
  rent: requiredNumber.min(1000, "Giá thuê phải lớn hơn 1,000 VNĐ."),
  deposit: requiredNumber.min(1000, "Giá cọc phải lớn hơn 1,000 VNĐ."),
  penaltyAmount: requiredNumber.min(1000, "Phí phạt phải lớn hơn 1,000 VNĐ."),
  paymentCycle: z.coerce
    .number()
    .min(1, "Chu kỳ thanh toán tối thiểu là 1 tháng."),

  // Dịch vụ: [{ serviceId, houseServiceId }]
  houseServiceIds: z.array(
    z.object({
      serviceId: z.number(),
      houseServiceId: z.number(),
    })
  ),

  // Khách thuê: [{ id, representative }]
  tenants: z
    .array(
      z.object({
        id: z.number(),
        representative: z.boolean(),
        // Các trường phụ để hiển thị UI nhưng không gửi body
        fullName: z.string().optional(),
        phoneNumber: z.string().optional(),
      })
    )
    .min(1, "Cần ít nhất một khách thuê."),
});
