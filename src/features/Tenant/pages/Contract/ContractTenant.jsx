import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Clock, History } from "lucide-react";
import ContractCurrent from "../../components/Contract/ContractCurrent";
import ContractPendingRenewalTab from "../../components/Contract/ContractPendingRenewalTab";
import ContractHistoryTab from "../../components/Contract/ContractHistoryTab"; // Component anh đã làm ở bước trước
import { Card } from "@/components/ui/card";

const ContractTenant = () => {
  const { t } = useTranslation("contractinvoice");
  return (
    <div className="px-4 lg:px-6 space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold">{t("ContractManagementPage")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("ContractManagementDescription")}
        </p>
      </header>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="current" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> {t("ActiveTab")}
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> {t("PendingConfirmationTab")}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" /> {t("HistoryTab")}
          </TabsTrigger>
        </TabsList>

        <Card className="mt-6 border-none shadow-none bg-transparent">
          <TabsContent value="current">
            <ContractCurrent />
          </TabsContent>

          <TabsContent value="pending">
            <ContractPendingRenewalTab />
          </TabsContent>

          <TabsContent value="history">
            <ContractHistoryTab />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default ContractTenant;
