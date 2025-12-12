import { baseApi } from "@/store/api/baseApi";

export const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      query: (params) => ({
        url: "/services/getAll",
        method: "GET",
        params: params,
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Service"],
    }),
    createOrUpdateService: builder.mutation({
      query: (serviceData) => {
        if (serviceData.id) {
          return {
            url: `/services/update`,
            method: "PUT",
            data: serviceData,
          };
        }
        return {
          url: "/services/create",
          method: "POST",
          data: serviceData,
        };
      },
      invalidatesTags: ["Service"],
    }),
    deleteService: builder.mutation({
      query: (serviceId) => ({
        url: `/services/${serviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Service"],
    }),
    // house - service
    getHouseServicesByHouseId: builder.query({
      query: (houseId) => ({
        url: `/house-services/house/${houseId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, houseId) => [
        { type: "ServiceHouse", id: houseId },
      ],
    }),
    assignServiceToHouses: builder.mutation({
      query: (payload) => ({
        url: `/house-services`,
        method: "POST",
        data: payload,
      }),

      invalidatesTags: (result, error, { houseIds }) => [
        "ServiceHouse",

        ...(houseIds?.map((id) => ({ type: "ServiceHouse", id })) || []),
      ],
    }),
    updateHouseService: builder.mutation({
      query: ({ houseServiceId, data }) => ({
        url: `/house-services/${houseServiceId}`,
        method: "PUT",
        data: data,
      }),
      invalidatesTags: (result, error, houseServiceId) => [
        "ServiceHouse",
        {
          type: "ServiceHouse",
          id: result?.houseId,
        },
      ],
    }),
    deleteHouseService: builder.mutation({
      query: (houseServiceId) => ({
        url: `/house-services/${houseServiceId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ServiceHouse"],
    }),

    // declare service meter
    // Lấy tất cả chỉ số dịch vụ của phòng
    getServiceUsagesByRoomId: builder.query({
      query: (roomId) => ({
        url: `/service-usage/get-all`,
        method: "GET",
        params: { roomId },
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, roomId) => [
        { type: "ServiceUsage", id: roomId },
        "ServiceUsage",
      ],
    }),

    // Lấy chi tiết chỉ số theo ID
    getServiceUsageById: builder.query({
      query: (id) => ({
        url: `/service-usage`,
        method: "GET",
        params: { id },
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "ServiceUsage", id }],
    }),

    // Lấy chỉ số mới nhất của dịch vụ theo phòng
    getLatestReading: builder.query({
      query: ({ roomId, serviceId }) => ({
        url: `/service-usage/latest-reading`,
        method: "GET",
        params: { roomId, serviceId },
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, { roomId, serviceId }) => [
        { type: "ServiceUsage", id: `${roomId}-${serviceId}` },
      ],
    }),

    // Khai báo chỉ số dịch vụ
    declareServiceUsage: builder.mutation({
      query: (data) => ({
        url: `/service-usage/declare`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "ServiceUsage", id: roomId },
        "ServiceUsage",
        "Contract",
      ],
    }),

    // Xác nhận tất cả chỉ số
    confirmServiceUsage: builder.mutation({
      query: ({ month, year }) => ({
        url: `/service-usage/confirm_all`,
        method: "POST",
        params: { month, year },
      }),
      invalidatesTags: ["ServiceUsage", "Contract"],
    }),
    // ================HÓA ĐƠN=============
    //  QUERY LẤY DANH SÁCH HÓA ĐƠN THEO ROOM ID
    getInvoicesByRoomId: builder.query({
      query: (roomId) => ({
        url: `/invoices/all/${roomId}`, // Endpoint: /invoices/all/{roomId}
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Invoice"],
    }),

    //  QUERY LẤY CHI TIẾT HÓA ĐƠN
    getInvoiceById: builder.query({
      query: (invoiceId) => ({
        url: `/invoices/${invoiceId}`, // Endpoint: /invoices/{id}
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    //  MUTATION TẠO HÓA ĐƠN
    createInvoice: builder.mutation({
      query: ({ roomId, month, year }) => ({
        url: `/invoices/generate-invoice?roomId=${roomId}&month=${month}&year=${year}`,
        method: "POST",
      }),
      invalidatesTags: ["Invoice", "ServiceUsage"], // Cập nhật danh sách hóa đơn và chỉ số
    }),
    // Xuất hóa đơn
    exportInvoiceExcel: builder.mutation({
      query: ({ roomId, month, year }) => ({
        url: `/excel/invoices/month-year`,
        method: "POST",
        params: { roomId, month, year },
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        responseHandler: async (response) => {
          // Nếu response thành công (2xx), trả về Blob
          if (response.ok) {
            return response.blob();
          }

          // Nếu response là lỗi (4xx, 5xx):
          try {
            // Cố gắng đọc body dưới dạng JSON (chứa lỗi server)
            const error = await response.json();
            // Ném lỗi để .unwrap() bắt được
            return Promise.reject(error);
          } catch (e) {
            // Trường hợp response không phải JSON (ví dụ: lỗi mạng/text đơn giản)
            const errorText = await response.text();
            return Promise.reject({
              message: errorText || "Lỗi không xác định khi xuất file.",
            });
          }
        },
        cache: "no-cache",
      }),
    }),
  }),
});
export const {
  useGetServicesQuery,
  useCreateOrUpdateServiceMutation,
  useDeleteServiceMutation,
  useGetHouseServicesByHouseIdQuery,
  useAssignServiceToHousesMutation,
  useUpdateHouseServiceMutation,
  useDeleteHouseServiceMutation,
  useDeclareServiceUsageMutation,
  useConfirmServiceUsageMutation,
  useGetServiceUsageByIdQuery,
  useGetServiceUsagesByRoomIdQuery,
  useGetLatestReadingQuery,
  useGetInvoicesByRoomIdQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useExportInvoiceExcelMutation,
} = serviceApi;
