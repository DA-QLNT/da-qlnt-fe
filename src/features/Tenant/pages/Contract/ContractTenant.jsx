import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetCurrentTenantContractQuery } from "../../store/contractApi";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  FileText,
  Info,
  DollarSign,
  User,
  Check,
  XCircle,
  CheckCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
// Component Badge được dùng chung
import ContractStatusBadge from "../../../owner/components/Contract/ContractStatusBadge";
import ServiceTypeBadge from "../../../owner/components/Service/ServiceTypeBadge";
// Dialogs của Tenant
import ContractTenantConfirmDialog from "./../../components/ContractTenantConfirmDialog";
import ContractTenantRejectDialog from "./../../components/ContractTenantRejectDialog";
import { useNavigate } from "react-router-dom";

const ContractTenant = () => {
  const { t } = useTranslation("house");
  const navigate = useNavigate();

  // FETCH HỢP ĐỒNG MỚI NHẤT
  const {
    data: contract,
    isLoading,
    isFetching,
    isError,
  } = useGetCurrentTenantContractQuery();
  const loading = isLoading || isFetching;
  const contractStatus = contract?.status;

  // States cho Dialog xác nhận
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const openConfirmDialog = () => setIsConfirmDialogOpen(true);
  const openRejectDialog = () => setIsRejectDialogOpen(true);

  // Trạng thái cần hành động (DRAFT=0, TENANT_REJECTED=1, TENANT_CONFIRMED=2)
  // Chỉ khi status là DRAFT (0) hoặc TENANT_REJECTED (1) thì tenant mới có quyền xác nhận lại.
  const isActionRequired = contractStatus === 0 || contractStatus === 1;

  // ==== UI RENDER ====

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-20" />
      </div>
    );
  }

  if (isError || !contract) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Anh chưa có hợp đồng thuê nhà nào đang hoạt động.
      </div>
    );
  }

  const formattedStartDate = formatDateTime(contract.startDate).formattedDate;
  const formattedEndDate = formatDateTime(contract.endDate).formattedDate;

  return (
    <div className="px-4 lg:px-6 space-y-6">
      {/*  DIALOGS */}
      <ContractTenantConfirmDialog
        contract={contract}
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      />
      <ContractTenantRejectDialog
        contractId={contract.id}
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      />

      <header className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <FileText className="w-6 h-6" /> Hợp đồng thuê hiện tại
        </h1>

        {/*  ACTIONS CHỦ YẾU */}
        {isActionRequired && (
          <div className="flex gap-3">
            <Button variant="destructive" onClick={openRejectDialog}>
              <XCircle className="w-4 h-4 mr-2" /> Từ Chối
            </Button>
            <Button onClick={openConfirmDialog}>
              <CheckCheck className="w-4 h-4 mr-2" /> Xác Nhận Hợp Đồng
            </Button>
          </div>
        )}
      </header>

      {/* --------------------- THÔNG TIN CHUNG --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5" /> Điều khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-1/4 font-medium">Trạng thái</TableCell>
                <TableCell>
                  <ContractStatusBadge contractStatus={contract.status} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="w-1/4 font-medium">Nhà thuê</TableCell>
                <TableCell>
                  {contract.roomName} (Nhà: {contract.houseName})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Chủ trọ</TableCell>
                <TableCell>{contract.ownerName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Ngày hiệu lực</TableCell>
                <TableCell>
                  {formattedStartDate} - {formattedEndDate}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Giá thuê</TableCell>
                <TableCell>
                  {formatCurrency(contract.rent)} ({contract.paymentCycle}{" "}
                  tháng/lần)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Tiền cọc</TableCell>
                <TableCell>{formatCurrency(contract.deposit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Phạt vi phạm</TableCell>
                <TableCell>{formatCurrency(contract.penaltyAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --------------------- DỊCH VỤ --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            Dịch vụ áp dụng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dịch vụ</TableHead>
                <TableHead>Giá/ĐV</TableHead>
                <TableHead>Cách tính</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.services?.map((service) => (
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

      {/* --------------------- KHÁCH THUÊ --------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5" /> Khách thuê phòng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Họ Tên</TableHead>
                <TableHead>SĐT</TableHead>
                <TableHead>Đại diện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.tenants?.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.fullName}</TableCell>
                  <TableCell>{tenant.phoneNumber}</TableCell>
                  <TableCell>
                    {tenant.representative ? "✅ Đại diện" : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --------------------- ACTIONS FOOTER --------------------- */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => navigate("/tenant/contracts/history")}
        >
          Lịch sử hợp đồng
        </Button>
        {contractStatus === 0 && (
          <Button onClick={openConfirmDialog} variant="default">
            <CheckCheck className="w-4 h-4 mr-2" /> Xác nhận (DRAFT)
          </Button>
        )}

        {contractStatus === 1 && (
          <Button onClick={openConfirmDialog} variant="default">
            <CheckCheck className="w-4 h-4 mr-2" /> Xác nhận lại (PENDING)
          </Button>
        )}

        {(contractStatus === 0 || contractStatus === 1) && (
          <Button onClick={openRejectDialog} variant="destructive">
            <XCircle className="w-4 h-4 mr-2" /> Từ Chối
          </Button>
        )}

        {contractStatus === 2 && (
          <Button variant="outline" disabled>
            ACTIVE - Đã xác nhận
          </Button>
        )}
      </div>
    </div>
  );
};

export default ContractTenant;
