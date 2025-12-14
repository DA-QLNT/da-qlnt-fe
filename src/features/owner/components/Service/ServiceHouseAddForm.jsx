import React, { useMemo } from "react";
import toast from "react-hot-toast";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import HouseRow from "./HouseRow";
import { Button } from "@/components/ui/button";
import { useAssignServiceToHousesMutation } from "../../store/serviceApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METHOD_OPTIONS } from "@/assets/service/methodOptions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Edit, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { ServiceHouseAssignmentSchema } from "@/lib/validation/service";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const ServiceHouseAddForm = ({ serviceId, onFormSubmitSuccess }) => {
  const { userId: ownerId, isLoadingMe } = useAuth();
  const [assignService, { isLoading: isMutating }] =
    useAssignServiceToHousesMutation();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(ServiceHouseAssignmentSchema),
    defaultValues: {
      serviceId: serviceId,
      houseIds: [], // Mảng ID nhà được chọn
      method: undefined,
      price: 0,
      effectiveDate: undefined,
    },
  });
  const selectedHouseIds = watch("houseIds");
  const selectedMethod = watch("method");

  const {
    data: houseData,
    isLoading: houseLoading,
    isFetching: houseFetching,
    isError,
  } = useGetHousesByOwnerIdQuery(
    {
      ownerId: ownerId,
      page: 0,
      size: 20,
    },
    {
      skip: !ownerId || isLoadingMe,
    }
  );
  const rawHouses = houseData?.houses || [];

  // chon/ bo chon tat ca
  const allHouseIds = useMemo(
    () => rawHouses.map((house) => house.id),
    [rawHouses]
  );
  const isAllSelected =
    allHouseIds.length > 0 &&
    allHouseIds.every((id) => selectedHouseIds.includes(id));
  const isIndeterminate = selectedHouseIds.length > 0 && !isAllSelected;

  const toggleAllHouses = (checked) => {
    setValue("houseIds", checked ? allHouseIds : []);
  };

  // chon tung nha
  const toggleHouse = (houseId) => {
    const newIds = selectedHouseIds.includes(houseId)
      ? selectedHouseIds.filter((id) => id !== houseId)
      : [...selectedHouseIds, houseId];
    setValue("houseIds", newIds);
  };
  const onSubmit = async (data) => {
    if (data.houseIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một nhà trọ.");
      return;
    }
    const formattedDate = data.effectiveDate
      ? format(data.effectiveDate, "yyyy-MM-dd")
      : null;

    const payload = {
      serviceId: data.serviceId,
      houseIds: data.houseIds,
      method: Number(data.method),
      price: data.price,
      effectiveDate: formattedDate,
    };
    try {
      await assignService(payload).unwrap();
      toast.success(
        `Đã gán dịch vụ cho ${data.houseIds.length} nhà trọ thành công!`
      );
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Gán dịch vụ thất bại.");
    }
  };
  const loading = houseLoading || houseFetching || isLoadingMe;
  const isDisabled = isMutating || loading;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        type="hidden"
        {...control.register("serviceId", { valueAsNumber: true })}
      />
      <FieldGroup>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-2">
          <Field>
            <FieldLabel>Method</FieldLabel>
            {/* <Controller/> */}
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  value={field.value?.toString()}
                  disabled={isDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cách tính" />
                  </SelectTrigger>
                  <SelectContent>
                    {METHOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field>
            <FieldLabel>Price</FieldLabel>
            <Input
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="enter price"
            />
            <FieldError>{errors.price?.message}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Effective Date (*)</FieldLabel>
            <Controller
              name="effectiveDate"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isDisabled}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value
                        ? format(field.value, "dd/MM/yyyy")
                        : "Chọn ngày hiệu lực"}
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
            <FieldError>{errors.effectiveDate?.message}</FieldError>
          </Field>
        </div>
        <div className="rounded-lg border border-purple-300 p-1 shadow-md shadow-secondary">
          <ScrollArea className={"h-72 w-full"}>
            {(houseLoading || houseFetching) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner className={"size-20 text-primary"} />
              </div>
            )}
            <Table>
              <TableHeader className={"bg-sidebar"}>
                <TableRow>
                  <TableHead className={"w-[50px]"}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onCheckedChange={toggleAllHouses}
                      disabled={isDisabled}
                      title="Select All"
                    />
                  </TableHead>
                  <TableHead>House</TableHead>
                  <TableHead>Price/Month</TableHead>
                  <TableHead>EffectiveDate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rawHouses.map((house) => (
                  <HouseRow
                    key={house.id}
                    house={house}
                    serviceId={serviceId}
                    // TRUYỀN PROPS CHECKBOX
                    isChecked={selectedHouseIds.includes(house.id)}
                    onCheckedChange={() => toggleHouse(house.id)}
                    disabled={isDisabled}
                  />
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <FieldError>{errors.houseIds?.message}</FieldError>
        </div>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isDisabled || !isValid}
        className={"w-full sm:w-auto flex justify-self-end"}
      >
        {isMutating ? (
          <Spinner />
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Thêm
          </>
        )}
      </Button>
    </form>
  );
};

export default ServiceHouseAddForm;
