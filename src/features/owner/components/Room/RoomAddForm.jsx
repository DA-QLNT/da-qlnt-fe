// components/Room/RoomAddForm.jsx
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RoomAddSchema } from "@/lib/validation/room"; // Chỉ dùng schema cho Add
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateRoomMutation } from "../../store/roomApi"; // Chỉ dùng Create Mutation
import { Loader2, Plus } from "lucide-react"; // Thay Save bằng Plus cho Add
import React from "react";
import { useTranslation } from "react-i18next";

export default function RoomAddForm({ houseId, onFormSubmitSuccess }) {
  const { t } = useTranslation("house");
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const isMutating = isCreating;

  const defaultValues = {
    // Giá trị mặc định cho form thêm
    code: "",
    floor: 0,
    maxPeople: 1,
    rent: 0,
    area: 0,
    description: "",
    avatar: undefined,
    images: undefined,
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(RoomAddSchema),
    defaultValues: defaultValues,
  });

  const selectedAvatar = watch("avatar");
  const avatarPreview = selectedAvatar?.[0]
    ? URL.createObjectURL(selectedAvatar[0])
    : "/userDefault.png"; // Avatar mặc định cho form add

  const isDisabled = isMutating;

  const onSubmit = async (data) => {
    const formData = new FormData();

    // 1. Append Fields CƠ BẢN
    Object.keys(data).forEach((key) => {
      if (key !== "avatar" && key !== "images") {
        const value = data[key];
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });

    // THÊM houseId và Status MẶC ĐỊNH
    formData.append("houseId", houseId);
    formData.append("status", 0);

    // 2. Xử lý Files
    const avatarFile = data.avatar?.[0];
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    } else {
      toast.error(t("PleaseSelectAvatar"));
      return;
    }

    const imageFiles = data.images;
    if (imageFiles && imageFiles.length > 0) {
      Array.from(imageFiles).forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      await createRoom(formData).unwrap(); // Truyền formData trực tiếp
      toast.success(t("AddSuccess"));
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || t("AddFail"));
      console.error("Room add error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {/* Code */}
          <Field>
            <FieldLabel>{t("Code")}:*</FieldLabel>
            <Input disabled={isDisabled} {...register("code")} />
            <FieldError>{errors.code?.message}</FieldError>
          </Field>

          {/* Area */}
          <Field>
            <FieldLabel>{t("Area")} (m2)*:</FieldLabel>
            <Input
              type="number"
              {...register("area", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.area?.message}</FieldError>
          </Field>

          {/* Rent */}
          <Field>
            <FieldLabel>{t("Rent")}*: </FieldLabel>
            <Input
              type={"number"}
              {...register("rent", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.rent?.message}</FieldError>
          </Field>

          {/* Floor */}
          <Field>
            <FieldLabel>{t("Floor")}*: </FieldLabel>
            <Input
              type="number"
              {...register("floor", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.floor?.message}</FieldError>
          </Field>

          {/* Max people */}
          <Field>
            <FieldLabel>{t("MaxPeople")}*: </FieldLabel>
            <Input
              type="number"
              {...register("maxPeople", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.maxPeople?.message}</FieldError>
          </Field>

          {/* Description */}
          <Field className={"col-span-full"}>
            <FieldLabel>{t("Description")}:</FieldLabel>
            <Textarea {...register("description")} disabled={isDisabled} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>

          {/* Avatar Input */}
          <Field className={"col-span-full md:col-span-1"}>
            <FieldLabel>{t("Avatar")}:*</FieldLabel>
            <div className="flex items-center gap-2">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <Input
                type={"file"}
                {...register("avatar")}
                disabled={isDisabled}
              />
            </div>
            <FieldError>{errors.avatar?.message}</FieldError>
          </Field>

          {/* Other Images Input */}
          <Field className={"col-span-full md:col-span-2"}>
            <FieldLabel>{t("OtherImages")}:</FieldLabel>
            <Input
              type={"file"}
              multiple
              {...register("images")}
              disabled={isDisabled}
            />
            <FieldError>{errors.images?.message}</FieldError>
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
            <Plus className="h-4 w-4 mr-2" />
          )}
          {t("AddRoom")}
        </Button>
      </div>
    </form>
  );
}
