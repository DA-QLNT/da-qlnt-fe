import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HouseAddSchema } from "@/lib/validation/house";
import {
  useGetDistrictsByProvinceCodeQuery,
  useGetProvincesQuery,
} from "@/store/api/addressApi";
import toast from "react-hot-toast";
import HouseRuleSelectGroup from "./HouseRuleSelectGroup";
import { Spinner } from "@/components/ui/spinner";
import { useCreateHouseMutation } from "../../store/houseApi";

const defaultValues = {
  name: "",
  province: "",
  district: "",
  address: "",
  area: "",
  ruleIds: [],
};

const HouseAddForm = ({ onFormSubmitSuccess }) => {
  const { ownerId } = useAuth();
  //create
  const [createHouse, { isLoading: isMutating }] = useCreateHouseMutation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(HouseAddSchema),
    defaultValues: {
      name: "",
      province: "",
      district: "",
      address: "",
      area: "",
      ruleIds: [],
    },
  });
  const selectedProvinceCode = watch("province");

  const { data: provinceData, isLoading: loadingProvinces } =
    useGetProvincesQuery();
  const provinces = provinceData || [];
  const { data: districtData, isLoading: loadingDistricts } =
    useGetDistrictsByProvinceCodeQuery(selectedProvinceCode, {
      skip: !selectedProvinceCode,
    });
  const districts = districtData || [];

  // reset district when province change
  useEffect(() => {
    setValue("district", "");
  }, [selectedProvinceCode, setValue]);
  // =======handle==
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      ownerId: ownerId,
      area: data.area ? Number(data.area) : null,
      ruleIds: data.ruleIds || [],
    };
    try {
      await createHouse(payload).unwrap();
      toast.success("CreateSuccess");
      reset();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error("CreateFail");
      console.error(error);
    }
  };
  const isDisabled = isMutating || loadingProvinces || loadingDistricts;

  // render option address
  const renderAddressCombobox = (options, placeholder, value, onChange, name) => {
    const [open, setOpen] = useState(false);
    const displayValue = options.find((option) => option.code === value)?.name;
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"secondary"}
            role="combobox"
            className={cn("w-full justify-between", isDisabled && "opacity-70")}
            disabled={isDisabled}
          >
            {displayValue || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={"p-0"}>
          <Command>
            <CommandInput placeholder="Search" />
            <CommandEmpty>
              {options.length === 0 ? "No data" : "No results"}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.code}
                  value={option.name}
                  onSelect={() => {
                    onChange(option.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.code ? "opacity-100" : "opacity-0"
                    )}
                  />{" "}
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Field className={"md:col-span-2"}>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter house name"
              disabled={isDisabled}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>
          <Field className={"md:col-span-1"}>
            <FieldLabel htmlFor="name">Area (m2)</FieldLabel>
            <Input
              id="area"
              type="number"
              placeholder="Enter house area"
              disabled={isDisabled}
              {...register("area", { valueAsNumber: true })}
            />
            <FieldError>{errors.area?.message}</FieldError>
          </Field>
        </div>
        <Field>
          <FieldLabel>Adress</FieldLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <span>Province</span>
              <Controller
                name="province"
                control={control}
                render={({ field }) =>
                  renderAddressCombobox(provinces, "Select province", field.value, (code)=>{
                    field.onChange(code);
                    setValue("district", "");
                  }, "province")
                }
              />
              <FieldError>{errors.province?.message}</FieldError>
            </div>
            <div className="flex flex-col gap-2">
              <span>District</span>

              <Controller
                name="district"
                control={control}
                render={({ field }) =>
                  renderAddressCombobox(
                    districts,
                    selectedProvinceCode
                      ? "Select District"
                      : "Select Province first",
                    field.value,
                    field.onChange, 'district'
                  )
                }
              />
              <FieldError>{errors.district?.message}</FieldError>
            </div>
            <Field className={"col-span-full md:col-span-2"}>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                placeholder="Enter house address"
                {...register("address")}
                disabled={isDisabled}
              />
              <FieldError>{errors.address?.message}</FieldError>
            </Field>
          </div>
        </Field>
        <Field>
          <Controller
            name="ruleIds"
            control={control}
            render={({ field, fieldState }) => (
              <HouseRuleSelectGroup
                field={field}
                error={errors.ruleIds?.message}
              />
            )}
          />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isDisabled} className={"w-full"}>
        {isMutating ? <Spinner /> : "Create"}
      </Button>
    </form>
  );
};

export default HouseAddForm;
