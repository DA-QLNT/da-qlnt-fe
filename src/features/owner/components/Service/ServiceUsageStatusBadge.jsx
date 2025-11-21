// src/components/Service/ServiceUsageStatusBadge.jsx (Ví dụ)
import { Badge } from "@/components/ui/badge";
import React from "react";

const ServiceUsageStatusBadge = ({ status }) => {
  switch (status) {
    case 0:
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          Chờ xác nhận
        </Badge>
      );
    case 1:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Đã xác nhận
        </Badge>
      );
    default:
      return <Badge variant="outline">Không rõ</Badge>;
  }
};

export default ServiceUsageStatusBadge;
