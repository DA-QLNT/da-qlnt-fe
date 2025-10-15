import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./features/auth";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/layout/ProtectedRoute";
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
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
