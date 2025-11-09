import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Save,
  Calendar as CalendarIcon,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractAddSchema } from "@/lib/validation/contract";

import { useAuth } from "@/features/auth";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetHouseServicesByHouseIdQuery } from "../../store/serviceApi";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetRoomByIdQuery } from "../../store/roomApi";
import { PAYMENT_CYCLE_OPTIONS } from "@/assets/contract/paymentOptions";
import { useCreateContractMutation } from "../../store/contractApi";
import { useEffect } from "react";

export default function ContractAddForm({
  houseId,
  roomId,
  onFormSubmitSuccess,
}) {
  const { userId: ownerId } = useAuth();
  console.log(ownerId);

  const [createContract, { isLoading: isMutating }] =
    useCreateContractMutation();

  // Fetch danh sách dịch vụ của nhà trọ
  const { data: serviceData, isLoading: loadingServices } =
    useGetHouseServicesByHouseIdQuery(houseId, { skip: !houseId });
  const houseServices = serviceData || [];

  //   fetch thông tin room
  const {
    data: roomData,
    isLoading: loadingRoom,
    isFetching,
    isError,
  } = useGetRoomByIdQuery(roomId, {
    skip: !roomId,
  });

  //  RHF SETUP
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ContractAddSchema),
    defaultValues: {
      roomId: Number(roomId),
      ownerId: ownerId,
      rent: 0,
      deposit: 0,
      penaltyAmount: 50000,
      paymentCycle: 1,
      startDate: undefined,
      endDate: undefined,
      houseServiceIds: [],
      // Khởi tạo Tenant đầu tiên (bắt buộc)
      tenants: [{ fullName: "", phoneNumber: "" }],
    },
  });
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("❌ Form validation errors:", errors);
    }
  }, [errors]);
  // ✅ Reset form khi roomData được fetch xong
  useEffect(() => {
    if (roomData) {
      reset({
        roomId: Number(roomId),
        ownerId: ownerId,
        rent: roomData.rent || 0,
        deposit: roomData.rent || 0, // Hoặc roomData.deposit nếu có
        penaltyAmount: 50000,
        paymentCycle: 1,
        startDate: undefined,
        endDate: undefined,
        houseServiceIds: [],
        tenants: [{ fullName: "", phoneNumber: "" }],
      });
    }
  }, [roomData, reset, roomId, ownerId]);

  // 🚨 QUẢN LÝ MẢNG TENANTS
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tenants",
  });

  const isDisabled = isMutating || loadingServices;

  const onSubmit = async (data) => {
    // 1. Format Dates
    const payload = {
      ...data,
      ownerId: ownerId,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
    };

    try {
      console.log("Contract created successfully:", payload);
      await createContract(payload).unwrap();
      toast.success("Hợp đồng được tạo thành bản nháp (DRAFT)!");
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Tạo hợp đồng thất bại.");
      console.error("Contract create error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("roomId", { valueAsNumber: true })} />
      <input type="hidden" {...register("ownerId", { valueAsNumber: true })} />

      <FieldGroup>
        {/* ------------------- THÔNG TIN CƠ BẢN ------------------- */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Rent & Deposit */}
          <Field>
            <FieldLabel>Rent (*)</FieldLabel>
            <Input
              type="number"
              {...register("rent", { valueAsNumber: true })}
              disabled={isDisabled}
            />
          </Field>
          <Field>
            <FieldLabel>Deposit (*)</FieldLabel>
            <Input
              type="number"
              {...register("deposit", { valueAsNumber: true })}
              disabled={isDisabled}
            />
          </Field>

          {/* Start/End Date */}
          <Field>
            <FieldLabel>Start Date (*)</FieldLabel>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} disabled={isDisabled}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError>{errors.startDate?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>End Date (*)</FieldLabel>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} disabled={isDisabled}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            <FieldError>{errors.endDate?.message}</FieldError>
          </Field>

          {/* Payment Cycle & Penalty */}
          <Field>
            <FieldLabel>Payment Cycle(*)</FieldLabel>
            <Controller
              name="paymentCycle"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_CYCLE_OPTIONS.map((val) => (
                      <SelectItem key={val} value={val.toString()}>
                        {val} Tháng/lần
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.paymentCycle?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Penalty Amountn (*)</FieldLabel>
            <Input
              type="number"
              {...register("penaltyAmount", { valueAsNumber: true })}
              disabled={isDisabled}
            />
          </Field>
        </div>

        {/* ------------------- DỊCH VỤ (MULTI-SELECT CHECKBOX) ------------------- */}
        <Field className="pt-4 border-t">
          <FieldLabel>
            Dịch vụ áp dụng ({houseServices.length} có sẵn):
          </FieldLabel>
          <Controller
            name="houseServiceIds"
            control={control}
            render={({ field }) => (
              <ScrollArea className="h-40 border rounded-md p-3">
                {loadingServices ? (
                  <Spinner />
                ) : (
                  houseServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <Checkbox
                        checked={field.value.includes(service.serviceId)}
                        onCheckedChange={(checked) => {
                          const newIds = checked
                            ? [...field.value, service.serviceId]
                            : field.value.filter(
                                (id) => id !== service.serviceId
                              );
                          field.onChange(newIds);
                        }}
                      />
                      <label className="text-sm font-medium">
                        {service.serviceName}
                      </label>
                    </div>
                  ))
                )}
              </ScrollArea>
            )}
          />
          <FieldError>{errors.houseServiceIds?.message}</FieldError>
        </Field>

        {/* ------------------- KHÁCH THUÊ (DYNAMIC ARRAY) ------------------- */}
        <Field className="pt-4 border-t">
          <FieldLabel className="flex justify-between items-center">
            Danh sách Khách thuê (*):
            <Button
              type="button"
              size="sm"
              onClick={() => append({ fullName: "", phoneNumber: "" })}
              disabled={isDisabled}
            >
              <UserPlus className="h-4 w-4 mr-2" /> Thêm khách
            </Button>
          </FieldLabel>

          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="grid grid-cols-6 gap-2 items-start bg-secondary/50 p-3 rounded-md"
            >
              <span className="col-span-1 text-sm font-medium">
                #{index + 1}
              </span>

              {/* Full Name */}
              <Field className="col-span-3">
                <Input
                  placeholder="Họ Tên"
                  {...register(`tenants.${index}.fullName`)}
                  disabled={isDisabled}
                />
                <FieldError>
                  {errors.tenants?.[index]?.fullName?.message}
                </FieldError>
              </Field>

              {/* Phone Number */}
              <Field className="col-span-2">
                <Input
                  placeholder="Số điện thoại"
                  {...register(`tenants.${index}.phoneNumber`)}
                  disabled={isDisabled}
                />
                <FieldError>
                  {errors.tenants?.[index]?.phoneNumber?.message}
                </FieldError>
              </Field>

              {/* Remove Button */}
              {fields.length > 1 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(index)}
                  disabled={isDisabled}
                  className="col-span-1"
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
          <FieldError>{errors.tenants?.message}</FieldError>
        </Field>
      </FieldGroup>

      {/* ------------------- SUBMIT ------------------- */}
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
          Tạo Bản Nháp Hợp Đồng
        </Button>
      </div>
    </form>
  );
}
