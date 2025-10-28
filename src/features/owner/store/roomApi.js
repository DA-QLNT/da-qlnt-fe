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
  }),
});
export const { useGetRoomsByHouseIdQuery, useGetRoomByIdQuery } = roomApi;