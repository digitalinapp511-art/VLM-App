import { Navigate, Outlet } from "react-router-dom";
import { PATHS } from "@/routes/paths";

export default function ProtectedRoute() {
  const token = localStorage.getItem("vlm_token");
  return token ? <Outlet /> : <Navigate to={PATHS.SPLASH} replace />;
}
