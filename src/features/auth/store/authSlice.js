import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
const getToken = () => localStorage.getItem("token");

// helper validate token con han khong
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp && decoded.exp > currentTime;
  } catch (error) {
    console.error("invalid token:", error);

    return false;
  }
};

// helper decode token
const decodeToken = (token) => {
  if (!token || !isTokenValid(token)) return null;
  try {
    const decoded = jwtDecode(token);

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

const getInitialUser = () => {
  const token = getToken();
  return decodeToken(token);
};
const getInitialAuthState = () => {
  const token = getToken();
  const valid = isTokenValid(token);
  if (!valid && token) {
    localStorage.removeItem("token");
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  }
  return {
    token: token,
    user: decodeToken(token),
    isAuthenticated: valid,
  };
};
const initialState = getInitialAuthState;

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token } = action.payload;
      if(!isTokenValid(token)){
        console.error('attempting to set invalid token');
        return 
        
      }
      const user = decodeToken(token);
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
