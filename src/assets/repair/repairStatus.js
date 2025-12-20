export const REPAIR_STATUS_MAP = {
  // 0: Khởi tạo/Bản nháp/Chờ xử lý
  0: {
    label: "Draft",
    color: "bg-gray-600 hover:bg-gray-700 text-white",
  },
  1: {
    label: "Sent",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  2: {
    label: "Received",
    color: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  // 1: Đang thực hiện
  3: {
    label: "Completed",
    color: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  // 2: Đã hoàn thành
  4: {
    label: "Canceled",
    color: "bg-green-600 hover:bg-green-700 text-white",
  },
};
