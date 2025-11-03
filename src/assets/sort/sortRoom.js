export const sortRoomOptions = [
  { value: "none", label: "Không sắp xếp", type: "none", order: "none" },
  {
    value: "rent_asc",
    label: "Giá thuê (Thấp - Cao)",
    type: "rent",
    order: "asc",
  },
  {
    value: "rent_desc",
    label: "Giá thuê (Cao - Thấp)",
    type: "rent",
    order: "desc",
  },
  {
    value: "status_vacant",
    label: "Trạng thái (Phòng Trống)",
    type: "status",
    status: 0,
  },
  {
    value: "status_rented",
    label: "Trạng thái (Đã Thuê)",
    type: "status",
    status: 1,
  },
];
