import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminLayout from "./features/admin/pages/AdminLayout";
import DashboardContent from "./features/admin/pages/Dashboard/DashboardContent";
import HouseContent from "./features/admin/pages/House/HouseContent";
import UserContent from "./features/admin/pages/User/UserContent";
import AnalyticContent from "./features/admin/pages/Analytic/AnalyticContent";
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
          <Route element={<ProtectedRoute/>}>
            {/* owner, houses, ... */}
            <Route path="/admin" element={<AdminLayout/>}>
              <Route index element={<DashboardContent/>}/>
              <Route path="houses" element={<HouseContent/>}/>
              <Route path="users" element={<UserContent/>}/>
              <Route path='analytics' element={<AnalyticContent/>}/>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
