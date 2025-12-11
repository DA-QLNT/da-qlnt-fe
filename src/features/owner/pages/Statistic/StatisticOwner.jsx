import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueReportTab from "../../components/Report/RevenueReportTab";

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
        {/* Danh sách dịch vụ */}
        <TabsContent value="Room"></TabsContent>
        <TabsContent value="Invoice"></TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticOwner;
