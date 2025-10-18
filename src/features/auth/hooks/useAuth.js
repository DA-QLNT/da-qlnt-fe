import { useSelector } from "react-redux";
import { selectCurrentUser, selectIsAuthenticated } from "../store/authSlice";

export const useAuth = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // trich xuat vai tro
  const roles = user?.roles || [];

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isOwner = user?.roles?.includes("ROLE_OWNER");
  const isUser = user?.roles?.includes("ROLE_USER");
  const isGuest = !isAuthenticated;
  return { isAuthenticated, user, isAdmin, isOwner, isUser, isGuest };
};
