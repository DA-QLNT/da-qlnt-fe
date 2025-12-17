// src/features/service/components/ServiceUsageViewDialog.jsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useCreateInvoiceMutation,
  useGetServiceUsagesByRoomIdQuery,
} from "../../store/serviceApi";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ServiceUsageViewDialog = ({ open, onOpenChange, roomId, roomName }) => {
  const { t } = useTranslation("service");
  const {
    data: serviceUsages,
    isLoading,
    isError,
  } = useGetServiceUsagesByRoomIdQuery(roomId, {
    skip: !roomId || !open,
  });

  const getApprovalBadge = (isApproved) => {
    if (isApproved === 1) {
      return <Badge className="bg-green-500">{t("Confirmed")}</Badge>;
    }
    return <Badge variant="secondary">{t("NoConfirmYet")}</Badge>;
  };

  // create invoice
  const [createInvoice, { isLoading: loadingCreatInvoice }] =
    useCreateInvoiceMutation();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const handleCreate = async () => {
    const toastId = toast.loading(
      `${t("CreatingInvoice")} ${currentMonth}/${currentYear}...`
    );
    try {
      await createInvoice({
        roomId,
        month: currentMonth,
        year: currentYear,
      }).unwrap();

      toast.success(t("CreateSuccess"));
      onOpenChange(false);
    } catch (error) {
      toast.error(error.data?.message || t("CreateFail"), {
        id: toastId,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
    w-full
    sm:max-w-3xl
    overflow-auto
  "
      >
        <DialogHeader>
          <DialogTitle>
            {t("ServiceRecord")} {t("Room")}: {roomName}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              {t("Loading")}
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center">
              {t("ErrorLoadingData")}
            </div>
          ) : !serviceUsages || serviceUsages.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {t("ThisRoomNoServiceRecord")}
            </div>
          ) : (
            <ScrollArea className="h-80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("ServiceName")}:</TableHead>
                    <TableHead>{t("Month/Year")}</TableHead>
                    <TableHead className="text-right">Chỉ số đầu</TableHead>
                    <TableHead className="text-right">Chỉ số cuối</TableHead>
                    <TableHead className="text-right">
                      {t("Consumed")}
                    </TableHead>
                    <TableHead>{t("Status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceUsages.map((usage) => {
                    const consumption =
                      usage.currentReading && usage.previousReading
                        ? (
                            usage.currentReading - usage.previousReading
                          ).toFixed(2)
                        : "N/A";
                    return (
                      <TableRow key={usage.id}>
                        <TableCell className="font-medium">
                          {usage.serviceName}
                        </TableCell>
                        <TableCell>
                          {usage.month}/{usage.year}
                        </TableCell>
                        <TableCell className="text-right">
                          {usage.previousReading ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {usage.currentReading ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {consumption}
                        </TableCell>
                        <TableCell>
                          {getApprovalBadge(usage.isApproved)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("Close")}</Button>
          </DialogClose>
          <Button
            onClick={handleCreate}
            disabled={loadingCreatInvoice}
            className="bg-primary hover:bg-primary/90"
          >
            {loadingCreatInvoice ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                {t("CreatingInvoice")}
              </>
            ) : (
              t("CreateInvoice")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceUsageViewDialog;
