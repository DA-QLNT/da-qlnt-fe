import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useLeaveTenantMutation,
  useSetNewRepresentativeMutation,
} from "../../store/contractApi";
import { AlertTriangle, UserMinus, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function TenantLeaveDialog({
  contractId,
  tenant,
  open,
  onOpenChange,
}) {
  const { t } = useTranslation("contractinvoice");
  const [leaveTenant] = useLeaveTenantMutation();
  const [setNewRepresentative] = useSetNewRepresentativeMutation();
  const [step, setStep] = useState("SUCCESS"); // SUCCESS | SELECT_NEW_REPRESENTATIVE | REQUIRE_TERMINATE_CONTRACT
  const [newTenants, setNewTenants] = useState([]); // Danh sách khách thuê còn lại để chọn đại diện
  const [selectedRepId, setSelectedRepId] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const isRepresentative = tenant?.representative;

  const handleLeave = async () => {
    setIsMutating(true);
    const toastId = toast.loading(
      `${t("Processing")} ${tenant.fullName} ${t("LeaveRoom")}...`
    );

    try {
      const result = await leaveTenant({
        contractId,
        tenantId: tenant.id,
      }).unwrap();
      const serverStatus = result.result.status;

      if (serverStatus === "SUCCESS") {
        toast.success(
          `${t("Tenants")} ${tenant.fullName} đã ${t("LeaveRoom")} thành công.`,
          { id: toastId }
        );
        onOpenChange(false);
      } else if (serverStatus === "REQUIRE_TERMINATE_CONTRACT") {
        toast.info(t("RequireTerminateContractToast"), { id: toastId });
        setStep("REQUIRE_TERMINATE_CONTRACT"); // Chuyển sang bước yêu cầu thanh lý
      } else if (serverStatus === "SELECT_NEW_REPRESENTATIVE") {
        toast.info(t("PleaseSelectNewRepresentative"), { id: toastId });
        setNewTenants(result.result.tenants);
        setStep("SELECT_NEW_REPRESENTATIVE"); // Chuyển sang bước chọn đại diện
      }
    } catch (error) {
      toast.error(error.data?.message || t("ErrorProcessingRequest"), {
        id: toastId,
      });
    } finally {
      setIsMutating(false);
    }
  };

  const handleSetRepresentative = async () => {
    if (!selectedRepId) return toast.error(t("PleaseSelectNewRepresentative"));
    setIsMutating(true);
    const toastId = toast.loading(t("AssigningNewRepresentative"));

    try {
      await setNewRepresentative({
        contractId,
        newRepresentativeId: selectedRepId,
      }).unwrap();
      toast.success(t("AssignNewRepresentativeSuccess"), { id: toastId });
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      toast.error(error.data?.message || t("ErrorAssignRepresentative"), {
        id: toastId,
      });
    } finally {
      setIsMutating(false);
    }
  };

  //  RESET STATE KHI DIALOG ĐÓNG
  const handleOpenChange = (open) => {
    if (!open) {
      setStep("SUCCESS");
      setNewTenants([]);
      setSelectedRepId(null);
    }
    onOpenChange(open);
  };

  // --- RENDER CONTENT DYNAMIC ---

  // 1. CONFIRMATION STEP
  const renderConfirmStep = () => (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
          <UserMinus className="w-6 h-6" /> {t("ConfirmTenantLeave")}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {t("TenantLeaveMessage")} {tenant.fullName} (
          {isRepresentative ? t("Representative") : t("Guest")}){" "}
          {t("LeaveContract")}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isMutating}>
          {t("Cancel")}
        </AlertDialogCancel>
        <Button
          onClick={handleLeave}
          disabled={isMutating}
          variant="destructive"
        >
          {isMutating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            t("ConfirmLeave")
          )}
        </Button>
      </AlertDialogFooter>
    </>
  );

  // 2. SELECT REPRESENTATIVE STEP
  const renderSelectRepStep = () => (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <User className="w-6 h-6" /> {t("SelectNewRepresentative")}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {t("Tenants")} {tenant.fullName} {t("SelectNewRepMessage")}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <RadioGroup onValueChange={setSelectedRepId} className="my-4">
        {newTenants.map((rep) => (
          <div
            key={rep.id}
            className="flex items-center space-x-2 border p-3 rounded-md"
          >
            <RadioGroupItem value={rep.id.toString()} id={`rep-${rep.id}`} />
            <Label htmlFor={`rep-${rep.id}`}>
              {rep.fullName} ({t("PhoneNumber")}: {rep.phoneNumber || "N/A"})
            </Label>
          </div>
        ))}
      </RadioGroup>

      <AlertDialogFooter>
        <Button
          onClick={handleSetRepresentative}
          disabled={isMutating || !selectedRepId}
        >
          {isMutating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            t("AssignNewRepresentative")
          )}
        </Button>
      </AlertDialogFooter>
    </>
  );

  // 3. TERMINATE REQUIRED STEP
  const renderTerminateRequiredStep = () => (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
          ⚠️ {t("RequireTerminateContract")}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {t("Tenants")} {tenant.fullName} {t("TerminateRequiredMessage")}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {t("CloseButton")}
        </Button>
        {/*  Nút chuyển sang luồng thanh lý sẽ được tích hợp ở đây sau */}
      </AlertDialogFooter>
    </>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case "SELECT_NEW_REPRESENTATIVE":
        return renderSelectRepStep();
      case "REQUIRE_TERMINATE_CONTRACT":
        return renderTerminateRequiredStep();
      default:
        return renderConfirmStep();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        className={
          step === "SELECT_NEW_REPRESENTATIVE" ? "sm:max-w-xl" : "sm:max-w-md"
        }
      >
        {renderCurrentStep()}
      </AlertDialogContent>
    </AlertDialog>
  );
}
