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
import { Loader2, Save, Calendar as CalendarIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssetItemEditSchema } from "@/lib/validation/asset"; // 🚨 Import schema
import { useUpdateAssetItemMutation } from "../../store/roomApi";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import React, { useMemo } from "react";

export default function AssetItemEditForm({
  initialData,
  onFormSubmitSuccess,
}) {
  const [updateItem, { isLoading: isMutating }] = useUpdateAssetItemMutation();

  
  const defaultValues = useMemo(
    () => ({
      id: initialData.id,
      serialNumber: initialData.serialNumber || "",
      price: initialData.price || 0,
      description: initialData.description || "",
      // Chuyển chuỗi ISO sang Date object để Calendar hoạt động
      boughtAt: initialData.boughtAt
        ? parseISO(initialData.boughtAt)
        : undefined,
      image: undefined,
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
    resolver: zodResolver(AssetItemEditSchema),
    defaultValues: defaultValues,
  });

  const selectedFile = watch("image");
  const isDisabled = isMutating;

  const onSubmit = async (data) => {
    const formData = new FormData();

    
    const formattedBoughtAt = data.boughtAt
      ? format(new Date(data.boughtAt), "yyyy-MM-dd")
      : null;

    Object.keys(data).forEach((key) => {
      
      if (key !== "image" && key !== "boughtAt") {
        formData.append(key, data[key]);
      }
    });

    if (formattedBoughtAt) {
      formData.append("boughtAt", formattedBoughtAt);
    }

    
    const file = data.image?.[0];
    if (file) {
      formData.append("image", file); 
    }

    try {
      await updateItem({ itemId: initialData.id, formData }).unwrap();
      toast.success(`Cập nhật Item ${initialData.id} thành công!`);
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Cập nhật thất bại.");
      console.error("Asset Item update error:", error);
    }
  };

  const filePreview = selectedFile?.[0]
    ? URL.createObjectURL(selectedFile[0])
    : initialData.imageUrl || "/userDefault.png";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("id", { valueAsNumber: true })} />
      <FieldGroup>
        <div className="grid gap-4 grid-cols-2">
          {/* Serial Number */}
          <Field>
            <FieldLabel>Serial Number:</FieldLabel>
            <Input {...register("serialNumber")} disabled={isDisabled} />
            <FieldError>{errors.serialNumber?.message}</FieldError>
          </Field>

          {/* Price */}
          <Field>
            <FieldLabel>Price (*):</FieldLabel>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.price?.message}</FieldError>
          </Field>

          {/* Bought At (Date) */}
          <Field>
            <FieldLabel>Bought At:</FieldLabel>
            <Controller
              name="boughtAt"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal"
                      )}
                      disabled={isDisabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Select Date</span>
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

          {/* Avatar Input */}
          <Field>
            <FieldLabel>Image:</FieldLabel>
            <div className="flex items-center gap-2">
              <img
                src={filePreview}
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

          {/* Description */}
          <Field className={"col-span-full"}>
            <FieldLabel>Description (*):</FieldLabel>
            <Textarea {...register("description")} disabled={isDisabled} />
            <FieldError>{errors.description?.message}</FieldError>
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
          Save Changes
        </Button>
      </div>
    </form>
  );
}
