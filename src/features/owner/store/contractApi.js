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
        url: `/contracts/${contractId}/activate`,
        method: "PUT",
      }),
      // Invalidates Contract chi tiết và danh sách Rooms (vì status phòng có thể thay đổi)
      invalidatesTags: (result, error, contractId) => [
        { type: "Contract", id: contractId },
        "Room", // Phòng bị ảnh hưởng (chuyển sang RENTED)
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
  }),
});

export const {
  useCreateContractMutation,
  useGetContractByIdQuery,
  useGetContractsByRoomIdQuery,
  useUpdateContractInforMutation,
  useAddTenantMutation,
  useLeaveTenantMutation,
  useSetNewRepresentativeMutation,
  useUpdateContractServicesMutation,
  useActivateContractMutation,
  useCancelContractMutation,
  useExtendContractMutation,
  useGetCurrentContractByIdQuery,
} = contractApi;
