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
  Search,
  CheckCircle,
  User,
  Trash,
} from "lucide-react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EarlyContractAddSchema } from "@/lib/validation/contract";

import { useAuth } from "@/features/auth";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetHouseServicesByHouseIdQuery } from "../../store/serviceApi";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetRoomsByHouseIdQuery } from "../../store/roomApi";
import { PAYMENT_CYCLE_OPTIONS } from "@/assets/contract/paymentOptions";
import { useCreateContractMutation } from "../../store/contractApi";
import { useEffect, useState, useCallback, useMemo } from "react";
import useDebounce from "@/hooks/useDebounce";
import TenantCreateDialog from "../Tenant/TenantCreateDialog";
import { useSearchTenantByPhoneNumberQuery } from "../../store/tenantApi";
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
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (selectedRoom) {
      const rent = selectedRoom.rent || 0;
      setValue("rent", rent);
      setValue("deposit", rent * 2);
    }
  }, [selectedRoom, setValue]);

  useEffect(() => {
    setValue("roomId", undefined);
    setValue("houseServiceIds", []);
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

    append({
      id: tenant.id,
      fullName: tenant.fullName,
      phoneNumber: tenant.phoneNumber,
      email: tenant.email,
    });
    setSearchPhoneNumber("");
    toast.success(`Đã thêm ${tenant.fullName} vào hợp đồng.`);
    refetchSearch();
  };

  // LOGIC DỊCH VỤ (Metadata)
  const allHouseServiceMeta = useMemo(() => {
    return houseServices.map((hs) => ({
      serviceId: hs.serviceId,
      houseServiceId: hs.id,
      name: hs.serviceName,
      method: Number(hs.method),
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
                  value={phoneSearchTerm}
                  onChange={(e) => setSearchPhoneNumber(e.target.value)}
                  disabled={isDisabled}
                  className="w-50 lg:w-80"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={refetchSearch}
                  disabled={isDisabled || phoneSearchTerm.length < 5}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM */}
              {isSearching && debouncedSearch.length >= 5 && (
                <div className="flex items-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang tìm
                  kiếm Tenant...
                </div>
              )}

              {showSearchResults &&
                (foundTenant ? (
                  <Card className="flex items-center justify-between w-80 lg:w-90 p-3 border-green-500 bg-green-50 dark:bg-green-900/10">
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
                      onClick={() => handleAddTenantToContract(foundTenant)}
                      disabled={isDisabled || isAlreadyAdded(foundTenant.id)}
                    >
                      {isAlreadyAdded(foundTenant.id) ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {isAlreadyAdded(foundTenant.id)
                        ? "Đã thêm"
                        : "Thêm vào Hợp đồng"}
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-3 border-red-500 bg-red-50 dark:bg-red-900/10">
                    <p className="font-medium text-sm">
                      Không tìm thấy Tenant với SĐT *{debouncedSearch}*. Vui
                      lòng Tạo Tenant mới.
                    </p>
                  </Card>
                ))}

              {/* THÔNG BÁO KHI SĐT CHƯA ĐỦ DÀI */}
              {phoneSearchTerm.length > 0 && phoneSearchTerm.length < 5 && (
                <p className="text-sm text-yellow-600">
                  Nhập đủ 5 số để tìm kiếm.
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
                    <Trash className="h-8 w-8 text-red-500" />
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
