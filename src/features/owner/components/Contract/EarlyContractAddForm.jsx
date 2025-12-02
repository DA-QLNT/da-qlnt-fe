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
  Trash,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ContractAddSchema,
  EarlyContractAddSchema,
} from "@/lib/validation/contract";

import { useAuth } from "@/features/auth";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetHouseServicesByHouseIdQuery } from "../../store/serviceApi";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetRoomsByHouseIdQuery } from "../../store/roomApi";
import { PAYMENT_CYCLE_OPTIONS } from "@/assets/contract/paymentOptions"; // Giả định
import { useCreateContractMutation } from "../../store/contractApi";
import { useEffect, useState, useCallback, useMemo } from "react";
import useDebounce from "@/hooks/useDebounce"; // Giả định
import TenantCreateDialog from "../Tenant/TenantCreateDialog"; // Giả định
import { useSearchTenantByPhoneNumberQuery } from "../../store/tenantApi"; // Giả định
import ServiceTypeBadge from "../Service/ServiceTypeBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { Card } from "@/components/ui/card";

export default function ContractAddForm({ onFormSubmitSuccess }) {
  const { userId: ownerId } = useAuth();
  const [createContract, { isLoading: isMutating }] =
    useCreateContractMutation();

  // States UI và Search
  const [isTenantCreateDialogOpen, setIsTenantCreateDialogOpen] =
    useState(false);
  const [phoneSearchTerm, setSearchPhoneNumber] = useState("");
  const debouncedSearch = useDebounce(phoneSearchTerm, 500);

  // 🚨 RHF SETUP
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(EarlyContractAddSchema),
    defaultValues: {
      roomId: undefined,
      ownerId: ownerId,
      rent: 0,
      deposit: 0,
      penaltyAmount: 50000,
      paymentCycle: 1,
      startDate: undefined,
      endDate: undefined,
      houseServiceIds: [],
      tenants: [],
    },
  });

  const selectedHouseId = watch("houseId");
  const selectedRoomId = watch("roomId");

  // Data Hooks
  const { data: housesData, isLoading: loadingHouses } =
    useGetHousesByOwnerIdQuery(
      { ownerId: ownerId, page: 0, size: 100 },
      { skip: !ownerId }
    );
  const allHouses = housesData?.houses || [];

  const { data: roomsData, isLoading: loadingRooms } =
    useGetRoomsByHouseIdQuery(
      { houseId: selectedHouseId, page: 0, size: 100 },
      { skip: !selectedHouseId }
    );
  const roomsByHouse = roomsData?.content || [];

  const { data: serviceData, isLoading: loadingServices } =
    useGetHouseServicesByHouseIdQuery(selectedHouseId, {
      skip: !selectedHouseId,
    });
  const houseServices = serviceData || [];

  // Search Tenant Query
  const {
    data: searchedTenantData,
    isFetching: isSearching,
    refetch: refetchSearch,
  } = useSearchTenantByPhoneNumberQuery(debouncedSearch, {
    skip: !debouncedSearch || debouncedSearch.length < 5,
  });
  const foundTenant = searchedTenantData;
  const showSearchResults = !isSearching && debouncedSearch.length >= 5;
  // Lấy thông tin phòng được chọn để preload giá
  const selectedRoom = useMemo(
    () => roomsByHouse.find((r) => r.id === selectedRoomId),
    [roomsByHouse, selectedRoomId]
  );

  // RHF Field Array
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tenants",
  });
  useEffect(() => {
    // Nếu không có tenant nào, thêm 1 field trống để user nhập
    if (fields.length === 0) {
      append({ fullName: "", phoneNumber: "", email: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  // Cập nhật giá thuê mặc định khi roomData fetch xong (hoặc khi chọn Room)
  useEffect(() => {
    if (selectedRoom) {
      const rent = selectedRoom.rent || 0;
      setValue("rent", rent);
      setValue("deposit", rent * 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom, setValue]);

  // Reset RoomId và Services khi HouseId thay đổi
  useEffect(() => {
    setValue("roomId", undefined);
    setValue("houseServiceIds", []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHouseId, setValue]);

  // --- LOGIC TENANT ---
  const isAlreadyAdded = useCallback(
    (tenantId) => fields.some((f) => f.id === tenantId),
    [fields]
  );

  const handleAddTenantToContract = (tenant) => {
    if (isAlreadyAdded(tenant.id)) {
      return toast.error(
        `Khách thuê ${tenant.fullName} đã có trong danh sách.`
      );
    }
    if (fields.length === 1 && !fields[0].fullName) {
      remove(0);
    }

    append({
      id: tenant.id,
      fullName: tenant.fullName,
      phoneNumber: tenant.phoneNumber,
      email: tenant.email,
    });
    setSearchPhoneNumber("");
    refetchSearch();
  };

  // LOGIC DỊCH VỤ (Metadata)
  const allHouseServiceMeta = useMemo(() => {
    return houseServices.map((hs) => ({
      serviceId: hs.serviceId, // Service ID
      houseServiceId: hs.id, // HouseService ID
      name: hs.serviceName,
      method: Number(hs.method), // 0: Meter, 1: Per head, 2: Fixed
      price: hs.price,
      unit: hs.unit,
    }));
  }, [houseServices]);

  // --- SUBMIT ---
  const onSubmit = async (data) => {
    console.log(data, "abcd");

    if (data.tenants.length === 0) {
      toast.error("Vui lòng thêm ít nhất một khách thuê.");
      return;
    }
    const finalTenants = data.tenants.filter(
      (t) => t.fullName && t.phoneNumber
    );

    if (finalTenants.length === 0) {
      toast.error("Hợp đồng cần ít nhất một khách thuê hợp lệ.");
      return;
    }

    // 1. TRANSFORMATION DỊCH VỤ
    const finalHouseServiceIds = data.houseServiceIds
      .map((selectedService) => {
        const serviceMeta = allHouseServiceMeta.find(
          (meta) => meta.houseServiceId === selectedService.houseServiceId
        );

        return {
          serviceId: serviceMeta.serviceId,
          houseServiceId: selectedService.houseServiceId,
        };
      })
      .filter((s) => s.houseServiceId);

    const { houseId, ...formDataWithoutHouseId } = data;
    // 2. PAYLOAD CUỐI CÙNG
    const payload = {
      ...formDataWithoutHouseId,
      houseServiceIds: finalHouseServiceIds,
      tenants: finalTenants,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
    };
    console.log(payload);

    try {
      await createContract(payload).unwrap();
      toast.success("Hợp đồng được tạo thành bản nháp (DRAFT)!");
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Tạo hợp đồng thất bại.");
      console.error("Contract create error:", error);
    }
  };

  const isDisabled =
    isMutating || loadingServices || loadingHouses || loadingRooms;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("roomId", { valueAsNumber: true })} />
      <input type="hidden" {...register("ownerId", { valueAsNumber: true })} />

      <FieldGroup>
        {/* ------------------- CHỌN NHÀ & PHÒNG ------------------- */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* HOUSE SELECT */}
          <Field>
            <FieldLabel>Nhà (*)</FieldLabel>
            <Controller
              name="houseId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={isDisabled || loadingHouses}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingHouses ? "Loading..." : "Select House"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-60">
                      {allHouses.map((house) => (
                        <SelectItem key={house.id} value={house.id.toString()}>
                          {house.name || house.code}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.houseId?.message}</FieldError>
          </Field>

          {/* ROOM SELECT */}
          <Field>
            <FieldLabel>Phòng (*)</FieldLabel>
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={
                    isDisabled ||
                    !selectedHouseId ||
                    loadingRooms ||
                    roomsByHouse.length === 0
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedHouseId
                          ? loadingRooms
                            ? "Loading Rooms..."
                            : "Select Room"
                          : "Select House first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {roomsByHouse
                      .filter((r) => r.status === 0)
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.code} ({room.area}m²)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.roomId?.message}</FieldError>
          </Field>

          {/* Rent & Deposit */}
          <Field>
            <FieldLabel>Giá thuê (*)</FieldLabel>
            <Input
              type="number"
              {...register("rent", { valueAsNumber: true })}
              disabled={isDisabled || !selectedRoomId}
            />
            <FieldError>{errors.rent?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Tiền cọc (*)</FieldLabel>
            <Input
              type="number"
              {...register("deposit", { valueAsNumber: true })}
              disabled={isDisabled || !selectedRoomId}
            />
            <FieldError>{errors.deposit?.message}</FieldError>
          </Field>

          {/* Start/End Date */}
          <Field>
            <FieldLabel>Ngày bắt đầu (*)</FieldLabel>
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
            <FieldLabel>Ngày kết thúc (*)</FieldLabel>
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
            <FieldLabel>Chu kỳ thanh toán(*)</FieldLabel>
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
            <FieldLabel>Tiền phạt (*)</FieldLabel>
            <Input
              type="number"
              {...register("penaltyAmount", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.penaltyAmount?.message}</FieldError>
          </Field>
        </div>

        {/* ------------------- DỊCH VỤ (MULTI-SELECT CHECKBOX) ------------------- */}
        <Field className="pt-4 border-t">
          <FieldLabel>
            Dịch vụ áp dụng ({allHouseServiceMeta.length} có sẵn):
          </FieldLabel>
          <Controller
            name="houseServiceIds"
            control={control}
            render={({ field }) => (
              <ScrollArea className="h-60 border rounded-md p-3">
                {loadingServices ? (
                  <Spinner />
                ) : (
                  allHouseServiceMeta.map((service) => {
                    const fieldIndex = field.value.findIndex(
                      (s) => s.houseServiceId === service.houseServiceId
                    );
                    const isSelected = fieldIndex !== -1;

                    return (
                      <div
                        key={service.houseServiceId}
                        className="grid grid-cols-12 items-center space-x-2 py-1"
                      >
                        {/* Checkbox */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            let newArray;
                            if (checked) {
                              newArray = [
                                ...field.value,
                                {
                                  houseServiceId: service.houseServiceId,
                                  serviceId: service.serviceId,
                                },
                              ];
                            } else {
                              newArray = field.value.filter(
                                (s) =>
                                  s.houseServiceId !== service.houseServiceId
                              );
                            }
                            field.onChange(newArray);
                          }}
                          className="col-span-1"
                        />
                        <label className="col-span-4 text-sm font-medium">
                          {service.name} ({formatCurrency(service.price)}/
                          {service.unit})
                        </label>
                        <ServiceTypeBadge type={service.method} />
                      </div>
                    );
                  })
                )}
              </ScrollArea>
            )}
          />
          <FieldError>{errors.houseServiceIds?.message}</FieldError>
        </Field>

        {/* ------------------- KHÁCH THUÊ (DYNAMIC ARRAY) ------------------- */}
        <Field className="pt-4 border-t">
          <FieldLabel className="flex justify-between items-center">
            Khách thuê (*):
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 left-2 size-5" />
                <Input
                  placeholder="Search with phone number"
                  className={"pl-8 lg:pl-10"}
                  value={phoneSearchTerm}
                  onChange={(e) => setSearchPhoneNumber(e.target.value)}
                />
                {(isSearching || loadingServices) && (
                  <Spinner
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    size={20}
                  />
                )}
              </div>
              <TenantCreateDialog onTenantCreated={handleAddTenantToContract} />
            </div>
          </FieldLabel>

          {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM */}
          {showSearchResults &&
            (foundTenant ? (
              <Card
                className="flex items-center justify-between p-3 border-green-500 bg-green-50 dark:bg-green-900/10 cursor-pointer hover:bg-green-500/20"
                onClick={() => handleAddTenantToContract(foundTenant)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={foundTenant.avatarUrl || "/userDefault.png"}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{foundTenant.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {foundTenant.phoneNumber} | {foundTenant.email}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={isAlreadyAdded(foundTenant.id)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isAlreadyAdded(foundTenant.id)
                    ? "Đã thêm"
                    : "Thêm vào Hợp đồng"}
                </Button>
              </Card>
            ) : (
              <Card className="p-3 border-red-500 bg-red-50 dark:bg-red-900/10">
                <p className="font-medium text-sm">
                  Không tìm thấy Tenant với SĐT *{debouncedSearch}*.
                </p>
              </Card>
            ))}

          {/* DANH SÁCH TENANTS ĐÃ CHỌN/NHẬP THỦ CÔNG */}
          {fields.map((fieldItem, index) => (
            <div
              key={fieldItem.id}
              className="grid grid-cols-6 gap-2 items-start bg-secondary/50 p-3 rounded-md"
            >
              <div className="col-span-6 flex justify-between items-center">
                <span className="text-sm font-medium">#{index + 1}</span>
                {/* Remove Button */}
                {fields.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                      disabled={isDisabled}
                    >
                      <Trash className="h-8 w-8 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <Field className="col-span-6">
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
              <Field className="col-span-3">
                <Input
                  placeholder="Số điện thoại"
                  {...register(`tenants.${index}.phoneNumber`)}
                  disabled={isDisabled}
                />
                <FieldError>
                  {errors.tenants?.[index]?.phoneNumber?.message}
                </FieldError>
              </Field>
              {/* Email */}
              <Field className="col-span-3">
                <Input
                  placeholder="Email"
                  {...register(`tenants.${index}.email`)}
                  disabled={isDisabled}
                />
                <FieldError>
                  {errors.tenants?.[index]?.email?.message}
                </FieldError>
              </Field>
            </div>
          ))}
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
