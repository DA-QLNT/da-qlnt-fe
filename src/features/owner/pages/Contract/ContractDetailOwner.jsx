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
} from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContractStatusBadge from "../../components/Contract/ContractStatusBadge";
import ServiceTypeBadge from "../../components/Service/ServiceTypeBadge";
import ContractInforEditDialog from "../../components/Contract/ContractInforEditDialog";

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

  //   update
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const openEditDialog = () => {
    setIsEditDialogOpen((prev) => !prev);
  };

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

  const formattedStartDate = formatDateTime(contract.startDate).formattedDate;
  const formattedEndDate = formatDateTime(contract.endDate).formattedDate;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <ContractInforEditDialog
        contractId={id}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
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
              <Button onClick={openEditDialog}>Sửa</Button>
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
                  {formattedStartDate} - {formattedEndDate}
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
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" /> Danh sách Khách thuê (
            {contract.tenants?.length || 0})
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
                    {tenant.representative ? <Check color="green" /> : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    {contract.status === 2 && (
                      <Button variant="destructive" size="sm">
                        Khách rời
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
          <CardTitle className="text-xl flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Dịch vụ áp dụng (
            {contract.services?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Giá/Chu kỳ</TableHead>
                <TableHead>Cách tính</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* ACTIONS */}
      <div className="flex justify-end gap-2">
        {/* DRAFT ACTIONS */}
        {contract.status === 0 && (
          <Button variant="secondary">Kích hoạt</Button>
        )}

        {/* ACTIVE ACTIONS */}
        {contract.status === 2 && <Button variant="outline">Gia hạn</Button>}

        {/* HỦY/THANH LÝ ACTIONS (Placeholder) */}
        {contract.status < 3 && (
          <Button variant="destructive">Thanh lý/Hủy</Button>
        )}
      </div>
    </div>
  );
};

export default ContractDetailOwner;
