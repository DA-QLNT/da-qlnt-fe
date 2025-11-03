import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { RoomEditSchema } from "@/lib/validation/room";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useUpdateRoomMutation } from "../../store/roomApi";

const RoomEditForm = ({ initialData, onFormSubmitSuccess }) => {
  const [updateRoom, { isLoading: isMutating }] = useUpdateRoomMutation();
  const defaultValues = useMemo(
    () => ({
      id: initialData.id,
      code: initialData.code || "",
      floor: initialData.floor || 0,
      maxPeople: initialData.maxPeople || 1,
      rent: initialData.rent || 0,
      area: initialData.area || 0,
      description: initialData.description || "",
      avatar: undefined,
      images: undefined,
    }),
    [initialData]
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(RoomEditSchema),
    defaultValues: defaultValues,
  });
  const selectedAvatar = watch("avatar");
  const selectedImages = watch("images");

  const avatarPreview = selectedAvatar?.[0]
    ? URL.createObjectURL(selectedAvatar[0])
    : initialData.avatarUrl;

  const allImages = useMemo(() => {
    const newFiles = selectedImages
      ? Array.from(selectedImages).map((file) => URL.createObjectURL(file))
      : [];
    const existingImages = initialData.images || [];
    return newFiles.length > 0 ? newFiles : existingImages;
  }, [selectedImages, initialData.images]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key !== "avatar" && key !== "images" && key !== "status") {
        let value = data[key];

        if (["area", "rent"].includes(key)) {
          value = parseFloat(value);
        } else if (["floor", "maxPeople", "id"].includes(key)) {
          value = parseInt(value, 10);
        }

        formData.append(key, value);
      }
    });
    const avatarFile = data.avatar?.[0];
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }
    const imageFiles = data.images;
    if (imageFiles && imageFiles.length > 0) {
      Array.from(imageFiles).forEach((file) => {
        formData.append("images", file);
      });
    }
    try {
      await updateRoom({
        roomId: initialData.id,
        formData,
      }).unwrap();
      toast.success("Update room successfully");
      onFormSubmitSuccess();
    } catch (error) {
      toast.error("Update room failed");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* hidden id field - update */}
      <input type="hidden" {...register("id", { valueAsNumber: true })} />
      <FieldGroup>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <Field>
            <FieldLabel>Code:</FieldLabel>
            <Input disabled={isMutating} {...register("code")} />
            <FieldError>{errors.code?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Area:</FieldLabel>
            <Input type="number" disabled={isMutating} {...register("area")} />
            <FieldError>{errors.area?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Rent/month (vnd):</FieldLabel>
            <Input type="number" disabled={isMutating} {...register("rent")} />
            <FieldError>{errors.rent?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Floor:</FieldLabel>
            <Input
              type="number"
              disabled={isMutating}
              {...register("floor", { valueAsNumber: true })}
            />
            <FieldError>{errors.floor?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Max people:</FieldLabel>
            <Input
              type="number"
              disabled={isMutating}
              {...register("maxPeople", { valueAsNumber: true })}
            />
            <FieldError>{errors.maxPeople?.message}</FieldError>
          </Field>
          <Field className="col-span-full">
            <FieldLabel>Description:</FieldLabel>
            <Textarea {...register("description")} disabled={isMutating} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
          <Field className="col-start-1">
            <FieldLabel>Avatar:</FieldLabel>
            <div className="flex items-center gap-2">
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <Input
                type="file"
                {...register("avatar")}
                disabled={isMutating}
              />
            </div>
            <FieldError>{errors.avatar?.message}</FieldError>
          </Field>
          <Field className="md:col-start-3">
            <FieldLabel>Other images: ({allImages.length} images)</FieldLabel>
            <Input
              type="file"
              multiple
              {...register("images")}
              disabled={isMutating}
            />
            <FieldError>{errors.images?.message}</FieldError>
          </Field>
        </div>
      </FieldGroup>
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isMutating}
          className="w-full sm:w-auto"
        >
          {isMutating ? <Spinner /> : "Update"}
        </Button>
      </div>
    </form>
  );
};

export default RoomEditForm;
