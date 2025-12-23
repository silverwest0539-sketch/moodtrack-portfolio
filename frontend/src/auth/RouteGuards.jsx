import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";


export function ProtectedRoute() { // 로그인 안 됐을 때
  const { isLoggedIn, checking } = useAuth();

  if (checking) return <div>세션 확인중... 🫠</div>;
  if (!isLoggedIn) return <Navigate to="/landing" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() { // 로그인 됐을 때
  const { isLoggedIn, checking } = useAuth();

  if (checking) return <div>세션 확인중... 🫠</div>;
  if (isLoggedIn) return <Navigate to="/" replace />;
  return <Outlet />;
}