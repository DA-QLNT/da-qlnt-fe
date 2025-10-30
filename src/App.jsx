import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminLayout from "./features/admin/pages/AdminLayout";
import DashboardContent from "./features/admin/pages/Dashboard/DashboardAdmin";
import HouseContent from "./features/admin/pages/House/HouseContent";
import UserContent from "./features/admin/pages/User/UserContent";
import AnalyticContent from "./features/admin/pages/Analytic/AnalyticContent";
import RoleContent from "./features/admin/pages/Role/RoleContent";
import AdminProtectedRoute from "./components/layout/AdminProtectedRoute";
import PermissionContent from "./features/admin/pages/Permission/PermissionContent";
import OwnerProtectedRoute from "./components/layout/OwnerProtectedRoute";
import OwnerLayout from "./features/owner/OwnerLayout";
import DashboardAdmin from "./features/admin/pages/Dashboard/DashboardAdmin";
import DashboardOwner from "./features/owner/pages/Dashboard/DashboardOwner";
import HouseOwner from "./features/owner/pages/House/HouseOwner";
import UserOwner from "./features/owner/pages/User/UserOwner";
import RuleOwner from "./features/owner/pages/Rule/RuleOwner";
import HouseDetailOwner from "./features/owner/pages/House/HouseDetailOwner";
import RoomOwner from "./features/owner/pages/Room/RoomOwner";
import RoomDetailOwner from "./features/owner/pages/Room/RoomDetailOwner";
import AssetOwner from "./features/owner/pages/Asset/AssetOwner";
function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="bottom-right" />
      <main className="flex-row">
        <Routes>
          {/*Public Pages */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>

          {/* Auth */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth" element={<Navigate to="/auth/login" replace />} />

          {/* Protected pages */}
          <Route element={<ProtectedRoute />}>{/* owner, houses, ... */}</Route>

          {/* Admin pages */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardAdmin />} />
              <Route path="houses" element={<HouseContent />} />
              <Route path="users" element={<UserContent />} />
              <Route path="roles" element={<RoleContent />} />
              <Route path="permissions" element={<PermissionContent />} />
              <Route path="analytics" element={<AnalyticContent />} />
            </Route>
          </Route>
          {/* Owner pages */}
          <Route element={<OwnerProtectedRoute />}>
            <Route path="/owner" element={<OwnerLayout />}>
              <Route index element={<DashboardOwner />} />
              {/* house */}
              <Route path="houses" element={<HouseOwner />} />
              <Route path="houses/:houseId" element={<HouseDetailOwner />} />
              <Route path="houses/:houseId/rooms" element={<RoomOwner />} />
              <Route
                path="houses/:houseId/rooms/:roomId"
                element={<RoomDetailOwner />}
              />
              {/* house */}
              <Route path="users" element={<UserOwner />} />
              <Route path="rules" element={<RuleOwner />} />
              <Route path="assets" element={<AssetOwner />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
