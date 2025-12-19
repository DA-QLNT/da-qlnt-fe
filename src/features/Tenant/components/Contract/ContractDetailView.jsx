import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Info, DollarSign, User } from "lucide-react";
import { formatCurrency } from "@/lib/format/currencyFormat";
import { formatDateTime } from "@/lib/format/dateTimeFormat";
import ContractStatusBadge from "../../../owner/components/Contract/ContractStatusBadge";
import ServiceTypeBadge from "../../../owner/components/Service/ServiceTypeBadge";

const ContractDetailView = ({ contract }) => {
  if (!contract) return null;

  return (
    <div className="space-y-6 w-full">
      {/* THÔNG TIN CHUNG */}
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
                <TableCell className="w-1/3 font-medium">Trạng thái</TableCell>
                <TableCell>
                  <ContractStatusBadge contractStatus={contract.status} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Nhà / Phòng</TableCell>
                <TableCell>
                  {contract.roomName} ({contract.houseName})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Chủ trọ</TableCell>
                <TableCell>{contract.ownerName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Thời hạn</TableCell>
                <TableCell>
                  {formatDateTime(contract.startDate).formattedDate} -{" "}
                  {formatDateTime(contract.endDate).formattedDate}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Giá thuê</TableCell>
                <TableCell>
                  {formatCurrency(contract.rent)} ({contract.paymentCycle}{" "}
                  {t("Month/Time")})
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

      {/* DỊCH VỤ */}
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

      {/* KHÁCH THUÊ */}
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
                <TableHead>Vai trò</TableHead>
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
    </div>
  );
};

export default ContractDetailView;
