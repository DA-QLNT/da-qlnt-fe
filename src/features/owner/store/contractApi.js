import { baseApi } from "@/store/api/baseApi";

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createContract: builder.mutation({
      query: (contractData) => ({
        url: "/contracts",
        method: "POST",
        data: contractData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      // Invalidates tags Contract chung và Room Detail (vì status phòng sẽ thay đổi)
      invalidatesTags: (result, error, { roomId }) => [
        "Contract",
        { type: "Room", id: roomId },
      ],
    }),
    getContractById: builder.query({
      query: (contractId) => ({
        url: `/contracts/${contractId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "Contract", id }],
    }),
    //  QUERY LẤY TẤT CẢ HỢP ĐỒNG THEO HOUSE ID
    getContractsByHouseId: builder.query({
      query: ({ houseId, page = 0, size = 10 }) => ({
        url: `/contracts/houses/${houseId}`,
        method: "GET",
        params: { page, size },
      }),
      transformResponse: (response) => response.result.content,
      providesTags: (result, error, { houseId }) => [
        "Contract",
        { type: "HouseContract", id: houseId },
      ],
    }),
    getCurrentContractById: builder.query({
      query: (roomId) => ({
        url: `/contracts/rooms/${roomId}/current`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, roomId) => [
        { type: "Contract", id: result?.id },
        { type: "Room", id: roomId },
      ],
    }),
    getContractsByRoomId: builder.query({
      query: (roomId) => ({
        url: `/contracts/rooms/${roomId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Contract"],
    }),
    updateContractInfor: builder.mutation({
      query: ({ contractId, ...contractData }) => ({
        url: `/contracts/${contractId}`,
        method: "PUT",
        data: contractData,
      }),
      invalidatesTags: (results, error, { contractId }) => [
        { type: "Contract", id: contractId },
      ],
    }),
    // all COntract
    searchContracts: builder.query({
      query: ({
        houseId,
        roomId,
        status,
        keyword,
        fromDate,
        toDate,
        page = 0,
        size = 10,
      }) => ({
        url: `/contracts/search`,
        method: "GET",
        params: {
          houseId: houseId === "all" ? undefined : houseId,
          roomId: roomId === "all" ? undefined : roomId,
          status: status === "all" ? undefined : status,
          keyword: keyword || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          page,
          size,
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Contract"],
    }),
    // ===========tenant==========
    addTenant: builder.mutation({
      query: ({ contractId, tenantData }) => ({
        url: `/contracts/${contractId}/tenants`,
        method: "POST",
        data: tenantData,
      }),
      invalidatesTags: (result, error, { contractId }) => [
        { type: "Contract", id: contractId },
      ],
    }),
    leaveTenant: builder.mutation({
      query: ({ contractId, tenantId }) => ({
        url: `/contracts/${contractId}/tenants/${tenantId}/leave`,
        method: "PUT",
      }),
      // Invalidates Contract chi tiết để cập nhật danh sách tenants
      invalidatesTags: (result, error, { contractId }) => [
        { type: "Contract", id: contractId },
      ],
    }),
    setNewRepresentative: builder.mutation({
      query: ({ contractId, newRepresentativeId }) => ({
        url: `/contracts/${contractId}/tenants/${newRepresentativeId}/representative`,
        method: "PUT",
      }),
      // Invalidates Contract chi tiết
      invalidatesTags: (result, error, { contractId }) => [
        { type: "Contract", id: contractId },
      ],
    }),
    // ===========service============
    updateContractServices: builder.mutation({
      query: ({ contractId, houseServiceIds }) => ({
        url: `/contracts/${contractId}/services`,
        method: "PUT",
        data: { houseServiceIds },
      }),

      invalidatesTags: (result, error, { contractId }) => [
        { type: "Contract", id: contractId },
        "ServiceHouse",
      ],
    }),
    // ================active contract
    activateContract: builder.mutation({
      query: (contractId) => ({
        url: `/contracts/${contractId}/owner/confirm`,
        method: "POST",
      }),
      // Invalidates Contract chi tiết và danh sách Rooms (vì status phòng có thể thay đổi)
      invalidatesTags: (result, error, contractId) => [
        { type: "Contract", id: contractId },
        "Room", // Phòng bị ảnh hưởng (chuyển sang RENTED)
      ],
    }),
    // ================terminate contract
    terminateContract: builder.mutation({
      query: (contractId) => ({
        url: `/contracts/${contractId}/terminate/request`,
        method: "PUT",
      }),
      // Invalidates Contract chi tiết và danh sách Rooms (vì status phòng có thể thay đổi)
      invalidatesTags: (result, error, contractId) => [
        { type: "Contract", id: contractId },
        "Room", // Phòng bị ảnh hưởng (chuyển sang Available)
      ],
    }),
    // ================send email contract
    sendContractEmail: builder.mutation({
      query: (contractId) => ({
        url: `/contracts/${contractId}/send`, // Endpoint: /contracts/{id}/send
        method: "POST", // Dùng PUT/POST
      }),
      // Invalidates Contract chi tiết (để cập nhật log/thông báo gửi)
      invalidatesTags: (result, error, contractId) => [
        { type: "Contract", id: contractId },
      ],
    }),
    // =============cancel contract
    cancelContract: builder.mutation({
      query: (contractId) => ({
        url: `/contracts/${contractId}/cancel`, // Endpoint: /api/contracts/{id}/cancel
        method: "PUT",
      }),
      // Invalidates Contract chi tiết và Room Detail
      invalidatesTags: (result, error, contractId) => [
        { type: "Contract", id: contractId },
        "Room",
      ],
    }),
    // ================ extend contract
    extendContract: builder.mutation({
      query: ({ contractId, data }) => ({
        url: `/contracts/${contractId}/extend`,
        method: "PUT",
        data: data,
      }),
      // Invalidates Contract chi tiết để cập nhật ngày và giá mới
      invalidatesTags: (result, error, { contractId }) => [
        { type: "Contract", id: contractId },
      ],
    }),
    // 🚨 MUTATION XUẤT FILE WORD HỢP ĐỒNG
    exportContractWord: builder.mutation({
      query: (contractId) => ({
        url: `/contracts/${contractId}/doc/download`,
        method: "GET",
        responseHandler: async (response) => {
          if (response.ok) {
            return response.blob();
          }
          // Xử lý lỗi nếu backend trả về JSON lỗi thay vì file
          try {
            const errorData = await response.json();
            return Promise.reject(errorData);
          } catch (e) {
            return Promise.reject({ message: "Lỗi khi tải file hợp đồng." });
          }
        },
        cache: "no-cache",
      }),
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractByIdQuery,
  useGetContractsByHouseIdQuery,
  useGetContractsByRoomIdQuery,
  useUpdateContractInforMutation,
  useAddTenantMutation,
  useLeaveTenantMutation,
  useSetNewRepresentativeMutation,
  useUpdateContractServicesMutation,
  useActivateContractMutation,
  useTerminateContractMutation,
  useSendContractEmailMutation,
  useCancelContractMutation,
  useExtendContractMutation,
  useGetCurrentContractByIdQuery,
  useExportContractWordMutation,
  useSearchContractsQuery,
} = contractApi;
