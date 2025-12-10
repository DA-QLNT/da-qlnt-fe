import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TenantSchema } from "@/lib/validation/contract";
import { useAddTenantMutation } from "../../store/contractApi";
import toast from "react-hot-toast";
import { Loader2, UserPlus, Search, User, CheckCircle } from "lucide-react";
import React, { useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { useSearchTenantByPhoneNumberQuery } from "../../store/tenantApi";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TenantCreateDialog from "../Tenant/TenantCreateDialog";

export default function TenantAddForm({ contractId, onFormSubmitSuccess }) {
  const [addTenant, { isLoading: isAdding }] = useAddTenantMutation();

  // State cho tìm kiếm
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");
  const debouncedSearch = useDebounce(phoneSearchTerm, 500);

  // Query tìm kiếm tenant
  const {
    data: searchedTenantData,
    isFetching: isSearching,
    refetch: refetchSearch,
  } = useSearchTenantByPhoneNumberQuery(debouncedSearch, {
    skip: !debouncedSearch || debouncedSearch.length < 10,
  });

  const foundTenant = searchedTenantData;
  const showSearchResults = !isSearching && debouncedSearch.length >= 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(TenantSchema),
    defaultValues: {
      id: undefined,
      fullName: "",
      phoneNumber: "",
      email: "",
    },
  });

  // Hàm xử lý khi thêm tenant đã tìm thấy vào hợp đồng
  const handleAddFoundTenant = async (tenant) => {
    try {
      const payload = {
        id: tenant.id,
        fullName: tenant.fullName,
        phoneNumber: tenant.phoneNumber,
        email: tenant.email,
      };

      await addTenant({ contractId, tenantData: payload }).unwrap();
      toast.success(`Đã thêm khách thuê ${tenant.fullName} vào hợp đồng.`);
      setPhoneSearchTerm("");
      refetchSearch();
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Thêm khách thuê thất bại.");
      console.error("Add tenant error:", error);
    }
  };

  // Hàm xử lý khi tạo tenant mới thành công
  const handleTenantCreated = async (newTenant) => {
    try {
      const payload = {
        id: newTenant.id,
        fullName: newTenant.fullName,
        phoneNumber: newTenant.phoneNumber,
        email: newTenant.email,
      };

      await addTenant({ contractId, tenantData: payload }).unwrap();
      toast.success(`Đã thêm khách thuê ${newTenant.fullName} vào hợp đồng.`);
      onFormSubmitSuccess();
    } catch (error) {
      toast.error(error.data?.message || "Thêm khách thuê thất bại.");
      console.error("Add tenant error:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* ============= PHẦN TÌM KIẾM/NÚT TẠO MỚI ============= */}
      <Field>
        <FieldLabel className="font-bold">
          Tìm kiếm hoặc Tạo Khách thuê mới:
        </FieldLabel>
        <div className="flex gap-2 items-start">
          <div className="flex-grow space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Nhập SĐT để tìm kiếm"
                value={phoneSearchTerm}
                onChange={(e) => setPhoneSearchTerm(e.target.value)}
                disabled={isAdding}
                className="flex-grow"
              />
              <Button
                type="button"
                size="icon"
                onClick={refetchSearch}
                disabled={isAdding || phoneSearchTerm.length < 10}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM */}
            {isSearching && debouncedSearch.length >= 10 && (
              <div className="flex items-center text-sm">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang tìm kiếm
                Tenant...
              </div>
            )}

            {showSearchResults &&
              (foundTenant ? (
                // Tenant ĐƯỢC TÌM THẤY
                <Card className="flex items-center justify-between p-3 border-green-500 bg-green-50 dark:bg-green-900/10">
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
                    onClick={() => handleAddFoundTenant(foundTenant)}
                    disabled={isAdding}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm vào Hợp đồng
                  </Button>
                </Card>
              ) : (
                // Tenant KHÔNG TÌM THẤY
                <Card className="p-3 border-red-500 bg-red-50 dark:bg-red-900/10">
                  <p className="font-medium text-sm">
                    Không tìm thấy Tenant với SĐT *{debouncedSearch}*. Vui lòng
                    Tạo Tenant mới.
                  </p>
                </Card>
              ))}

            {/* THÔNG BÁO KHI SĐT CHƯA ĐỦ DÀI */}
            {phoneSearchTerm.length > 0 && phoneSearchTerm.length < 10 && (
              <p className="text-sm text-yellow-600">
                Nhập đủ 10 số để tìm kiếm.
              </p>
            )}
          </div>

          {/* NÚT TẠO TENANT MỚI (Mở Dialog) */}
          <TenantCreateDialog onTenantCreated={handleTenantCreated} />
        </div>
      </Field>
    </div>
  );
}
