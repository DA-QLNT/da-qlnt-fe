import React, { useMemo } from "react";
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
  useConfirmServiceUsageByRoomMutation,
} from "../../store/serviceApi";
import { Loader2, CheckCircle2, FileText } from "lucide-react";
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

  const [confirmByRoom] = useConfirmServiceUsageByRoomMutation();
  const [createInvoice] = useCreateInvoiceMutation();
  const [confirmingMonthYear, setConfirmingMonthYear] = React.useState(null);
  const [creatingInvoiceMonthYear, setCreatingInvoiceMonthYear] =
    React.useState(null);

  // Gom nhóm theo Tháng/Năm, giữ nguyên thứ tự từ API trả về
  const groupedUsages = useMemo(() => {
    if (!serviceUsages) return {};
    return serviceUsages.reduce((acc, usage) => {
      const key = `${usage.month}/${usage.year}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(usage);
      return acc;
    }, {});
  }, [serviceUsages]);

  const handleConfirmByRoom = async (month, year) => {
    const key = `${month}/${year}`;
    setConfirmingMonthYear(key);
    try {
      await confirmByRoom({ month, year, roomId }).unwrap();
      toast.success(`${t("ConfirmSuccess")} ${month}/${year}`);
    } catch (error) {
      toast.error(error.data?.message || t("ConfirmFail"));
    } finally {
      setConfirmingMonthYear(null);
    }
  };

  const handleCreateInvoice = async (month, year) => {
    const key = `${month}/${year}`;
    setCreatingInvoiceMonthYear(key);
    try {
      await createInvoice({ roomId, month, year }).unwrap();
      toast.success(t("CreateSuccess"));
    } catch (error) {
      toast.error(error.data?.message || t("CreateFail"));
    } finally {
      setCreatingInvoiceMonthYear(null);
    }
  };

  const getApprovalBadge = (isApproved) => {
    if (isApproved === 1) {
      return <Badge className="bg-green-500">{t("Confirmed")}</Badge>;
    }
    return <Badge variant="secondary">{t("NoConfirmYet")}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {t("ServiceRecord")} - {t("Room")}: {roomName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
              <p className="text-muted-foreground">{t("Loading")}</p>
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-10">
              {t("ErrorLoadingData")}
            </div>
          ) : Object.keys(groupedUsages).length === 0 ? (
            <div className="text-gray-500 text-center py-12 border-2 border-dashed rounded-lg">
              {t("ThisRoomNoServiceRecord")}
            </div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 pb-6">
                {Object.entries(groupedUsages).map(([dateKey, usages]) => {
                  const [m, y] = dateKey.split("/");
                  const isAllApproved = usages.every((u) => u.isApproved === 1);

                  return (
                    <div
                      key={dateKey}
                      className="border rounded-xl bg-card shadow-sm overflow-hidden"
                    >
                      <div className="bg-muted/50 px-4 py-3 border-b flex justify-between items-center">
                        <span className="font-semibold text-lg">
                          {t("Month")} {dateKey}
                        </span>
                        <div className="flex gap-2">
                          {!isAllApproved && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 h-8"
                              onClick={() => handleConfirmByRoom(m, y)}
                              disabled={confirmingMonthYear === `${m}/${y}`}
                            >
                              {confirmingMonthYear === `${m}/${y}` ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              {t("Confirm")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => handleCreateInvoice(m, y)}
                            disabled={creatingInvoiceMonthYear === `${m}/${y}`}
                          >
                            {creatingInvoiceMonthYear === `${m}/${y}` ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <FileText className="h-3 w-3 mr-1" />
                            )}
                            {t("CreateInvoice")}
                          </Button>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow className="bg-transparent hover:bg-transparent">
                            <TableHead>{t("ServiceName")}</TableHead>
                            <TableHead className="text-right">
                              {t("FirstIndex")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("LastIndex")}
                            </TableHead>
                            <TableHead className="text-right">
                              {t("Consumed")}
                            </TableHead>
                            <TableHead className="text-center">
                              {t("Status")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {usages.map((usage) => {
                            const consumption =
                              usage.currentReading && usage.previousReading
                                ? (
                                    usage.currentReading - usage.previousReading
                                  ).toFixed(2)
                                : "0";
                            return (
                              <TableRow
                                key={usage.id}
                                className="hover:bg-muted/30"
                              >
                                <TableCell className="font-medium">
                                  {usage.serviceName}
                                </TableCell>
                                <TableCell className="text-right">
                                  {usage.previousReading ?? "N/A"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {usage.currentReading ?? "N/A"}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-primary">
                                  {consumption}
                                </TableCell>
                                <TableCell className="text-center">
                                  {getApprovalBadge(usage.isApproved)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-muted/20">
          <DialogClose asChild>
            <Button variant="secondary">{t("Close")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceUsageViewDialog;
