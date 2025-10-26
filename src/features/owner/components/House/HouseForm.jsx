import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useEffect, useMemo, useRef } from "react";
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
import {
  useCreateHouseMutation,
  useUpdateHouseMutation,
} from "../../store/houseApi";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HouseForm = ({
  initialData = null,
  mode = "add",
  onFormSubmitSuccess,
}) => {
  const { ownerId } = useAuth();
  const isEditMode = mode === "edit";
  const schema = !isEditMode ? HouseAddSchema : HouseAddSchema;

  // Create mutation
  const [createHouse, { isLoading: isCreating }] = useCreateHouseMutation();
  // Update mutation
  const [updateHouse, { isLoading: isUpdating }] = useUpdateHouseMutation();
  const isMutating = isCreating || isUpdating;

  const defaultValues = useMemo(
    () => ({
      id: initialData?.id || undefined,
      ownerId: initialData?.ownerId || ownerId,
      name: initialData?.name || "",
      province: initialData?.province || "",
      district: initialData?.district || "",
      address: initialData?.address || "",
      area: initialData?.area || "",
      ruleIds: initialData?.rules?.map((rule) => rule.id) || [],
    }),
    [initialData, ownerId]
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  const selectedProvinceName = watch("province");

  // Get provinces
  const { data: provinceData, isLoading: loadingProvinces } =
    useGetProvincesQuery();
  const provinces = provinceData || [];

  // Get current province
  const currentProvince = useMemo(() => {
    return provinces.find((p) => p.name === selectedProvinceName);
  }, [provinces, selectedProvinceName]);

  // Get districts
  const { data: districtData, isLoading: loadingDistricts } =
    useGetDistrictsByProvinceCodeQuery(currentProvince?.code, {
      skip: !currentProvince?.code,
    });
  const districts = districtData || [];

  const initialProvince = initialData?.province;

  // SỬA LỖI RESET DISTRICT KHI PRELOAD
  useEffect(() => {
    // const isPreloadedDistrict =
    //   initialData && initialData.district === watch("district");

    if (currentProvince?.code) {
      if (
        watch("province") !== initialData?.province &&
        watch("province") !== ""
      ) {
        setValue("district", "");
      }
    } else if (!isEditMode && watch("province") === "") {
      setValue("district", "");
    }
  }, [
    currentProvince?.code,
    setValue,
    watch("province"),
    initialData?.province,
  ]);

  // Handle form submit
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      ownerId: data.ownerId || ownerId,
      area: data.area ? Number(data.area) : null,
      ruleIds: data.ruleIds || [],
    };
    try {
      const mutationFn = isEditMode
        ? () => updateHouse({ houseId: initialData.id, ...payload }).unwrap()
        : () => createHouse(payload).unwrap();
      await mutationFn();
      toast.success(isEditMode ? "UpdateSuccess" : "CreateSuccess");
      if (!isEditMode) {
        reset();
      }
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(isEditMode ? "UpdateFail" : "CreateFail");
      console.error(error);
    }
  };

  const isDisabled = isMutating || loadingProvinces || loadingDistricts;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {isEditMode && (
        <input type="hidden" {...register("id", { valueAsNumber: true })} />
      )}
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
            <FieldLabel htmlFor="area">Area (m2)</FieldLabel>
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
          <FieldLabel>Address</FieldLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Province Select */}
            <div className="flex flex-col gap-2">
              <span className="text-sm">Province</span>
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value !== initialProvince) {
                        setValue("district", "");
                      }
                    }}
                    disabled={isDisabled || loadingProvinces}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select province" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {provinces.map((province) => (
                          <SelectItem key={province.code} value={province.name}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.province?.message}</FieldError>
            </div>

            {/* District Select */}
            <div className="flex flex-col gap-2">
              <span className="text-sm">District</span>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={
                      isDisabled || !currentProvince || loadingDistricts
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          currentProvince
                            ? loadingDistricts
                              ? "Loading..."
                              : "Select district"
                            : "Province first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {districts.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            No districts available
                          </div>
                        ) : (
                          districts.map((district) => (
                            <SelectItem
                              key={district.code}
                              value={district.name}
                            >
                              {district.name}
                            </SelectItem>
                          ))
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError>{errors.district?.message}</FieldError>
            </div>

            {/* Address Input */}
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

        {/* House Rules */}
        <Field>
          <Controller
            name="ruleIds"
            control={control}
            render={({ field }) => (
              <HouseRuleSelectGroup
                field={field}
                error={errors.ruleIds?.message}
              />
            )}
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isDisabled}
          className={"w-full md:w-1/2"}
        >
          {isMutating ? <Spinner /> : isEditMode ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
};

export default HouseForm;
