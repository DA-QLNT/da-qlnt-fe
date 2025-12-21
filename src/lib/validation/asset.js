import { z } from "zod";

export const getAssetSchema = (t) => {
  return z.object({
    // id is null/optional when Add, number when Edit
    id: z.number().nullable().optional(),

    name: z.string().min(2, t("Validation.NameLength")),
  });
};

export const getAssetItemEditSchema = (t) => {
  const requiredString = z.string().min(1, t("Validation.Required"));
  const requiredNumber = z.coerce
    .number({ invalid_type_error: t("Validation.MustBeNumber") })
    .min(0, t("Validation.MustBePositive"));
  const optionalSingleFileSchema = z
    .instanceof(FileList)
    .refine(
      (files) => files.length === 0 || files.length === 1,
      t("Validation.SelectOneImage")
    )
    .optional();

  return z.object({
    id: z.number(),
    serialNumber: z.string().nullable().optional(),
    price: requiredNumber,
    description: requiredString,

    boughtAt: z.union([z.date(), z.string()]),

    image: optionalSingleFileSchema,
  });
};

export const getAssetItemAddSchema = (t) => {
  return z.object({
    // Foreign keys
    roomId: z.number(),
    assetId: z.number({ invalid_type_error: t("Validation.SelectAssetType") }),
    description: z.string().min(3, t("Validation.DescriptionLength")),
    price: z.coerce
      .number({ invalid_type_error: t("Validation.PriceMustBeNumber") })
      .min(1, t("Validation.PriceMustBePositive")),
    boughtAt: z.date({ required_error: t("Validation.BoughtAtRequired") }),

    image: z
      .instanceof(FileList)
      .refine((files) => files.length === 1, t("Validation.SelectAvatar")),
  });
};

// old

const requiredString = z.string().min(1, "Trường này là bắt buộc.");
const requiredNumber = z.coerce
  .number({ invalid_type_error: "Phải là số" })
  .min(0, "Phải là số dương.");
const optionalSingleFileSchema = z
  .instanceof(FileList)
  .refine(
    (files) => files.length === 0 || files.length === 1,
    "Chỉ chọn một ảnh."
  )
  .optional();

export const AssetSchema = z.object({
  // id là null/optional khi Add, number khi Edit
  id: z.number().nullable().optional(),

  name: z.string().min(2, "Tên tài sản phải có ít nhất 2 ký tự."),
});

export const AssetItemEditSchema = z.object({
  id: z.number(),
  serialNumber: z.string().nullable().optional(),
  price: requiredNumber,
  description: requiredString,

  boughtAt: z.union([z.date(), z.string()]),

  image: optionalSingleFileSchema,
});
export const AssetItemAddSchema = z.object({
  // Foreign keys
  roomId: z.number(),
  assetId: z.number({ invalid_type_error: "Vui lòng chọn loại tài sản." }),
  description: z.string().min(3, "Mô tả ít nhất 3 ký tự."),
  price: z.coerce
    .number({ invalid_type_error: "Giá phải là số" })
    .min(1, "Giá phải lớn hơn 0."),
  boughtAt: z.date({ required_error: "Ngày mua là bắt buộc." }),

  image: z
    .instanceof(FileList)
    .refine((files) => files.length === 1, "Vui lòng chọn 1 ảnh đại diện."),
});
