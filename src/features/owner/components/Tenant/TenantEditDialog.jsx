import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";
import { useGetTenantsByIdQuery } from "../../store/tenantApi";
import TenantEditForm from "./TenantEditForm";

const TenantEditDialog = ({ tenantId, open, onOpenChange }) => {
  const { t } = useTranslation("usercontent");
  const {
    data: tenant,
    isLoading,
    isFetching,
    isError,
  } = useGetTenantsByIdQuery(tenantId, {
    skip: !tenantId || !open,
  });
  const loading = isLoading || isFetching;
  const handleOpenChange = (open) => {
    if (!open) {
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
            <Spinner className={"size-10 text-primary"} />
          </div>
        ) : tenant ? (
          <TenantEditForm
            tenant={tenant}
            onFormSubmitSuccess={handleOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TenantEditDialog;
