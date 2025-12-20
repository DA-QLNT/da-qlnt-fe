export const REPAIR_STATUS_MAP = {
  // 0: Khởi tạo/Bản nháp
  0: {
    label: "Draft",
    color: "bg-slate-500 hover:bg-slate-600 text-white border-none",
  },
  // 1: Đã gửi yêu cầu
  1: {
    label: "Sent",
    color: "bg-sky-600 hover:bg-sky-700 text-white border-none",
  },
  // 2: Đã tiếp nhận (Đang xử lý)
  2: {
    label: "Received",
    color: "bg-amber-500 hover:bg-amber-600 text-white border-none",
  },
  // 3: Đã hoàn thành (Success)
  3: {
    label: "Completed",
    color: "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
  },
  // 4: Đã hủy (Error/Stop)
  4: {
    label: "Canceled",
    color: "bg-rose-600 hover:bg-rose-700 text-white border-none",
  },
};
