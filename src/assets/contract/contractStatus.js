export const CONTRACT_STATUS_MAP = {
  // Mã trạng thái mới:

  // 0: DRAFT - Bản nháp
  0: { label: "DRAFT", color: "bg-gray-400 hover:bg-gray-500 text-white" },

  // 1: TENANT_REJECTED - Khách từ chối (Chủ có thể sửa)
  1: {
    label: "TENANT REJECTED",
    color: "bg-red-500 hover:bg-red-600 text-white",
  },

  // 2: TENANT_CONFIRMED - Khách đã xác nhận (Chờ chủ hoặc chờ kích hoạt)
  2: {
    label: "TENANT CONFIRMED",
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  },

  // 3: PENDING - Chờ hiệu lực (Cả hai đã xác nhận, chờ ngày bắt đầu)
  3: {
    label: "PENDING",
    color: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },

  // 4: ACTIVE - Đang có hiệu lực
  4: { label: "ACTIVE", color: "bg-green-600 hover:bg-green-700 text-white" },

  // 5: EXPIRED - Hợp đồng hết hạn
  5: { label: "EXPIRED", color: "bg-stone-500 hover:bg-stone-600 text-white" },

  // 6: CANCELLED - Đã hủy
  6: { label: "CANCELLED", color: "bg-gray-600 hover:bg-gray-700 text-white" },

  // 7: TENANT_RENEWAL_REJECTED - Khách từ chối gia hạn
  7: {
    label: "RENEWAL REJECTED",
    color: "bg-orange-500 hover:bg-orange-600 text-white",
  },
};
