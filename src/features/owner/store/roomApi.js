import { baseApi } from "@/store/api/baseApi";

export const roomApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomsByHouseId: builder.query({
      query: ({ houseId, page = 0, size = 10 }) => ({
        url: `/rooms/house/${houseId}`,
        method: "GET",
        params: {
          page,
          size,
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, { houseId }) => [
        "Room",
        { type: "HouseRooms", id: houseId },
      ],
    }),
    getRoomById: builder.query({
      query: (roomId) => ({
        url: `/rooms/${roomId}`,
        method: "GET",
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, id) => [{ type: "Room", id }],
    }),
    updateRoom: builder.mutation({
      query: ({ roomId, formData }) => ({
        url: `/rooms/${roomId}`,
        method: "PUT",
        data: formData,
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "Room", id: roomId },
        { type: "HouseRooms", id: result?.houseId }, // Cần houseId từ result để invalidation
      ],
    }),
    updateRoomStatus: builder.mutation({
      query: ({ roomId, status }) => ({
        url: `/rooms/${roomId}/status?status=${status}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "Room", id: roomId },
        "Room",
      ],
    }),
    deleteRoom: builder.mutation({
      query: (roomId) => ({
        url: `/rooms/${roomId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),
    // =============asset-item=============
    updateAssetItemStatus: builder.mutation({
      query: ({ itemId, status }) => ({
        url: `/asset-items/${itemId}/status?status=${status}`,
        method: "PATCH",
      }),

      invalidatesTags: (result, error, { itemId }) => ["Room"],
    }),
  }),
});
export const {
  useGetRoomsByHouseIdQuery,
  useGetRoomByIdQuery,
  useDeleteRoomMutation,
  useUpdateRoomMutation,
  useUpdateRoomStatusMutation,
  useUpdateAssetItemStatusMutation,
} = roomApi;
