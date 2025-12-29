import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("contractinvoice");
  if (!contract) return null;

  return (
    <div className="space-y-6 w-full">
      {/* THÔNG TIN CHUNG */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5" /> {t("ContractTerms")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="w-1/3 font-medium">
                  {t("Status")}
                </TableCell>
                <TableCell>
                  <ContractStatusBadge contractStatus={contract.status} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("HouseRoom")}</TableCell>
                <TableCell>
                  {contract.roomName} ({contract.houseName})
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Owner")}</TableCell>
                <TableCell>{contract.ownerName}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Duration")}</TableCell>
                <TableCell>
                  {formatDateTime(contract.startDate).formattedDate} -{" "}
                  {formatDateTime(contract.endDate).formattedDate}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("RentPrice")}</TableCell>
                <TableCell>
                  {formatCurrency(contract.rent)} {contract.paymentCycle}{" "}
                  Tháng/Lần
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">{t("Deposit")}</TableCell>
                <TableCell>{formatCurrency(contract.deposit)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">
                  {t("PenaltyViolation")}
                </TableCell>
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
            {t("AppliedServicesList")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Service")}</TableHead>
                <TableHead>{t("PricePerUnit")}</TableHead>
                <TableHead>{t("CalculationMethod")}</TableHead>
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
            <User className="h-5 w-5" /> {t("TenantsInContract")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("FullName")}</TableHead>
                <TableHead>{t("PhoneNumber")}</TableHead>
                <TableHead>{t("Role")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.tenants?.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.fullName}</TableCell>
                  <TableCell>{tenant.phoneNumber}</TableCell>
                  <TableCell>
                    {tenant.representative ? `✅ ${t("Representative")}` : "-"}
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
