import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated } from "../store/authSlice";
import { useGetMeQuery } from "../store/authApi";
import { useEffect } from "react";

export const useAuth = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const jwtUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  // user detail
  const {
    data: userDetail,
    isLoading: isLoadingMe,
    isError,
    error,
  } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });
  useEffect(() => {
    if (isError && error?.status === 401 && isAuthenticated) {
      console.error("session expired, logging out");
      dispatch(logout());
    }
  });

  const user = isAuthenticated ? { ...jwtUser, ...userDetail } : null;
  const userId = userDetail?.id;

  const isAdmin = user?.roles?.includes("ADMIN");
  const isOwner = user?.roles?.includes("OWNER");
  const isUser = user?.roles?.includes("USER");
  const isTenant = user?.roles?.includes("TENANT");
  const isGuest = !isAuthenticated;
  return {
    isAuthenticated,
    user,
    isAdmin,
    isOwner,
    isUser,
    isTenant,
    isGuest,
    userId,
    isLoadingMe,
  };
};
