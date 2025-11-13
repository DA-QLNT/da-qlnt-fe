import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetContractByIdQuery } from "../../store/contractApi"; // 🚨 Import hook
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

export const CONTRACT_STATUS_MAP_Dev = {
  0: { label: "DRAFT", color: "bg-gray-400" },
  1: { label: "PENDING", color: "bg-yellow-500" },
  2: { label: "ACTIVE", color: "bg-green-600" },
  3: { label: "EXPIRED", color: "bg-red-600" },
  4: { label: "CANCELLED", color: "bg-stone-500" },
};

const ContractDetailOwner = () => {
  const navigate = useNavigate();
  // 🚨 LẤY contractId TỪ URL
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
      toast.error(
        "Không thể thêm khách thuê khi hợp đồng không phải DRAFT hoặc ACTIVE."
      );
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
      toast.error(
        "Không thể chỉnh sửa dịch vụ khi hợp đồng không phải DRAFT hoặc ACTIVE."
      );
    }
  };
  const closeServiceAddDialog = (open) => {
    if (!open) {
      setIsServiceAddDialogOpen(false);
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
        Không tìm thấy Hợp đồng ID: {contractId}.
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 space-y-6">
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
      {/* add service */}
      <ContractServiceAddDialog
        contract={contract}
        houseId={houseID}
        open={isServiceAddDialogOpen}
        onOpenChange={closeServiceAddDialog}
      />
      <Button variant="outline" onClick={backToContractList}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại Danh sách Hợp đồng
      </Button>

      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <FileText className="w-6 h-6" /> Chi tiết Hợp đồng phòng{" "}
          {contract.roomName}
        </h1>

        {/* ACTIONS */}
        <div className="flex gap-2">
          {/* DRAFT ACTIONS */}

          {/* ACTIVE ACTIONS */}
          {contract.status === 2 && <Button variant="outline">Gia hạn</Button>}

          {/* HỦY/THANH LÝ ACTIONS (Placeholder) */}
          {contract.status < 3 && (
            <Button variant="destructive">Thanh lý/Hủy</Button>
          )}
        </div>
      </header>

      {/* --------------------- PHẦN THÔNG TIN CHÍNH --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" /> Thông tin Hợp đồng
            </div>
            {contract.status === 0 && (
              <Button onClick={openContractInforEditDialog}>Sửa</Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-1/4 font-medium">Phòng thuê</TableCell>
                <TableCell>
                  {contract.roomName} (Nhà: {contract.houseName})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Trạng thái</TableCell>
                <TableCell>
                  <ContractStatusBadge contractStatus={contract.status} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Giá thuê</TableCell>
                <TableCell>{formatCurrency(contract.rent)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Giá cọc</TableCell>
                <TableCell>{formatCurrency(contract.deposit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Chu kỳ thanh toán</TableCell>
                <TableCell>{contract.paymentCycle} tháng/lần</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Ngày hiệu lực</TableCell>
                <TableCell>
                  {formatDateTime(contract.startDate).formattedDate} -
                  {formatDateTime(contract.endDate).formattedDate}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  Phạt nếu vi phạm quy tắc
                </TableCell>
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
              <Button onClick={openTenantAddDialog}>Add tenant</Button>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.tenants?.map((tenant, index) => (
                <TableRow key={tenant.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{tenant.fullName}</TableCell>
                  <TableCell>{tenant.phoneNumber}</TableCell>
                  <TableCell>
                    <Checkbox checked={tenant.representative} />
                  </TableCell>
                  <TableCell className="text-right">
                    {(contract.status === 2 || contract.status === 0) && (
                      <Button variant="destructive">Leave</Button>
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
          <Button variant="secondary">Cancel</Button>
        )}
        {contract.status === 0 && <Button variant="">Kích hoạt</Button>}

        {/* ACTIVE ACTIONS */}
        {contract.status === 2 && <Button variant="outline">Gia hạn</Button>}
      </div>
    </div>
  );
};

export default ContractDetailOwner;
