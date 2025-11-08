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
      invalidatesTags: (result, error,  houseServiceId ) => [
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
} = serviceApi;
