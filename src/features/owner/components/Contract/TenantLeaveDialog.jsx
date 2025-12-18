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

export default function TenantLeaveDialog({
  contractId,
  tenant,
  open,
  onOpenChange,
}) {
  const [leaveTenant] = useLeaveTenantMutation();
  const [setNewRepresentative] = useSetNewRepresentativeMutation();
  const [step, setStep] = useState("SUCCESS"); // SUCCESS | SELECT_NEW_REPRESENTATIVE | REQUIRE_TERMINATE_CONTRACT
  const [newTenants, setNewTenants] = useState([]); // Danh sách khách thuê còn lại để chọn đại diện
  const [selectedRepId, setSelectedRepId] = useState(null);
  const [isMutating, setIsMutating] = useState(false);

  const isRepresentative = tenant?.representative;

  const handleLeave = async () => {
    setIsMutating(true);
    const toastId = toast.loading(`Đang xử lý ${tenant.fullName} rời phòng...`);

    try {
      const result = await leaveTenant({
        contractId,
        tenantId: tenant.id,
      }).unwrap();
      const serverStatus = result.result.status;

      if (serverStatus === "SUCCESS") {
        toast.success(
          `Khách thuê ${tenant.fullName} đã rời phòng thành công.`,
          { id: toastId }
        );
        onOpenChange(false);
      } else if (serverStatus === "REQUIRE_TERMINATE_CONTRACT") {
        toast.info("Yêu cầu thanh lý hợp đồng.", { id: toastId });
        setStep("REQUIRE_TERMINATE_CONTRACT"); // Chuyển sang bước yêu cầu thanh lý
      } else if (serverStatus === "SELECT_NEW_REPRESENTATIVE") {
        toast.info("Vui lòng chọn người đại diện mới.", { id: toastId });
        setNewTenants(result.result.tenants);
        setStep("SELECT_NEW_REPRESENTATIVE"); // Chuyển sang bước chọn đại diện
      }
    } catch (error) {
      toast.error(error.data?.message || "Lỗi xử lý yêu cầu.", { id: toastId });
    } finally {
      setIsMutating(false);
    }
  };

  const handleSetRepresentative = async () => {
    if (!selectedRepId)
      return toast.error("Vui lòng chọn một người đại diện mới.");
    setIsMutating(true);
    const toastId = toast.loading(`Đang gán đại diện mới...`);

    try {
      await setNewRepresentative({
        contractId,
        newRepresentativeId: selectedRepId,
      }).unwrap();
      toast.success("Gán đại diện mới thành công!", { id: toastId });
      onOpenChange(false); // Đóng dialog
    } catch (error) {
      toast.error(error.data?.message || "Lỗi gán đại diện.", { id: toastId });
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
          <UserMinus className="w-6 h-6" /> Xác nhận Khách rời phòng
        </AlertDialogTitle>
        <AlertDialogDescription>
          Anh có chắc chắn muốn cho khách thuê {tenant.fullName} (
          {isRepresentative ? "Đại diện" : "Khách"}) rời khỏi hợp đồng này
          không?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isMutating}>Hủy bỏ</AlertDialogCancel>
        <Button
          onClick={handleLeave}
          disabled={isMutating}
          variant="destructive"
        >
          {isMutating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Đồng ý rời"
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
          <User className="w-6 h-6" /> Chọn Người Đại Diện Mới
        </AlertDialogTitle>
        <AlertDialogDescription>
          Khách {tenant.fullName} là người đại diện cũ. Vui lòng chọn một trong
          số khách thuê còn lại làm đại diện mới.
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
              {rep.fullName} (SĐT: {rep.phoneNumber || "N/A"})
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
            "Gán Đại Diện Mới"
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
          ⚠️ Yêu cầu Thanh lý Hợp đồng
        </AlertDialogTitle>
        <AlertDialogDescription>
          Khách {tenant.fullName} là người đại diện duy nhất. Không thể rời
          phòng mà không thanh lý hợp đồng. Vui lòng thực hiện thao tác Thanh lý
          Hợp đồng.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
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
