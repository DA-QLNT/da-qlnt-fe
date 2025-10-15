import { useSelector } from "react-redux"
import { selectCurrentUser, selectIsAuthenticated } from "../store/authSlice"

export const useAuth = ()=>{
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectCurrentUser)

    const isAdmin = user?.roles?.includes('ROLE_ADMIN')
    const isOwner = user?.roles?.includes('ROLE_OWNER')
    return {isAuthenticated, user, isAdmin, isOwner}
}