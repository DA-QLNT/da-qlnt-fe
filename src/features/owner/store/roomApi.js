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
    createRoom: builder.mutation({
      query: (formData) => ({
        url: `/rooms`,
        method: "POST",
        data: formData,
      }),

      invalidatesTags: (result, error, arg) => {
        const tags = ["Room"];
        if (result?.houseId) {
          tags.push({ type: "HouseRooms", id: result.houseId });
        }
        return tags;
      },
    }),
    updateRoom: builder.mutation({
      query: ({ roomId, formData }) => ({
        url: `/rooms/${roomId}`,
        method: "PUT",
        data: formData,
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "Room", id: roomId },
        { type: "HouseRooms", id: result?.houseId },
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
    updateAssetItem: builder.mutation({
      query: ({ itemId, formData }) => ({
        url: `/asset-items/${itemId}`,
        method: "PUT",
        data: formData,
      }),
      invalidatesTags: (result, error, { itemId }) => [
        "Room",
        { type: "Room", id: result?.roomId },
      ],
    }),
    createAssetItem: builder.mutation({
      query: (formData) => ({
        url: `/asset-items`,
        method: "POST",
        data: formData,
      }),

      invalidatesTags: (result, error, arg) => [
        "Room",
        { type: "Room", id: result?.roomId },
      ],
    }),
    // use for service log:
    // ✅ THÊM API QUERY MỚI ĐỂ LẤY PHÒNG THEO STATUS
    getRoomsByHouseIdAndStatus: builder.query({
      query: ({ houseId, status, page = 0, size = 10 }) => ({
        url: `/rooms/house/${houseId}/status/${status}`, // Endpoint đã cho
        method: "GET",
        params: {
          page,
          size,
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: (result, error, { houseId, status }) => [
        "Room",
        { type: "HouseRooms", id: houseId },
        { type: "RoomsByStatus", id: `${houseId}-${status}` }, // Tag cụ thể hơn
      ],
    }),
    //  api lấy room theo filter house
    searchRooms: builder.query({
      query: ({ houseId, status = 1, keyword = "", page = 0, size = 20 }) => ({
        url: `/rooms/search`,
        method: "GET",
        params: {
          houseId,
          status,
          keyword,
          page,
          size,
        },
      }),
      transformResponse: (response) => response.result,
      providesTags: ["Room"],
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
  useUpdateAssetItemMutation,
  useCreateAssetItemMutation,
  useCreateRoomMutation,
  useGetRoomsByHouseIdAndStatusQuery,
  useSearchRoomsQuery,
} = roomApi;
