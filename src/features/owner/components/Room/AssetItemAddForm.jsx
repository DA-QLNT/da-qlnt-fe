import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAssetItemMutation } from "../../store/roomApi";
import { useGetAssetsQuery } from "../../store/assetApi"; // 🚨 Import hook Asset Types
import toast from "react-hot-toast";
import { format } from "date-fns/format";
import {
  Loader2,
  Calendar as CalendarIcon,
  Save,
  Image as ImageIcon,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import { AssetItemAddSchema } from "@/lib/validation/asset";
import { Spinner } from "@/components/ui/spinner";
import AssetCreatOrUpdateDialog from "../Asset/AssetCreatOrUpdateDialog";
import { useTranslation } from "react-i18next";

const defaultValues = {
  assetId: undefined,
  description: "",
  price: 0,
  boughtAt: undefined,
  image: undefined,
};
const ADD_NEW_ASSET_CODE = "ADD_NEW_ASSET_CODE";

export default function AssetItemAddForm({ roomId, onFormSubmitSuccess }) {
  const { t } = useTranslation("house");
  const [createItem, { isLoading: isMutating }] = useCreateAssetItemMutation();

  // Them asset type trong form asset-item
  const [isAssetTypeDialogOpen, setIsAssetTypeDialogOpen] = useState(false);
  const {
    data: assetData,
    isLoading: loadingAssets,
    refetch: refetchAssets,
  } = useGetAssetsQuery(
    {
      page: 0,
      size: 50,
    },
    {
      // Tắt fetch lại khi mount nếu không cần thiết, chỉ dùng refetch
      refetchOnMountOrArgChange: false,
    }
  );
  const assetTypes = assetData?.content || [];

  //
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(AssetItemAddSchema),
    defaultValues: { ...defaultValues, roomId: roomId },
  });

  const selectedFile = watch("image");
  const isDisabled = isMutating || loadingAssets;

  const onSubmit = async (data) => {
    const formData = new FormData();

    // 1. Format DOB và chuẩn bị payload
    const formattedBoughtAt = data.boughtAt
      ? format(data.boughtAt, "yyyy-MM-dd")
      : null;

    // Append các trường text/number (RoomId, AssetId, Price, Description)
    Object.keys(data).forEach((key) => {
      if (key !== "image" && key !== "boughtAt") {
        formData.append(key, data[key]);
      }
    });

    if (formattedBoughtAt) {
      formData.append("boughtAt", formattedBoughtAt);
    }

    // 2. Xử lý File (Single File)
    const file = data.image?.[0];
    if (file) {
      formData.append("image", file);
    }

    try {
      await createItem(formData).unwrap();
      toast.success(t("AddSuccess"));
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(t("AddFail"));
      console.error("Asset Item create error:", error);
    }
  };

  const filePreview = selectedFile?.[0]
    ? URL.createObjectURL(selectedFile[0])
    : null;

  return (
    <>
      {/* dialog */}
      <AssetCreatOrUpdateDialog
        open={isAssetTypeDialogOpen}
        onOpenChange={(open) => {
          setIsAssetTypeDialogOpen(open);
          if (!open) {
            refetchAssets();
          }
        }}
        initialData={null} // mark as add mode
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("roomId", { valueAsNumber: true })} />
        <FieldGroup>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {/* Select Asset Type */}
            <Field className="md:col-span-3">
              <FieldLabel>{t("Assets")}(*)</FieldLabel>
              <Controller
                name="assetId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(val) => {
                      if (val === ADD_NEW_ASSET_CODE) {
                        setIsAssetTypeDialogOpen(true);
                      } else {
                        field.onChange(Number(val));
                      }
                    }}
                    value={field.value?.toString()}
                    disabled={isDisabled || loadingAssets}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("SelectAssets")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ADD_NEW_ASSET_CODE}>
                        <div className="flex items-center gap-2">
                          <Plus /> {t("AddNewAsset")}
                        </div>
                      </SelectItem>

                      {loadingAssets ? (
                        <div className="p-2 text-center">
                          <Spinner size={20} />
                        </div>
                      ) : (
                        assetTypes.map((asset) => (
                          <SelectItem
                            key={asset.id}
                            value={asset.id.toString()}
                          >
                            {asset.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.assetId?.message}</FieldError>
            </Field>

            {/* Description */}
            <Field className="md:col-span-3">
              <FieldLabel>{t("Description")}(*):</FieldLabel>
              <Textarea {...register("description")} disabled={isDisabled} />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>

            {/* Price */}
            <Field>
              <FieldLabel>{t("PriceBought")}(*):</FieldLabel>
              <Input
                type="number"
                {...register("price", { valueAsNumber: true })}
                disabled={isDisabled}
              />
              <FieldError>{errors.price?.message}</FieldError>
            </Field>

            {/* Bought At (Date) */}
            <Field className="md:col-span-2">
              <FieldLabel>{t("DateBought")}(*):</FieldLabel>
              <Controller
                name="boughtAt"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal px-2"
                        )}
                        disabled={isDisabled}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t("EnterDateBought")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown"
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              <FieldError>{errors.boughtAt?.message}</FieldError>
            </Field>

            {/* Image Input */}
            <Field className="md:col-span-3">
              <FieldLabel>Ảnh Item (*):</FieldLabel>
              <div className="flex items-center gap-4">
                <img
                  src={filePreview || "/userDefault.png"}
                  alt="Item"
                  className="w-12 h-12 object-cover border rounded-md"
                />
                <Input
                  type={"file"}
                  {...register("image")}
                  disabled={isDisabled}
                />
              </div>
              <FieldError>{errors.image?.message}</FieldError>
            </Field>
          </div>
        </FieldGroup>

        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isDisabled}
            className="w-full sm:w-auto"
          >
            {isMutating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("AddItem")}
          </Button>
        </div>
      </form>
    </>
  );
}
