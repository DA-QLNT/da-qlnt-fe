import React from "react";
import { useGetHouseByIdQuery } from "../../store/houseApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import HouseForm from "./HouseForm";

const HouseEditDialog = ({ houseId, open, onOpenChange }) => {
  const {
    data: house,
    isLoading,
    isFetching,
    isError,
  } = useGetHouseByIdQuery(houseId, {
    skip: !houseId,
  });
  const loading = isLoading || isFetching;
  const handleOpenChange = (newOpenState) => {
    if (!newOpenState) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };
  const handleSuccess = () => {
    onOpenChange(false);
  };
  if (isError) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md text-center text-red-500">
          Lỗi tải chi tiết nhà.
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={"m:max-w-2xl md:max-w-4xl"}>
        <DialogHeader>
          <DialogTitle>Edit House: {house?.name || house?.code}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <Spinner className={"size-10"} />
        ) : house ? (
          <HouseForm
            mode="edit"
            initialData={house}
            onFormSubmitSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default HouseEditDialog;
