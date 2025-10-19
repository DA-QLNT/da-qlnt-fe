import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
const getToken = () => localStorage.getItem("token");

// helper decode token
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    console.log(decoded);
    
    const roles = decoded.scope?.roles || [];
    const username = decoded.sub;

    return {
      username: username,
      roles: roles,
    };
  } catch (error) {
    console.error("failed to decode token:", error);
    return null;
  }
};

const getInitialUser = ()=>{
  const token = getToken()
  return decodeToken(token)
}
const initialState = {
  token: getToken(),
  user: getInitialUser(),
  isAuthenticated: !!getToken(), //trạng thái xác thực
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token } = action.payload;
      const user = decodeToken(token)

      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {},
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.user;
