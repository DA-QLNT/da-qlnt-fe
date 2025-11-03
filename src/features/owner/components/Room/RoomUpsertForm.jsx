import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { RoomAddSchema, RoomEditSchema } from "@/lib/validation/room"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateRoomMutation, useUpdateRoomMutation } from "../../store/roomApi";
import { Loader2, Save } from "lucide-react";
import React from "react";

export default function RoomUpsertForm({ houseId, initialData = null, mode = 'add', onFormSubmitSuccess }) {
  const isEditMode = mode === 'edit';
  const schema = isEditMode ? RoomEditSchema : RoomAddSchema;
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const isMutating = isCreating || isUpdating;

  const defaultValues = useMemo(() => ({
    id: initialData?.id || undefined,
    code: initialData?.code || "",
    floor: initialData?.floor || 0,
    maxPeople: initialData?.maxPeople || 1,
    rent: initialData?.rent || 0,
    area: initialData?.area || 0,
    status: initialData?.status?.toString() || "0", 
    description: initialData?.description || "",
    avatar: undefined,
    images: undefined,
  }), [initialData]);

  const { register, handleSubmit, control, watch, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });
  
  const selectedAvatar = watch("avatar");
  const selectedImages = watch("images");

  // Logic Preview Avatar
  const avatarPreview = selectedAvatar?.[0]
    ? URL.createObjectURL(selectedAvatar[0])
    : initialData?.avatarUrl || "/userDefault.png";

  const isDisabled = isMutating;

  const onSubmit = async (data) => {
    const formData = new FormData();
    const mutationFn = isEditMode ? updateRoom : createRoom;
    
    // 1. Append Fields CƠ BẢN (Sử dụng giá trị đã được ép kiểu number từ Zod/RHF)
    Object.keys(data).forEach((key) => {
      // Loại trừ các trường file
      if (key !== 'avatar' && key !== 'images') {
        const value = data[key];
        
        // FormData chỉ chấp nhận String, File, hoặc Blob
        if (value !== null && value !== undefined) {
            formData.append(key, value); 
        }
      }
    });

    // 🚨 THÊM houseId và Status MẶC ĐỊNH CHO CHẾ ĐỘ CREATE
    if (!isEditMode) {
        formData.append('houseId', houseId);
        formData.append('status', 0); // Status mặc định khi tạo là 0 (Trống)
    }

    // 2. Xử lý Files
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
      // Logic gọi mutation giữ nguyên
      const args = isEditMode ? { roomId: initialData.id, formData } : { formData: formData }; // 🚨 Sửa args cho Create
      await mutationFn(args).unwrap();

      toast.success(isEditMode ? "Cập nhật phòng thành công!" : "Tạo phòng mới thành công!");
      if (!isEditMode) reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || (isEditMode ? "Cập nhật thất bại" : "Tạo phòng thất bại"));
      console.error("Room upsert error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Hidden ID field */}
      {isEditMode && (<input type="hidden" {...register("id", { valueAsNumber: true })} />)}
      
      <FieldGroup>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          
          {/* Code */}
          <Field>
            <FieldLabel>Code: (*)</FieldLabel>
            <Input disabled={isDisabled} {...register("code")} />
            <FieldError>{errors.code?.message}</FieldError>
          </Field>
          
          {/* Area */}
          <Field>
            <FieldLabel>Area (m2): (*)</FieldLabel>
            {/* 🚨 THÊM valueAsNumber */}
            <Input type="number" {...register("area", { valueAsNumber: true })} disabled={isDisabled} />
            <FieldError>{errors.area?.message}</FieldError>
          </Field>
          
          {/* Rent */}
          <Field>
            <FieldLabel>Rent: (*)</FieldLabel>
            {/* 🚨 THÊM valueAsNumber */}
            <Input type={"number"} {...register("rent", { valueAsNumber: true })} disabled={isDisabled} />
            <FieldError>{errors.rent?.message}</FieldError>
          </Field>

          {/* Floor */}
          <Field>
            <FieldLabel>Floor: (*)</FieldLabel>
            <Input type="number" {...register("floor", { valueAsNumber: true })} disabled={isDisabled} />
            <FieldError>{errors.floor?.message}</FieldError>
          </Field>
          
          {/* Max people */}
          <Field>
            <FieldLabel>Max people: (*)</FieldLabel>
            <Input type="number" {...register("maxPeople", { valueAsNumber: true })} disabled={isDisabled} />
            <FieldError>{errors.maxPeople?.message}</FieldError>
          </Field>
          
          {/* Status Select (Chỉ hiển thị khi Edit) */}
          {isEditMode && (
              <Field>
                <FieldLabel>Status:</FieldLabel>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isDisabled}>
                      <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Available</SelectItem>
                        <SelectItem value="1">Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>{errors.status?.message}</FieldError>
              </Field>
          )}

          {/* Description */}
          <Field className={"col-span-full"}>
            <FieldLabel>Description:</FieldLabel>
            <Textarea {...register("description")} disabled={isDisabled} />
            <FieldError>{errors.description?.message}</FieldError>
          </Field>
          
          {/* Avatar Input */}
          <Field className={"col-span-full md:col-span-1"}>
            <FieldLabel>Avatar: {isEditMode ? '' : '(*)'}</FieldLabel>
            <div className="flex items-center gap-2">
                <img src={avatarPreview} alt="Avatar" className="w-12 h-12 rounded-full object-cover border" />
                <Input type={"file"} {...register("avatar")} disabled={isDisabled} />
            </div>
            <FieldError>{errors.avatar?.message}</FieldError>
          </Field>
          
          {/* Other Images Input */}
          <Field className={"col-span-full md:col-span-2"}>
            <FieldLabel>Other images: (Gallery)</FieldLabel>
            <Input type={"file"} multiple {...register("images")} disabled={isDisabled} />
            <FieldError>{errors.images?.message}</FieldError>
          </Field>
        </div>
      </FieldGroup>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isDisabled} className="w-full sm:w-auto">
          {isMutating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {isEditMode ? 'Save Changes' : 'Create Room'}
        </Button>
      </div>
    </form>
  );
}
