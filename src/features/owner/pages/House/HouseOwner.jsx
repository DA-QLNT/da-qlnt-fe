import React from "react";
import HouseCard from "../../components/HouseCard";
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
// const houses = [
//   {
//     id: 3,
//     name: "Nhà trọ Hoa Sen",
//     code: "HN-003",
//     province: "Hà Nội",
//     district: "Cầu Giấy",
//     area: 150.0,
//     // ... các trường khác
//   },
//   {
//     id: 4,
//     name: "Chung cư mini Tùng",
//     code: "HN-004",
//     province: "Hà Nội",
//     district: "Đống Đa",
//     area: 80.0,
//   },
//   // ... thêm nhiều nhà trọ khác
// ];
const HouseOwner = () => {
  const { ownerId, isLoadingMe } = useAuth();
  console.log(ownerId);
  
  const { data, isLoading, isFetching, isError } = useGetHousesByOwnerIdQuery(
    {
      ownerId: ownerId,
      page: 0,
      size: 10,
    },
    {
      skip: !ownerId || isLoadingMe,
    }
  );
  const houses = data?.houses || [];
  console.log(houses);
  
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi tải danh sách nhà trọ.
      </div>
    );
  }
  return (
    <div className="px-4 lg:px-6">
      {(isLoading || isFetching) && (
        <div className="text-center p-8">
          <Spinner className="size-10" /> Đang tải danh sách nhà...
        </div>
      )}

      {!isLoading && houses.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          Anh chưa có nhà trọ nào được đăng ký.
        </div>
      )}
      <div className="flex flex-col gap-8">
        <div className="text-end">
            <Button><Plus/>Add House</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {houses.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HouseOwner;
