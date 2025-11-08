import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetRoomByIdQuery } from "../../store/roomApi";
import { Spinner } from "@/components/ui/spinner";
import RoomEditForm from "./RoomEditForm";
import { useTranslation } from "react-i18next";
const RoomEditDialog = ({ roomId, open, onOpenChange }) => {
  const { t } = useTranslation("house");
  const {
    data: roomData,
    isLoading,
    isFetching,
    isError,
  } = useGetRoomByIdQuery(roomId, {
    skip: !roomId,
  });
  const handleSuccess = () => {
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"m:max-w-2xl md:max-w-4xl"}>
        <DialogHeader>
          <DialogTitle>{t("EditRoom")}</DialogTitle>
        </DialogHeader>
        {isLoading || isFetching ? (
          <Spinner className={"size-10 mx-auto"} />
        ) : roomData ? (
          <RoomEditForm
            initialData={roomData}
            onFormSubmitSuccess={handleSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default RoomEditDialog;
