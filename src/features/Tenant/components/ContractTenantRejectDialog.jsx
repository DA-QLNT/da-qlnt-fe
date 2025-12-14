import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { XCircle, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import React from "react";
import { useRejectTenantContractMutation } from "../store/contractApi";

// Schema chỉ cần trường note
const RejectSchema = z.object({
  note: z.string().min(10, "Vui lòng ghi rõ lý do từ chối (ít nhất 10 ký tự)."),
});

export default function ContractTenantRejectDialog({
  contractId,
  open,
  onOpenChange,
}) {
  const [rejectContract, { isLoading }] = useRejectTenantContractMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(RejectSchema),
    defaultValues: { note: "" },
  });

  const handleReject = async (data) => {
    const toastId = toast.loading(
      `Đang xử lý từ chối hợp đồng #${contractId}...`
    );

    try {
      //  GỌI MUTATION VỚI BODY CHỨA NOTE
      await rejectContract({ contractId, note: data.note }).unwrap();
      toast.success("Đã từ chối hợp đồng. Chủ trọ đã nhận được thông báo.", {
        id: toastId,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || "Từ chối thất bại.", { id: toastId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="w-6 h-6" />
            Từ Chối Hợp Đồng #{contractId}
          </DialogTitle>
          <DialogDescription>
            Vui lòng ghi rõ **lý do từ chối** để Chủ trọ có thể xem xét.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleReject)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="note">Lý do Từ chối (*)</FieldLabel>
              <Textarea {...register("note")} disabled={isLoading} rows={3} />
              <FieldError>{errors.note?.message}</FieldError>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !isValid}
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Gửi Từ Chối"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
