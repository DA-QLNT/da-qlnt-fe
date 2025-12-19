import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetContractByIdQuery,
  useSetNewRepresentativeMutation,
} from "../../store/contractApi"; //  Import hook
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileText,
  User,
  DollarSign,
  Info,
  Check,
  Settings,
  Settings2,
  Trash,
} from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContractStatusBadge from "../../components/Contract/ContractStatusBadge";
import ServiceTypeBadge from "../../components/Service/ServiceTypeBadge";
import ContractInforEditDialog from "../../components/Contract/ContractInforEditDialog";
import TenantAddDialog from "../../components/Contract/TenantAddDialog";
import ContractServiceAddDialog from "../../components/Contract/ContractServiceAddDialog";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import TenantLeaveDialog from "../../components/Contract/TenantLeaveDialog";
import ContractActivateConfirm from "../../components/Contract/ContractActiveConfirm";
import ContractCancelConfirm from "../../components/Contract/ContractCancelConfirm";
import ContractExtendDialog from "../../components/Contract/ContractExtendDialog";
import { useTranslation } from "react-i18next";

// export const CONTRACT_STATUS_MAP_Dev = {
//   0: { label: "DRAFT", color: "bg-gray-400" },
//   1: { label: "PENDING", color: "bg-yellow-500" },
//   2: { label: "ACTIVE", color: "bg-green-600" },
//   3: { label: "EXPIRED", color: "bg-red-600" },
//   4: { label: "CANCELLED", color: "bg-stone-500" },
// };

