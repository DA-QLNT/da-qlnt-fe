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
const HouseDeleteConfirm = ({ houseId, houseName, open, onOpenChange }) => {
  const [deleteHouse, { isLoading }] = useDeleteHouseMutation();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteHouse(houseId).unwrap();
      toast.success("Delete Success");
      onOpenChange(false);
      navigate("/owner/houses", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Delete Fail");
    }
  };
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            Xác nhận xóa Nhà Trọ
          </AlertDialogTitle>
          <AlertDialogDescription>
            Có chắc chắn muốn xóa vĩnh viễn nhà trọ {houseName} không? Thao tác
            này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan (phòng,
            hợp đồng, v.v.).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy bỏ</AlertDialogCancel>
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
              "Đồng ý xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default HouseDeleteConfirm;
