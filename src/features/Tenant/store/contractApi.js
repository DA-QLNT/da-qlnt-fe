import { baseApi } from "@/store/api/baseApi";

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. QUERY LẤY HỢP ĐỒNG MỚI NHẤT CỦA TENANT
    // Endpoint: /contracts/tenants/latest
    getLatestTenantContract: builder.query({
      query: () => ({
        url: "/contracts/tenants/latest",
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Contract", "TenantContract"],
    }),

    // 2. MUTATION XÁC NHẬN HỢP ĐỒNG (Tenant Confirm)
    // Endpoint: /contracts/{contractId}/confirm-tenant
    confirmTenantContract: builder.mutation({
      query: (contractId) => ({
        url: `/contracts/${contractId}/tenant/confirm`,
        method: "POST",
      }),
      // Cập nhật lại hợp đồng sau khi xác nhận
      invalidatesTags: (result, error, contractId) => [
        { type: "Contract", id: contractId },
        "TenantContract",
      ],
    }),

    // 3. MUTATION TỪ CHỐI HỢP ĐỒNG (Tenant Reject)
    rejectTenantContract: builder.mutation({
      query: ({ contractId, note }) => ({
        url: `/contracts/${contractId}/reject-tenant`,
        method: "POST",
        data: { note },
      }),
      invalidatesTags: (result, error, { contractId }) => [
        { type: "Contract", id: contractId },
        "TenantContract",
      ],
    }),

    // 4. QUERY LẤY HÓA ĐƠN THEO ROOM ID (Dùng cho InvoiceTenant.jsx)
    getInvoicesByRoomId: builder.query({
      query: (roomId) => ({
        url: `/invoices/all/${roomId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Invoice"],
    }),

    // 5. QUERY LẤY CHI TIẾT HÓA ĐƠN
    getInvoiceById: builder.query({
      query: (invoiceId) => ({
        url: `/invoices/${invoiceId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "Invoice", id }],
    }),

    // 6. (Tùy chọn) Khai báo chỉ số dịch vụ (Nếu Tenant có quyền)
    declareServiceUsage: builder.mutation({
      query: (data) => ({
        url: `/service-usage/declare`,
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["ServiceUsage", "Contract"],
    }),
  }),
});

export const {
  useGetLatestTenantContractQuery,
  useConfirmTenantContractMutation,
  useRejectTenantContractMutation,
  useGetInvoicesByRoomIdQuery,
  useGetInvoiceByIdQuery,
  useDeclareServiceUsageMutation, // Tùy chọn nếu Tenant được phép khai báo
} = contractApi;