const ContractDetailOwner = () => {
  const { t } = useTranslation("contractinvoice");

  const navigate = useNavigate();
  //  LẤY contractId TỪ URL
  const { houseId, roomId, contractId } = useParams();
  const id = Number(contractId);
  const houseID = Number(houseId);

  // FETCH DỮ LIỆU
  const {
    data: contract,
    isLoading: isLoadingContract,
    isFetching: isFetchingContract,
    isError: isErrorContract,
  } = useGetContractByIdQuery(id, { skip: !id });

  const loadingContract = isLoadingContract || isFetchingContract;

  const backToContractList = () => {
    navigate(`/owner/houses/${houseId}/rooms/${roomId}/contracts`);
  };

  //   update contract
  const [isContractInforEditDialogOpen, setIsContractInforEditDialogOpen] =
    useState(false);
  const openContractInforEditDialog = () => {
    setIsContractInforEditDialogOpen((prev) => !prev);
  };
  // add tenant
  const [isTenantAddDialogOpen, setIsTenantAddDialogOpen] = useState(false);
  const openTenantAddDialog = () => {
    // Chỉ cho phép thêm khi DRAFT (0) hoặc ACTIVE (2) cũng đã kiểm tra trước đó với nút thêm
    if (contract.status === 0 || contract.status === 2) {
      setIsTenantAddDialogOpen(true);
    } else {
      toast.error(t("OnlyAddTenantIfDraftOrActive"));
    }
  };
  // leave tenant
  const [isTenantLeaveDialogOpen, setIsTenantLeaveDialogOpen] = useState(false);
  const [tenantToLeave, setTenantToLeave] = useState(null);
  const [setRepresentative] = useSetNewRepresentativeMutation();

  const openLeaveTenantDialog = (tenant) => {
    if (contract.status === 2 || contract.status === 0) {
      setTenantToLeave(tenant);
      setIsTenantLeaveDialogOpen(true);
    } else {
      toast.error(t("OnlyChangeTenantIfDraftOrActive"));
    }
  };
  const handleSetRepresentative = async (tenantId) => {
    if (contract.status !== 2) {
      return toast.error(t("OnlyChangeRepresentativeIfDraftOrActive"));
    }

    //  CHỈ THỰC HIỆN KHI UNCHECKING (để chuyển sang người khác)
    // Nếu người dùng cố gắng check một người đã là đại diện, ta bỏ qua
    const tenant = contract.tenants.find((t) => t.id === tenantId);
    if (tenant.representative) return; // Đã là đại diện, không làm gì.

    // Gửi mutation chọn người này làm đại diện
    const toastId = toast.loading(t("Assigning"));
    try {
      await setRepresentative({
        contractId: contract.id,
        newRepresentativeId: tenantId,
      }).unwrap();
      toast.success(t("AssignSuccess"), { id: toastId });
    } catch (error) {
      toast.error(t("AssignFailed"), {
        id: toastId,
      });
    }
  };

  // add Service
  const [isServiceAddDialogOpen, setIsServiceAddDialogOpen] = useState(false);
  const openServiceAddDialog = () => {
    console.log("abc");

    // Chỉ cho phép thêm khi DRAFT (0) hoặc ACTIVE (2)
    if (contract.status === 0 || contract.status === 2) {
      setIsServiceAddDialogOpen(true);
    } else {
      toast.error(t("OnlyEditServiceIfDraftOrActive"));
    }
  };
  const closeServiceAddDialog = (open) => {
    if (!open) {
      setIsServiceAddDialogOpen(false);
    }
  };
  // active contract
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
  const openActivateDialog = () => {
    if (contract.status === 0) {
      // Chỉ khi DRAFT (0)
      setIsActivateDialogOpen(true);
    } else {
      toast.error(t("OnlyActivateIfDraft"));
    }
  };
  const closeActivateDialog = (open) => {
    if (!open) {
      setIsActivateDialogOpen(false);
    }
  };

  // cancel contract
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Hàm mở Dialog Hủy
  const openCancelDialog = () => {
    // Chỉ khi DRAFT (0) hoặc PENDING (1)
    if (contract.status === 0 || contract.status === 1) {
      setIsCancelDialogOpen(true);
    } else {
      toast.error(t("OnlyCancelIfDraftOrPending"));
    }
  };
  const closeCancelDialog = (open) => {
    if (!open) {
      setIsCancelDialogOpen(false);
    }
  };
  // =========== extend======
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);

  // Logic mở Dialog Gia hạn
  const openExtendDialog = () => {
    // Chỉ cho phép gia hạn khi ACTIVE (2)
    if (contract.status === 2) {
      setIsExtendDialogOpen(true);
    } else {
      toast.error(t("OnlyExtendIfActive"));
    }
  };
  const closeExtendDialog = (open) => {
    if (!open) {
      setIsExtendDialogOpen(false);
    }
  };

  // ========UI===========

  if (loadingContract) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  } else if (isErrorContract || !contract) {
    return (
      <div className="p-6 text-center text-red-500">
        {t("NoContract")}: {contractId}.
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/* extend contract */}
      {contract && (
        <ContractExtendDialog
          contract={contract}
          open={isExtendDialogOpen}
          onOpenChange={closeExtendDialog}
        />
      )}
      {/* cancel contract */}
      <ContractCancelConfirm
        contract={contract}
        open={isCancelDialogOpen}
        onOpenChange={closeCancelDialog}
      />
      {/* activate contract */}
      <ContractActivateConfirm
        contract={contract}
        open={isActivateDialogOpen}
        onOpenChange={closeActivateDialog}
      />
      {/* update contract */}
      <ContractInforEditDialog
        contractId={id}
        open={isContractInforEditDialogOpen}
        onOpenChange={setIsContractInforEditDialogOpen}
      />
      {/* add tenant */}
      <TenantAddDialog
        contractId={id}
        open={isTenantAddDialogOpen}
        onOpenChange={setIsTenantAddDialogOpen}
      />
      {/* leave tenant */}
      {tenantToLeave && (
        <TenantLeaveDialog
          contractId={id}
          tenant={tenantToLeave}
          open={isTenantLeaveDialogOpen}
          onOpenChange={setIsTenantLeaveDialogOpen}
        />
      )}
      {/* add service */}
      <ContractServiceAddDialog
        contract={contract}
        houseId={houseID}
        open={isServiceAddDialogOpen}
        onOpenChange={closeServiceAddDialog}
      />
      <Button variant="outline" onClick={backToContractList}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {t("Back")}
      </Button>

      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <FileText className="w-6 h-6" /> {t("DetailContract")} {t("Room")}-
          {contract.roomName}
        </h1>
      </header>

      {/* --------------------- PHẦN THÔNG TIN CHÍNH --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" /> {t("ContractInfor")}
            </div>
            {contract.status === 0 && (
              <Button onClick={openContractInforEditDialog}>{t("Edit")}</Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-1/4 font-medium">{t("Room")}</TableCell>
                <TableCell>
                  {contract.roomName} ({t("House")}: {contract.houseName})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Status")}</TableCell>
                <TableCell>
                  <ContractStatusBadge contractStatus={contract.status} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Price")}</TableCell>
                <TableCell>{formatCurrency(contract.rent)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Deposit")}</TableCell>
                <TableCell>{formatCurrency(contract.deposit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("PaymentCycle")}
                </TableCell>
                <TableCell>
                  {contract.paymentCycle} {t("Month/Time")}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("EffectiveDate")}
                </TableCell>
                <TableCell>
                  {formatDateTime(contract.startDate).formattedDate} -
                  {formatDateTime(contract.endDate).formattedDate}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Penalty")}</TableCell>
                <TableCell>{formatCurrency(contract.penaltyAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --------------------- KHÁCH THUÊ --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" /> Danh sách Khách thuê{" "}
            </div>
            {(contract.status === 0 || contract.status === 2) && (
              <Button onClick={openTenantAddDialog}>Tạo khách thuê</Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10px]">#</TableHead>
                <TableHead>Họ Tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Đại diện</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.tenants?.map((tenant, index) => (
                <TableRow key={tenant.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{tenant.fullName}</TableCell>
                  <TableCell>{tenant.phoneNumber}</TableCell>

                  {/*  CHỌN ĐẠI DIỆN BẰNG CHECKBOX */}
                  <TableCell>
                    <Checkbox
                      checked={tenant.representative}
                      disabled={contract.status !== 2} // Chỉ sửa khi ACTIVE
                      // Xử lý khi Checkbox thay đổi
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSetRepresentative(tenant.id);
                        }
                        // Nếu uncheck, hệ thống sẽ tự chọn người khác (hoặc báo lỗi)
                        // Frontend không cần xử lý uncheck vì luôn phải có 1 đại diện
                      }}
                    />
                  </TableCell>

                  <TableCell className="text-right">
                    {(contract.status === 2 || contract.status === 0) && (
                      <Button
                        variant="destructive"
                        onClick={() => openLeaveTenantDialog(tenant)}
                      >
                        Rời
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --------------------- DỊCH VỤ --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Dịch vụ áp dụng
            </div>
            {(contract.status === 0 || contract.status === 2) && (
              <Button onClick={openServiceAddDialog}>Thêm dịch vụ</Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Giá/Chu kỳ</TableHead>
                <TableHead>Cách tính</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.services?.map((service, index) => (
                <TableRow key={service.id}>
                  <TableCell>{service.serviceName}</TableCell>
                  <TableCell>{formatCurrency(service.price)}</TableCell>
                  <TableCell>
                    <ServiceTypeBadge type={Number(service.method)} />
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <Trash />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        {/* DRAFT ACTIONS */}
        {(contract.status === 0 || contract.status === 1) && (
          <Button variant="secondary" onClick={openCancelDialog}>
            Hủy
          </Button>
        )}
        {contract.status === 0 && (
          <Button onClick={openActivateDialog}>Kích hoạt</Button>
        )}

        {/* ACTIVE ACTIONS */}
        {contract.status === 2 && (
          <Button onClick={openExtendDialog} variant="outline">
            Gia hạn
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContractDetailOwner;
