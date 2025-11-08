import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useUpdateHouseServiceMutation } from "../../store/serviceApi";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HouseServiceRowSchema } from "@/lib/validation/service";
import toast from "react-hot-toast";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { METHOD_OPTIONS } from "@/assets/service/methodOptions";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Save, SquarePen, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
const HouseServiceRow = ({
  houseService,
  index,
  disabledEdit,
  startEditing,
  stopEditing,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updateService, { isLoading: isMutating }] =
    useUpdateHouseServiceMutation();
  const defaultValues = useMemo(
    () => ({
      method: houseService.method?.toString() || "0",
      price: houseService.price || 0,
      // Tạo Date object từ chuỗi YYYY-MM-DD một cách an toàn mà không bị múi giờ ảnh hưởng
      effectiveDate: houseService.effectiveDate
        ? new Date(houseService.effectiveDate + "T00:00:00") // Ép về 00:00:00 local time
        : undefined,
    }),
    [houseService]
  );
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { error, isDirty },
  } = useForm({
    resolver: zodResolver(HouseServiceRowSchema),
    defaultValues: defaultValues,
  });
  const handleSave = async (data) => {
    const payload = {
      method: Number(data.method),
      price: data.price,
      effectiveDate: data.effectiveDate
        ? format(data.effectiveDate, "yyyy-MM-dd")
        : null,
    };
    try {
      await updateService({
        houseServiceId: houseService.id,
        data: payload,
      }).unwrap();
      toast.success("Cập nhật thành công");
      setIsEditing(false);
      //   stopEditing();
    } catch (error) {
      console.error(error);
    }
  };
  const startEdit = () => {
    if (disabledEdit) {
      toast.error("Please complete edit another row");
      return;
    }
    setIsEditing(true);
  };
  const cancelEditing = () => {
    reset(defaultValues);
    setIsEditing(false);
  };
  const isDisabled = isMutating || isEditing;
  return (
    <TableRow>
      <TableCell className={"w-[50px]"}>{index + 1}</TableCell>
      <TableCell className={"font-medium"}>
        {houseService.serviceName}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => field.onChange(val)}
                value={field.value}
                disabled={isMutating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METHOD_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : (
          METHOD_OPTIONS.find(
            (option) => option.value.toString() === houseService.method
          )?.label
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            {...register("price", { valueAsNumber: true })}
            disabled={isMutating}
            className={"w-full max-w-[150px]"}
          />
        ) : (
          formatCurrency(houseService.price)
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Controller
            name="effectiveDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={"w-full justify-start text-left font-normal"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(new Date(field.value), "PPP")
                      : "Chọn ngày hiệu lực"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={"w-auto p-0"}>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        ) : (
          houseService.effectiveDate
        )}
      </TableCell>
      <TableCell className={"flex justify-end"}>
        {isEditing ? (
          <div className="flex gap-1">
            <Button
              size="icon"
              onClick={handleSubmit(handleSave)}
              disabled={isMutating || !isDirty}
              title="Lưu"
            >
              {isMutating ? <Spinner /> : <Save className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={cancelEditing}
              disabled={isMutating}
              title="Hủy"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" onClick={startEdit} disabled={isDisabled}>
            <SquarePen className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default HouseServiceRow;
