import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, MapPin } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";
const houses = [
  {
    id: 3,
    name: "Nhà trọ Hoa Sen",
    code: "HN-003",
    province: "Hà Nội",
    district: "Cầu Giấy",
    area: 150.0,
    // ... các trường khác
  },
  {
    id: 4,
    name: "Chung cư mini Tùng",
    code: "HN-004",
    province: "Hà Nội",
    district: "Đống Đa",
    area: 80.0,
  },
  // ... thêm nhiều nhà trọ khác
];
const HouseCard = ({ house }) => {
  return (
    <Card className={" shadow-md group"}>
      <CardHeader className={"space-y-1"}>
        <CardTitle className={"line-clamp-2"}>{house.name}</CardTitle>
        <CardDescription>Code: {house.code}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-x-2 text-primary transition-all duration-200 ease-in-out relative top-12 group-hover:top-0">
          <MapPin />
          <p>
            {house.district} - {house.province}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={
            "w-full transition-all duration-300 ease-in-out opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          }
          asChild
        >
          <NavLink className={"flex items-center gap-2"}>
            <Eye /> View
          </NavLink>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HouseCard;
