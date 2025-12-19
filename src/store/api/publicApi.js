import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_API;

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }), // Không dùng token
  endpoints: (builder) => ({
    searchPublicRooms: builder.query({
      query: (params) => ({
        url: `/public/rooms/search`,
        method: "GET",
        params: params, // Truyền các bộ lọc vào đây
      }),
      transformResponse: (response) => response.result,
    }), // 🚨 QUERY CHI TIẾT PHÒNG
    getPublicRoomDetail: builder.query({
      query: (roomId) => `/public/rooms/${roomId}`,
      transformResponse: (response) => response.result,
    }),
  }),
});

export const { useSearchPublicRoomsQuery, useGetPublicRoomDetailQuery } =
  publicApi;
