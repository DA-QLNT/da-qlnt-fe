import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated } from "../store/authSlice";
import { useGetMeQuery } from "../store/authApi";

export const useAuth = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const jwtUser = useSelector(selectCurrentUser);

  // user detail
  const { data: userDetail, isLoading: isLoadingMe } = useGetMeQuery(
    undefined,
    {
      skip: !isAuthenticated,
    }
  );
  const user = isAuthenticated ? { ...jwtUser, ...userDetail } : null;
  const ownerId = userDetail?.id;

  const isAdmin = user?.roles?.includes("ADMIN");
  const isOwner = user?.roles?.includes("OWNER");
  const isUser = user?.roles?.includes("USER");
  const isGuest = !isAuthenticated;
  return { isAuthenticated, user, isAdmin, isOwner, isUser, isGuest, ownerId, isLoadingMe };
};
