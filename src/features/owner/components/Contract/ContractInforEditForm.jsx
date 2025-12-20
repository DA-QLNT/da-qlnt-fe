import { cn } from "@/lib/utils";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import {
  Save,
  Calendar as CalendarIcon,
  Loader2,
  Search,
  UserPlus,
  CheckCircle,
  User,
  Trash,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";

import { useUpdateContractInforMutation } from "../../store/contractApi";
import { useGetHouseServicesByHouseIdQuery } from "../../store/serviceApi";
import { useSearchTenantByPhoneNumberQuery } from "../../store/tenantApi";
import { ContractFullUpdateSchema } from "@/lib/validation/contract";
import { PAYMENT_CYCLE_OPTIONS } from "@/assets/contract/paymentOptions";
import useDebounce from "@/hooks/useDebounce";
import TenantCreateDialog from "../Tenant/TenantCreateDialog";
import { formatCurrency } from "@/lib/format/currencyFormat";

export default function ContractInforEditForm({
  contractId,
  initialData,
  onFormSubmitSuccess,
}) {
  const { t } = useTranslation("contractinvoice");
  const [updateContract, { isLoading: isSubmitting }] =
    useUpdateContractInforMutation();

  // 1. Fetch dịch vụ của nhà
  const { data: houseServices = [], isLoading: loadingServices } =
    useGetHouseServicesByHouseIdQuery(initialData?.houseId, {
      skip: !initialData?.houseId,
    });

  // 2. RHF Setup
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(ContractFullUpdateSchema),
    defaultValues: {
      id: contractId,
      startDate: initialData?.startDate
        ? parseISO(initialData.startDate)
        : undefined,
      endDate: initialData?.endDate ? parseISO(initialData.endDate) : undefined,
      rent: initialData?.rent || 0,
      deposit: initialData?.deposit || 0,
      penaltyAmount: initialData?.penaltyAmount || 50000,
      paymentCycle: initialData?.paymentCycle || 1,
      houseServiceIds:
        initialData?.services?.map((s) => ({
          serviceId: s.serviceId,
          houseServiceId: s.houseServiceId,
        })) || [],
      tenants:
        initialData?.tenants?.map((t) => ({
          id: t.tenantId,
          fullName: t.fullName,
          phoneNumber: t.phoneNumber,
          representative: t.representative,
        })) || [],
    },
  });

  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
  } = useFieldArray({ control, name: "houseServiceIds" });
  const {
    fields: tenantFields,
    append: appendTenant,
    remove: removeTenant,
  } = useFieldArray({ control, name: "tenants" });

  // 3. Logic tìm kiếm Tenant (Giống Form Add)
  const [searchPhone, setSearchPhone] = useState("");
  const debouncedSearch = useDebounce(searchPhone, 500);
  const { data: searchedTenant, isLoading: loadingSearch } =
    useSearchTenantByPhoneNumberQuery(debouncedSearch, {
      skip: debouncedSearch.length < 10,
    });

  const handleAddTenant = (tenant) => {
    if (tenantFields.some((f) => f.id === tenant.id)) {
      return toast.error(t("TenantAlreadyAdded"));
    }
    appendTenant({
      id: tenant.id,
      fullName: tenant.fullName,
      phoneNumber: tenant.phoneNumber,
      representative: tenantFields.length === 0, // Mặc định người đầu tiên là đại diện nếu chưa có ai
    });
    setSearchPhone("");
  };

  const setRepresentative = (index) => {
    tenantFields.forEach((_, i) =>
      setValue(`tenants.${i}.representative`, i === index)
    );
  };

  // 4. Submit
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      startDate: format(data.startDate, "yyyy-MM-dd"),
      endDate: format(data.endDate, "yyyy-MM-dd"),
      paymentCycle: data.paymentCycle || 1,
      // Chỉ gửi id và representative cho tenants
      tenants: data.tenants.map((t) => ({
        id: t.id,
        representative: t.representative,
      })),
    };

    try {
      await updateContract({ contractId, ...payload }).unwrap();
      toast.success(t("ContractInfoUpdatedSuccess"));
      onFormSubmitSuccess();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.data?.message || t("ContractInfoUpdateFailed"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Field>
          <FieldLabel>{t("Rent")} (*)</FieldLabel>
          <Input type="number" {...register("rent", { valueAsNumber: true })} />
          <FieldError>{errors.rent?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>{t("Deposit")} (*)</FieldLabel>
          <Input
            type="number"
            {...register("deposit", { valueAsNumber: true })}
          />
          <FieldError>{errors.deposit?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>{t("StartDate")} (*)</FieldLabel>
          <Controller
            name="startDate"
            control={control}
            rules={{ required: t("StartDateRequired") }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(field.value, "dd/MM/yyyy")
                      : t("SelectDate")}
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
          <FieldLabel>{t("EndDate")} (*)</FieldLabel>
          <Controller
            name="endDate"
            control={control}
            rules={{ required: t("EndDateRequired") }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(field.value, "dd/MM/yyyy")
                      : t("SelectDate")}
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
        <Field>
          <FieldLabel>{t("PaymentCycle")} (*)</FieldLabel>
          <Controller
            name="paymentCycle"
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("SelectPaymentCycle")} />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_CYCLE_OPTIONS.map((val) => (
                    <SelectItem key={val} value={String(val)}>
                      {val} {t("Month/Time")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError>{errors.paymentCycle?.message}</FieldError>
        </Field>
        <Field>
          <FieldLabel>{t("Penalty")} (*)</FieldLabel>
          <Input
            type="number"
            {...register("penaltyAmount", { valueAsNumber: true })}
          />
          <FieldError>{errors.penaltyAmount?.message}</FieldError>
        </Field>
      </FieldGroup>

      {/* Dịch vụ */}
      <Field>
        <FieldLabel className="font-bold">Dịch vụ áp dụng:</FieldLabel>
        <ScrollArea className="h-40 border rounded-md p-3">
          {loadingServices ? (
            <Spinner />
          ) : (
            houseServices.map((service) => {
              const isChecked = serviceFields.some(
                (sf) => sf.houseServiceId === service.id
              );
              return (
                <div
                  key={service.id}
                  className="flex items-center space-x-2 py-1"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (checked)
                        appendService({
                          serviceId: service.serviceId,
                          houseServiceId: service.id,
                        });
                      else
                        removeService(
                          serviceFields.findIndex(
                            (sf) => sf.houseServiceId === service.id
                          )
                        );
                    }}
                  />
                  <label className="text-sm">
                    {service.serviceName} ({formatCurrency(service.price)})
                  </label>
                </div>
              );
            })
          )}
        </ScrollArea>
      </Field>

      {/* Khách thuê */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex justify-between items-end gap-2">
          <div className="flex-1 space-y-2">
            <FieldLabel className="font-bold">
              Danh sách khách thuê (*)
            </FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder={t("SearchByPhoneNumber")}
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <Button type="button" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <TenantCreateDialog onTenantCreated={handleAddTenant} />
        </div>

        {searchedTenant && searchPhone.length >= 10 && (
          <Card className="p-3 flex items-center justify-between border-green-500 bg-green-50">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User size={14} />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-bold">{searchedTenant.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {searchedTenant.phoneNumber}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => handleAddTenant(searchedTenant)}
            >
              Thêm
            </Button>
          </Card>
        )}

        <div className="space-y-2">
          {tenantFields.map((field, index) => (
            <Card
              key={field.id}
              className="p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">
                  #{index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{field.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {field.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={
                    watch(`tenants.${index}.representative`)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setRepresentative(index)}
                >
                  <Star
                    className={cn(
                      "h-3 w-3 mr-1",
                      watch(`tenants.${index}.representative`) && "fill-white"
                    )}
                  />
                  {t("Representative")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTenant(index)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("Updating")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> {t("UpdateContractInfo")}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
