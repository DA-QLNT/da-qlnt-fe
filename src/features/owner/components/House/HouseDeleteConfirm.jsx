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
import { useDeleteHouseMutation } from "../../store/houseApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "react-i18next";
const HouseDeleteConfirm = ({ houseId, houseName, open, onOpenChange }) => {
  const { t } = useTranslation("house");
  const [deleteHouse, { isLoading }] = useDeleteHouseMutation();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteHouse(houseId).unwrap();
      toast.success(t("DeleteSuccess"));
      onOpenChange(false);
      navigate("/owner/houses", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(t("DeleteFail"));
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            {t("DeleteHouseConfirm")}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t("Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Spinner />
              </>
            ) : (
              `${t("AgreeDelete")}`
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default HouseDeleteConfirm;
