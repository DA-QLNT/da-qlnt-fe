export const REPAIR_STATUS_MAP = {
  // 0: Khởi tạo/Bản nháp/Chờ xử lý
  0: {
    label: "HandelWait",
    color: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  // 1: Đang thực hiện
  1: {
    label: "Pending",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  // 2: Đã hoàn thành
  2: {
    label: "Completed",
    color: "bg-green-600 hover:bg-green-700 text-white",
  },
};
