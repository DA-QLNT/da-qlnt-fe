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
import { useTranslation } from "react-i18next";

export default function ContractAddForm({ onFormSubmitSuccess }) {
  const { t } = useTranslation("contractinvoice");
  const { userId: ownerId } = useAuth();
  const [createContract, { isLoading: isMutating }] =
    useCreateContractMutation();

  // States UI và Search
  const [isTenantCreateDialogOpen, setIsTenantCreateDialogOpen] =
    useState(false);
  const [phoneSearchTerm, setSearchPhoneNumber] = useState("");
  const debouncedSearch = useDebounce(phoneSearchTerm, 500);

  // RHF SETUP
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
  const selectedHouseServiceIds = watch("houseServiceIds") || [];

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

  // 🚨 LOGIC CHỌN TẤT CẢ / BỎ CHỌN TẤT CẢ
  const isAllServicesSelected = useMemo(() => {
    return (
      allHouseServiceMeta.length > 0 &&
      selectedHouseServiceIds.length === allHouseServiceMeta.length
    );
  }, [allHouseServiceMeta, selectedHouseServiceIds]);

  const handleToggleAllServices = (checked) => {
    if (checked) {
      const allSelected = allHouseServiceMeta.map((s) => ({
        houseServiceId: s.houseServiceId,
        serviceId: s.serviceId,
      }));
      setValue("houseServiceIds", allSelected);
    } else {
      setValue("houseServiceIds", []);
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      const rent = selectedRoom.rent || 0;
      setValue("rent", rent);
      setValue("deposit", rent);
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
      return toast.error(t("TenantAlreadyAdded"));
    }

    append({
      id: tenant.id,
      fullName: tenant.fullName,
      phoneNumber: tenant.phoneNumber,
      email: tenant.email,
    });
    setSearchPhoneNumber("");
    toast.success(
      `${t("AddedTenantToContract")} ${tenant.fullName} ${t("intoContract")}.`
    );
    refetchSearch();
  };

  // --- SUBMIT ---
  const onSubmit = async (data) => {
    if (data.tenants.length === 0) {
      toast.error(t("PleaseAddAtLeastOneTenant"));
      return;
    }
    const finalTenants = data.tenants.filter(
      (t) => t.fullName && t.phoneNumber
    );

    if (finalTenants.length === 0) {
      toast.error(t("ContractNeedsAtLeastOneValidTenant"));
      return;
    }

    const finalHouseServiceIds = data.houseServiceIds
      .map((selectedService) => {
        const serviceMeta = allHouseServiceMeta.find(
          (meta) => meta.houseServiceId === selectedService.houseServiceId
        );

        return {
          serviceId: serviceMeta?.serviceId,
          houseServiceId: selectedService.houseServiceId,
        };
      })
      .filter((s) => s.houseServiceId);

    const { houseId, ...formDataWithoutHouseId } = data;
    const payload = {
      ...formDataWithoutHouseId,
      houseServiceIds: finalHouseServiceIds,
      tenants: finalTenants,
      startDate: format(new Date(data.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(data.endDate), "yyyy-MM-dd"),
    };

    try {
      await createContract(payload).unwrap();
      toast.success(t("ContractCreatedSuccess"));
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || t("ContractCreateFailed"));
    }
  };

  const isDisabled =
    isMutating || loadingServices || loadingHouses || loadingRooms;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("ownerId", { valueAsNumber: true })} />

      <FieldGroup>
        {/* ------------------- CHỌN NHÀ & PHÒNG ------------------- */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Field>
            <FieldLabel>{t("House")} (*)</FieldLabel>
            <Controller
              name="houseId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingHouses ? t("Loading") : t("SelectHouse")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-60">
                      {allHouses.map((house) => (
                        <SelectItem key={house.id} value={house.id.toString()}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.houseId?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("Room")} (*)</FieldLabel>
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={isDisabled || !selectedHouseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("SelectRoom")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roomsByHouse
                      .filter((r) => r.status === 0)
                      .map((room) => (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          {room.code}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.roomId?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("Rent")} (*)</FieldLabel>
            <Input
              type="number"
              {...register("rent", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.rent?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("Deposit")} (*)</FieldLabel>
            <Input
              type="number"
              {...register("deposit", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.deposit?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel>{t("StartDate")} (*)</FieldLabel>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isDisabled}
                      className="w-full justify-start font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "dd/MM/yyyy")
                        : t("SelectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
            <FieldLabel>{t("EndDate")} (*)</FieldLabel>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isDisabled}
                      className="w-full justify-start font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(new Date(field.value), "dd/MM/yyyy")
                        : t("SelectDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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

          <Field>
            <FieldLabel>{t("PaymentCycle")}(*)</FieldLabel>
            <Controller
              name="paymentCycle"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_CYCLE_OPTIONS.map((val) => (
                      <SelectItem key={val} value={val.toString()}>
                        {val} {t("Month/Time")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field>
            <FieldLabel>{t("PenaltyAmount")} (*)</FieldLabel>
            <Input
              type="number"
              {...register("penaltyAmount", { valueAsNumber: true })}
              disabled={isDisabled}
            />
            <FieldError>{errors.penaltyAmount?.message}</FieldError>
          </Field>
        </div>

        {/* ------------------- DỊCH VỤ ------------------- */}
        <Field className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <FieldLabel className="mb-0">
              {t("AppliedServices")} ({allHouseServiceMeta.length}):
            </FieldLabel>

            {allHouseServiceMeta.length > 0 && (
              <div className="flex items-center space-x-2 bg-background px-2 py-1 rounded-md">
                <Checkbox
                  id="select-all-services"
                  checked={isAllServicesSelected}
                  onCheckedChange={handleToggleAllServices}
                  disabled={isDisabled}
                />
                <label
                  htmlFor="select-all-services"
                  className="text-xs font-bold cursor-pointer select-none"
                >
                  {t("SelectAll") || "Chọn tất cả"}
                </label>
              </div>
            )}
          </div>

          <Controller
            name="houseServiceIds"
            control={control}
            render={({ field }) => (
              <ScrollArea className="h-60 border rounded-md p-3">
                {loadingServices ? (
                  <div className="flex justify-center py-10">
                    <Spinner />
                  </div>
                ) : (
                  allHouseServiceMeta.map((service) => {
                    const isSelected = field.value.some(
                      (s) => s.houseServiceId === service.houseServiceId
                    );

                    return (
                      <div
                        key={service.houseServiceId}
                        className="grid grid-cols-12 items-center space-x-2 py-1 hover:bg-sidebar rounded px-2"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const newArray = checked
                              ? [
                                  ...field.value,
                                  {
                                    houseServiceId: service.houseServiceId,
                                    serviceId: service.serviceId,
                                  },
                                ]
                              : field.value.filter(
                                  (s) =>
                                    s.houseServiceId !== service.houseServiceId
                                );
                            field.onChange(newArray);
                          }}
                          className="col-span-1"
                        />
                        <label className="col-span-8 text-sm font-medium">
                          {service.name} ({formatCurrency(service.price)}/
                          {service.unit})
                        </label>
                        <div className="col-span-3 flex justify-end">
                          <ServiceTypeBadge type={service.method} />
                        </div>
                      </div>
                    );
                  })
                )}
              </ScrollArea>
            )}
          />
          <FieldError>{errors.houseServiceIds?.message}</FieldError>
        </Field>

        {/* ------------------- KHÁCH THUÊ ------------------- */}
        <Field className="pt-4 border-t space-y-3">
          <FieldLabel className="font-bold">
            {t("TenantListInContract")} (*):
          </FieldLabel>
          <div className="flex gap-2 items-start">
            <div className="grow space-y-2">
              <div className="flex gap-2 justify-end">
                <Input
                  placeholder={t("SearchByPhoneNumber")}
                  value={phoneSearchTerm}
                  onChange={(e) => setSearchPhoneNumber(e.target.value)}
                  disabled={isDisabled}
                  className="w-full max-w-sm"
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={refetchSearch}
                  disabled={phoneSearchTerm.length < 5}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {isSearching && (
                <div className="text-xs italic">{t("Searching")}...</div>
              )}

              {showSearchResults && foundTenant && (
                <Card className="flex items-center justify-between w-full p-3 border-green-500 bg-sidebar">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage
                        src={foundTenant.avatarUrl || "/userDefault.png"}
                      />
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold">
                        {foundTenant.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {foundTenant.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleAddTenantToContract(foundTenant)}
                    disabled={isAlreadyAdded(foundTenant.id)}
                  >
                    {isAlreadyAdded(foundTenant.id) ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {isAlreadyAdded(foundTenant.id)
                      ? t("Added")
                      : t("AddToContract")}
                  </Button>
                </Card>
              )}
            </div>
            <TenantCreateDialog onTenantCreated={handleAddTenantToContract} />
          </div>

          <div className="space-y-2 pt-2">
            {fields.map((fieldItem, index) => (
              <div
                key={fieldItem.id}
                className="grid grid-cols-10 gap-2 items-center bg-sidebar p-2 rounded-md border shadow-sm"
              >
                <span className="text-xs font-bold col-span-1 text-center">
                  #{index + 1}
                </span>
                <div className="col-span-4 text-sm font-medium">
                  {fieldItem.fullName}
                </div>
                <div className="col-span-4 text-sm text-muted-foreground">
                  {fieldItem.phoneNumber}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(index)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <FieldError>{errors.tenants?.message}</FieldError>
        </Field>
      </FieldGroup>

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
          {t("CreateDraftContractButton")}
        </Button>
      </div>
    </form>
  );
}
