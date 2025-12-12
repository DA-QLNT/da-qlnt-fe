import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueReportTab from "../../components/Report/RevenueReportTab";
import RoomReportTab from "../../components/Report/RoomReportTab";
import InvoiceReportTab from "../../components/Report/InvoiceReportTab";

const StatisticOwner = () => {
  return (
    <div className="px-4 lg:px-6">
      <Tabs defaultValue="Revenue" className={"w-full "}>
        <TabsList>
          <TabsTrigger value="Revenue">Doanh thu</TabsTrigger>
          <TabsTrigger value="Room">Phòng</TabsTrigger>
          <TabsTrigger value="Invoice">Hóa đơn</TabsTrigger>
        </TabsList>
        {/* Dịch vụ đã có của nhà */}
        <TabsContent value="Revenue">
          <RevenueReportTab />
        </TabsContent>
        <TabsContent value="Room">
          <RoomReportTab />
        </TabsContent>
        <TabsContent value="Invoice">
          <InvoiceReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticOwner;
