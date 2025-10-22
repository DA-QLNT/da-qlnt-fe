import React from "react";
import { useGetUserByIdQuery } from "../../store/userApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";
import UserEditForm from "./UserEditForm";

const UserEditDialog = ({ userId, open, onOpenChange }) => {
  const { t } = useTranslation("usercontent");
  const {
    data: user,
    isLoading,
    isFetching,
    isError,
  } = useGetUserByIdQuery(userId, {
    skip: !userId || !open,
  });
  const loading = isLoading || isFetching;
  const handleOpenChange = (newOpenState) => {
    if (!newOpenState) {
      onOpenChange(false);
    } else {
      onOpenChange(true);
    }
  };
  if (isError) {
    return <span>{t("ErrorLoadingData")}</span>;
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("EditUser")}</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center">
            <Spinner className={'size-10'}/>
          </div>
        ) : user ? (
          <UserEditForm user={user} onFormSubmitSuccess={handleOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default UserEditDialog;
