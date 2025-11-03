import React, { useState } from "react";
import HouseCard from "../../components/House/HouseCard";
import { useAuth } from "@/features/auth";
import { useGetHousesByOwnerIdQuery } from "../../store/houseApi";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import HouseAddDialog from "../../components/House/HouseAddDialog";

const HouseOwner = () => {
  const { ownerId, isLoadingMe } = useAuth();
  console.log(ownerId);
  // add house
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 0;

  if (isLoading || isFetching) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Spinner className="size-20 text-primary" />
      </div>
    );
  } else if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Lỗi tải danh sách nhà trọ.
      </div>
    );
  } else if (!isLoading && houses.length === 0) {
    <div className="text-center p-8 text-muted-foreground">
      Anh chưa có nhà trọ nào được đăng ký.
    </div>;
  }

  return (
    <div className="px-4 lg:px-6">
      <HouseAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      <div className="flex flex-col gap-8">
        <div className="text-end">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus />
            Add House
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {houses.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HouseOwner;
