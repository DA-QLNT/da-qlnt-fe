import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContractExtendSchema } from "@/lib/validation/contract"; //  Import Schema
import { useExtendContractMutation } from "../../store/contractApi";
import toast from "react-hot-toast";
import { format, addMonths } from "date-fns";
import { Clock, Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import ServiceTypeBadge from "../Service/ServiceTypeBadge";
import { useGetHouseServicesByHouseIdQuery as fetchHouseServices } from "../../store/serviceApi";
import { Search, Trash, Star, User } from "lucide-react";
import useDebounce from "@/hooks/useDebounce";
import { useSearchTenantByPhoneNumberQuery } from "../../store/tenantApi";
import TenantCreateDialog from "../Tenant/TenantCreateDialog";

export default function ContractExtendForm({ contract, onFormSubmitSuccess }) {
  const { t } = useTranslation("contractinvoice");
  const [extendContract, { isLoading }] = useExtendContractMutation();

  const currentEndDate = useMemo(
    () => new Date(contract.endDate),
    [contract.endDate]
  );

  // Mặc định ngày kết thúc mới là 12 tháng sau ngày hiện tại
  const suggestedEndDate = useMemo(
    () => addMonths(currentEndDate, 12),
    [currentEndDate]
  );

  // Fetch house services
  const { data: allServicesData, isLoading: loadingServices } =
    fetchHouseServices(contract.houseId, { skip: !contract.houseId });
  const allHouseServices = allServicesData || [];

  // Map existing services and tenants
  const existingServices = useMemo(() => {
    if (!contract || !contract.services || contract.services.length === 0)
      return [];
    return contract.services.map((service) => ({
      houseServiceId: service.houseServiceId || service.id,
      serviceId: service.serviceId,
    }));
  }, [contract, contract?.services]);

  const existingTenants = useMemo(() => {
    if (!contract || !contract.tenants || contract.tenants.length === 0)
      return [];
    return contract.tenants.map((tenant) => ({
      id: tenant.id,
      tenantId: tenant.tenantId || tenant.tenant_id || tenant.id,
      representative: tenant.representative,
      fullName: tenant.fullName || tenant.full_name || "",
      phoneNumber: tenant.phoneNumber || tenant.phone_number || "",
    }));
  }, [contract, contract?.tenants]);

  // Tenant search state (moved to top-level to use hooks correctly)
  const [searchPhone, setSearchPhone] = useState("");
  const debouncedSearch = useDebounce(searchPhone, 500);
  const { data: searchedTenant, isLoading: loadingSearch } =
    useSearchTenantByPhoneNumberQuery(debouncedSearch, {
      skip: debouncedSearch.length < 10,
    });

  //  SETUP RHF
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(ContractExtendSchema),
    defaultValues: {
      newEndDate: suggestedEndDate, // Giá trị mặc định gợi ý
      newRent: contract.rent,
      houseServiceIds: existingServices,
      tenants: existingTenants,
    },
  });

  const watchNewEndDate = watch("newEndDate");
  const watchTenants = watch("tenants");
  const watchServices = watch("houseServiceIds");

  const onSubmit = async (data) => {
    // 1. Chuẩn bị payload
    const payload = {
      newEndDate: format(data.newEndDate, "yyyy-MM-dd"),
      newRent: data.newRent,
      houseServiceIds: data.houseServiceIds || [],
      tenants: (data.tenants || []).map((t) => ({
        id: t.tenantId,
        representative: t.representative,
      })),
    };

    const toastId = toast.loading(`${t("ExtendingContractLoading")} ...`);

    try {
      await extendContract({ contractId: contract.id, data: payload }).unwrap();

      toast.success(t("ContractExtendedSuccessMessage"));
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || t("ExtendFailed"));
      console.error("Contract extend error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Current Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("CurrentContractInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/3">
                  {t("RentedRoom")}
                </TableCell>
                <TableCell>
                  {contract.roomName} ({t("House")}: {contract.houseName})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("CurrentPrice")}
                </TableCell>
                <TableCell>{formatCurrency(contract.rent)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("OldEndDateLabel")}
                </TableCell>
                <TableCell>{format(currentEndDate, "PP")}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Update Section */}
      <FieldGroup>
        {/* New End Date */}
        <Field>
          <FieldLabel>{t("NewEndDateLabel")} (*)</FieldLabel>
          <Controller
            name="newEndDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-full justify-start text-left font-normal")}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(field.value, "dd/MM/yyyy")
                      : t("SelectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  {/* Cho phép chọn ngày sau ngày hết hạn cũ */}
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    disabled={(date) => date < currentEndDate}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError>{errors.newEndDate?.message}</FieldError>
        </Field>

        {/* New Rent */}
        <Field>
          <FieldLabel>{t("NewRentLabel")}</FieldLabel>
          <Input
            type="number"
            {...register("newRent", { valueAsNumber: true })}
            placeholder={`${t("DefaultRent")}: ${formatCurrency(
              contract.rent
            )}`}
            disabled={isLoading}
          />
          <FieldError>{errors.newRent?.message}</FieldError>
        </Field>
      </FieldGroup>

      {/* Services Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("AppliedServices")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingServices ? (
            <div className="flex justify-center py-10">
              <Spinner className="size-8 text-primary" />
            </div>
          ) : (
            <Controller
              name="houseServiceIds"
              control={control}
              render={({ field }) => (
                <ScrollArea className="h-64 border rounded-md p-3">
                  <div className="space-y-3">
                    {allHouseServices && allHouseServices.length > 0 ? (
                      allHouseServices.map((houseService) => {
                        const isChecked = (field.value || []).some(
                          (s) => s.houseServiceId === houseService.id
                        );
                        return (
                          <div
                            key={houseService.id}
                            className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                          >
                            <Checkbox
                              checked={isChecked}
                              disabled={isLoading}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([
                                    ...(field.value || []),
                                    {
                                      houseServiceId: houseService.id,
                                      serviceId: houseService.serviceId,
                                    },
                                  ]);
                                } else {
                                  field.onChange(
                                    (field.value || []).filter(
                                      (s) =>
                                        s.houseServiceId !== houseService.id
                                    )
                                  );
                                }
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {houseService.serviceName}
                                </span>
                                <span className="text-sm text-muted-foreground ">
                                  {formatCurrency(houseService.price)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground  mt-1">
                                <ServiceTypeBadge
                                  type={Number(houseService.method)}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted-foreground  py-4">
                        {t("NoServices")}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            />
          )}
          <FieldError>{errors.houseServiceIds?.message}</FieldError>
        </CardContent>
      </Card>

      {/* Tenants Section (search / create / remove / representative) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("ListTenant")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Controller
              name="tenants"
              control={control}
              render={({ field }) => {
                // uses top-level searchPhone / searchedTenant

                const handleAddTenant = (tenant) => {
                  if ((field.value || []).some((f) => f.id === tenant.id)) {
                    return toast.error(t("TenantAlreadyAdded"));
                  }
                  const newTenant = {
                    id: tenant.id,
                    tenantId: tenant.id,
                    fullName: tenant.fullName,
                    phoneNumber: tenant.phoneNumber,
                    representative: (field.value || []).length === 0,
                  };
                  field.onChange([...(field.value || []), newTenant]);
                  setSearchPhone("");
                };

                const removeTenant = (id) => {
                  field.onChange(
                    (field.value || []).filter((t) => t.id !== id)
                  );
                };

                const setRepresentative = (id) => {
                  const newTenants = (field.value || []).map((t) => ({
                    ...t,
                    representative: t.id === id,
                  }));
                  field.onChange(newTenants);
                };

                return (
                  <div className="space-y-3">
                    {/* Search + Add area */}
                    <div className="flex items-center gap-2">
                      <Input
                        value={searchPhone}
                        onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder={t("SearchByPhoneNumber")}
                      />
                      <Button
                        type="button"
                        size="icon"
                        disabled={searchPhone.length < 10}
                        onClick={() => {}}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <TenantCreateDialog onTenantCreated={handleAddTenant} />
                    </div>

                    {searchedTenant && searchPhone.length >= 10 && (
                      <Card className="p-3 flex items-center justify-between border-green-500 bg-green-50">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5" />
                          <div className="text-sm">
                            <p className="font-bold">
                              {searchedTenant.fullName}
                            </p>
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
                          {t("Add")}
                        </Button>
                      </Card>
                    )}

                    {/* Existing tenants list */}
                    <div className="space-y-2">
                      {(field.value || []).map((tenant, index) => (
                        <Card key={tenant.id} className="px-4 py-2 ">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground">
                                #{index + 1}
                              </span>
                              <div>
                                <p className="text-sm font-medium">
                                  {tenant.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {tenant.phoneNumber}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant={
                                  tenant.representative ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() => setRepresentative(tenant.id)}
                              >
                                <Star className="h-3 w-3 mr-1" />
                                {t("Representative")}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTenant(tenant.id)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
          </div>
          <FieldError>{errors.tenants?.message}</FieldError>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Clock className="h-4 w-4 mr-2" />
          )}
          {t("ExtendContract")}
        </Button>
      </div>
    </form>
  );
}
