export const sortRoomOptions = [
  { value: "none", label: "NoSort", type: "none", order: "none" },
  {
    value: "rent_asc",
    label: "PriceLowToHigh",
    type: "rent",
    order: "asc",
  },
  {
    value: "rent_desc",
    label: "PriceHighToLow",
    type: "rent",
    order: "desc",
  },
  {
    value: "status_vacant",
    label: "StatusAvailable",
    type: "status",
    status: 0,
  },
  {
    value: "status_rented",
    label: "StatusRent",
    type: "status",
    status: 1,
  },
];
