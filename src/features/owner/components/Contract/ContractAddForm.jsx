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
  Search,
  CheckCircle,
  User,
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
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import component TenantCreateDialog mới
import TenantCreateDialog from "../Tenant/TenantCreateDialog";
import { useSearchTenantByPhoneNumberQuery } from "../../store/tenantApi";

export default function ContractAddForm({
  houseId,
  roomId,
  onFormSubmitSuccess,
}) {
  const { userId: ownerId } = useAuth();

  const [createContract, { isLoading: isMutating }] =
    useCreateContractMutation();

  const { data: serviceData, isLoading: loadingServices } =
    useGetHouseServicesByHouseIdQuery(houseId, { skip: !houseId });
  const houseServices = serviceData || [];

  const {
    data: roomData,
    isLoading: loadingRoom,
    isFetching,
    isError,
  } = useGetRoomByIdQuery(roomId, {
    skip: !roomId,
  }); //  RHF SETUP

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch, // ✅ Thêm watch để theo dõi giá trị của houseServiceIds
    setValue, // ✅ Thêm setValue để cập nhật lastMeterReading
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
      tenants: [], // Khởi tạo mảng tenants rỗng
    },
  });
  // ✅ Sử dụng useFieldArray cho houseServiceIds
  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    update: updateService, // Thêm update để thay đổi giá trị lastMeterReading
  } = useFieldArray({
    control,
    name: "houseServiceIds",
    keyName: "uniqueId", // keyName để react-hook-form quản lý field tốt hơn
  });
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]); // ✅ Reset form khi roomData được fetch xong
  useEffect(() => {
    if (roomData) {
      reset({
        roomId: Number(roomId),
        ownerId: ownerId,
        rent: roomData.rent || 0,
        deposit: roomData.rent || 0,
        penaltyAmount: 50000,
        paymentCycle: 1,
        startDate: undefined,
        endDate: undefined,
        houseServiceIds: [],
        tenants: [],
      });
    }
  }, [roomData, reset, roomId, ownerId]);

  // QUẢN LÝ MẢNG TENANTS
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tenants",
  }); // THÊM: State và Logic tìm kiếm Tenant

  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const debouncedSearch = useDebounce(searchPhoneNumber, 500); // Query API tìm kiếm Tenant
  const {
    data: searchedTenantData,
    isLoading: loadingSearch,
    refetch: refetchSearch, // Giữ refetch để người dùng có thể kích hoạt tìm kiếm thủ công
  } = useSearchTenantByPhoneNumberQuery(debouncedSearch, {
    // Skip khi SĐT chưa đủ 10 ký tự
    skip: debouncedSearch.length < 10,
  });
  const searchedTenant = searchedTenantData; // Logic kiểm tra để hiển thị kết quả chính xác (tránh lỗi cache) // => Chỉ hiển thị kết quả nếu tìm kiếm đã xong VÀ SĐT hiện tại trong input khớp với SĐT đã dùng để query
  const showSearchResults =
    !loadingSearch &&
    debouncedSearch.length >= 10 &&
    // Điều kiện quan trọng: đảm bảo kết quả cache khớp với input hiện tại
    searchPhoneNumber === debouncedSearch; // KIỂM TRA ĐÃ CÓ TRONG DANH SÁCH CHƯA
  const isAlreadyAdded = (tenantId) => fields.some((f) => f.id === tenantId); // Logic thêm Tenant vào form hợp đồng

  const handleAddTenantToContract = (tenant) => {
    if (isAlreadyAdded(tenant.id)) {
      toast.error("Tenant này đã được thêm vào hợp đồng.");
      return;
    } // Thêm Tenant đã tìm thấy hoặc mới tạo

    append({
      id: tenant.id, // ID của Tenant
      fullName: tenant.fullName,
      phoneNumber: tenant.phoneNumber,
      email: tenant.email,
    });
    setSearchPhoneNumber(""); // Reset ô tìm kiếm
    toast.success(`Đã thêm ${tenant.fullName} vào hợp đồng.`);
    // Refetch lại để xóa kết quả tìm kiếm cũ
    refetchSearch();
  };

  // ✅ Xử lý khi checkbox dịch vụ thay đổi
  const handleServiceCheckboxChange = (checked, service) => {
    const currentServices = watch("houseServiceIds"); // Lấy giá trị hiện tại của houseServiceIds

    if (checked) {
      // Nếu được chọn, thêm dịch vụ vào mảng
      const newServiceEntry = {
        serviceId: service.serviceId,
        houseServiceId: service.id,
      };
      // Nếu là dịch vụ công tơ (method: "0"), thêm lastMeterReading mặc định
      if (service.method === "0") {
        newServiceEntry.lastMeterReading = 0;
      }
      appendService(newServiceEntry);
    } else {
      // Nếu bỏ chọn, xóa dịch vụ khỏi mảng
      const indexToRemove = currentServices.findIndex(
        (item) => item.houseServiceId === service.id
      );
      if (indexToRemove !== -1) {
        removeService(indexToRemove);
      }
    }
  };

  const onSubmit = async (data) => {
    // 1. Format Dates
    const payload = {
      ...data,
      ownerId: ownerId,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
    };
    // Loại bỏ lastMeterReading nếu method không phải là "0" trước khi gửi
    payload.houseServiceIds = payload.houseServiceIds.map((service) => {
      const originalService = houseServices.find(
        (hs) => hs.id === service.houseServiceId
      );
      if (originalService && originalService.method !== "0") {
        const { lastMeterReading, ...rest } = service; // Destructure để loại bỏ
        return rest;
      }
      return service;
    });

    try {
      console.log("Payload gửi đi:", payload);
      await createContract(payload).unwrap();
      toast.success("Hợp đồng được tạo thành bản nháp (DRAFT)!");
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Tạo hợp đồng thất bại.");
      console.error("Contract create error:", error);
    }
  };

  const isDisabled = isMutating || loadingServices;

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
          <ScrollArea className="h-60 border rounded-md p-3">
            {loadingServices ? (
              <Spinner />
            ) : (
              houseServices.map((service) => {
                const isChecked = serviceFields.some(
                  (sf) => sf.houseServiceId === service.id
                );
                // Tìm index của dịch vụ trong houseServiceIds array của form
                const fieldIndex = serviceFields.findIndex(
                  (sf) => sf.houseServiceId === service.id
                );

                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between space-x-2 py-1"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleServiceCheckboxChange(checked, service)
                        }
                      />
                      <label className="text-sm font-medium">
                        {service.serviceName} (Giá:{" "}
                        {service.price.toLocaleString()} VNĐ)
                      </label>
                    </div>

                    {/* ✅ HIỂN THỊ INPUT CHO lastMeterReading NẾU method === "0" VÀ ĐƯỢC CHỌN */}
                    {isChecked &&
                      service.method === "0" &&
                      fieldIndex !== -1 && (
                        <Field className="w-32">
                          <FieldLabel className="sr-only">
                            Chỉ số đầu
                          </FieldLabel>
                          <Input
                            type="number"
                            placeholder="Chỉ số đầu"
                            {...register(
                              `houseServiceIds.${fieldIndex}.lastMeterReading`,
                              { valueAsNumber: true }
                            )}
                            disabled={isDisabled}
                            min={0}
                          />
                          <FieldError>
                            {
                              errors.houseServiceIds?.[fieldIndex]
                                ?.lastMeterReading?.message
                            }
                          </FieldError>
                        </Field>
                      )}
                  </div>
                );
              })
            )}
          </ScrollArea>
          <FieldError>{errors.houseServiceIds?.message}</FieldError>
        </Field>

        {/* ------------------- KHÁCH THUÊ (DYNAMIC ARRAY) ------------------- */}

        <Field className="pt-4 border-t space-y-3">
          <FieldLabel className="font-bold">
            Danh sách Khách thuê (*):
          </FieldLabel>
          {/* ============= PHẦN TÌM KIẾM/NÚT TẠO MỚI ============= */}

          <div className="flex gap-2 items-start">
            <div className="flex-grow space-y-2">
              <div className="flex gap-2 justify-end">
                <Input
                  placeholder="Nhập SĐT để tìm kiếm"
                  value={searchPhoneNumber}
                  onChange={(e) => setSearchPhoneNumber(e.target.value)}
                  disabled={isDisabled}
                  className={"w-50 lg:80"}
                />

                <Button
                  type="button"
                  size="icon"
                  onClick={refetchSearch}
                  disabled={isDisabled || searchPhoneNumber.length < 10}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM */}

              {loadingSearch && debouncedSearch.length >= 10 && (
                <div className="flex items-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang tìm
                  kiếm Tenant...
                </div>
              )}

              {showSearchResults &&
                (searchedTenant ? (
                  // Tenant ĐƯỢC TÌM THẤY
                  <Card className="flex items-center justify-between w-80 lg:w-90 p-3 border-green-500 bg-green-50 dark:bg-green-900/10">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage
                          src={searchedTenant.avatarUrl || "/userDefault.png"}
                        />

                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-semibold">
                          {searchedTenant.fullName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {searchedTenant.phoneNumber}| {searchedTenant.email}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddTenantToContract(searchedTenant)}
                      disabled={isDisabled || isAlreadyAdded(searchedTenant.id)}
                    >
                      {isAlreadyAdded(searchedTenant.id) ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}

                      {isAlreadyAdded(searchedTenant.id)
                        ? "Đã thêm"
                        : "Thêm vào Hợp đồng"}
                    </Button>
                  </Card>
                ) : (
                  // Tenant KHÔNG TÌM THẤY
                  <Card className="p-3 border-red-500 bg-red-50 dark:bg-red-900/10">
                    <p className="font-medium text-sm">
                      Không tìm thấy Tenant với SĐT *{debouncedSearch}*. Vui
                      lòng Tạo Tenant mới.
                    </p>
                  </Card>
                ))}
              {/* THÔNG BÁO KHI SĐT CHƯA ĐỦ DÀI */}

              {searchPhoneNumber.length > 0 &&
                searchPhoneNumber.length < 10 && (
                  <p className="text-sm text-yellow-600">
                    Nhập đủ 10 số để tìm kiếm.
                  </p>
                )}
            </div>
            {/* NÚT TẠO TENANT MỚI (Mở Dialog) */}
            <TenantCreateDialog onTenantCreated={handleAddTenantToContract} />
          </div>

          {/* ============= DANH SÁCH TENANT ĐÃ THÊM ============= */}
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-sm">
              Khách thuê trong Hợp đồng ({fields.length}):
            </h4>

            {fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="grid grid-cols-10 gap-2 items-center bg-white dark:bg-gray-800 p-3 rounded-md border"
              >
                <span className="text-sm font-medium col-span-1">
                  #{index + 1}
                </span>
                {/* Full Name (Readonly) */}
                <Field className="col-span-3">
                  <Input
                    value={fieldItem.fullName}
                    readOnly
                    placeholder="Họ Tên"
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                  {/* Hidden fields để gửi payload */}

                  <input type="hidden" {...register(`tenants.${index}.id`)} />

                  <input
                    type="hidden"
                    {...register(`tenants.${index}.fullName`)}
                  />
                </Field>
                {/* Phone Number (Readonly) */}
                <Field className="col-span-3">
                  <Input
                    value={fieldItem.phoneNumber}
                    readOnly
                    placeholder="Số điện thoại"
                    className="bg-gray-100 dark:bg-gray-700"
                  />

                  <input
                    type="hidden"
                    {...register(`tenants.${index}.phoneNumber`)}
                  />
                </Field>
                {/* Email (Readonly) */}
                <Field className="col-span-2">
                  <Input
                    value={fieldItem.email}
                    readOnly
                    placeholder="Email"
                    className="bg-gray-100 dark:bg-gray-700"
                  />

                  <input
                    type="hidden"
                    {...register(`tenants.${index}.email`)}
                  />
                </Field>
                {/* Remove Button */}
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(index)}
                    disabled={isDisabled}
                  >
                    <X className="h-8 w-8 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              Vui lòng tìm kiếm hoặc tạo ít nhất một khách thuê.
            </p>
          )}
          <FieldError>{errors.tenants?.message}</FieldError>
        </Field>
      </FieldGroup>
      {/* ------------------- SUBMIT ------------------- */}
      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isDisabled || fields.length === 0}
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
