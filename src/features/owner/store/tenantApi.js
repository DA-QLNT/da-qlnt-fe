import { baseApi } from "@/store/api/baseApi";

export const tenantApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // get tenant
    getTenantsByOwnerId: builder.query({
      query: ({ ownerId, page = 0, size = 20, search = "" }) => ({
        url: `/tenants/getAllByOwnerId`,
        method: "GET",
        params: {
          ownerId,
          page,
          size,
          search,
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, { ownerId }) => [
        "Tenant",
        { type: "TenantsByOwner", id: ownerId },
      ],
    }),
    getTenantByOwnerIdAndSearch: builder.query({
      query: ({ ownerId, page = 0, size = 20, tenantName = "" }) => ({
        url: `/tenants/getAllByOwnerId`,
        method: "GET",
        params: {
          page,
          size,
          ownerId,
          tenantName, // Gửi keyword tìm kiếm lên server
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Tenant"],
    }),
    getTenantsById: builder.query({
      query: (tenantId) => ({
        url: `/tenants/${tenantId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "Tenant", id }],
    }),
    updateTenant: builder.mutation({
      query: (formData) => ({
        url: "/tenants/update",
        method: "PUT",
        data: formData,
      }),
      invalidatesTags: (result, error, { get }) => {
        const id = result?.result?.id || (result?.id ?? null);
        return [{ type: "Tenant", id }, "Tenant"];
      },
    }),
    searchTenantByPhoneNumber: builder.query({
      query: (phoneNumber) => ({
        url: `/tenants/search`,
        method: "GET",
        params: { phoneNumber },
      }),
      transformResponse: (response) => response.result,
    }),
    createTenant: builder.mutation({
      query: (tenantData) => ({
        url: "/tenants/create",
        method: "POST",
        data: tenantData,
      }),
      invalidatesTags: ["Tenant"],
    }),
  }),
});

export const {
  useGetTenantsByOwnerIdQuery,
  useGetTenantByOwnerIdAndSearchQuery,
  useGetTenantsByIdQuery,
  useUpdateTenantMutation,
  useSearchTenantByPhoneNumberQuery,
  useCreateTenantMutation,
} = tenantApi;
