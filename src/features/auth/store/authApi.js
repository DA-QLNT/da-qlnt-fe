import { baseApi } from "@/store/api/baseApi";
import { setCredentials } from "./authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
      // after success request
      async onQueryStarted(credentials, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { token } = data.result; // {token, authenticated}
          dispatch(setCredentials({ token, user: null }));
        } catch (error) {
          console.log("login failed:", error);
        }
      },
    }),
  }),
});
export const { useLoginMutation } = authApi;
