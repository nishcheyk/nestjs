import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/store";

function Basic() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  if (isAuthenticated) {
    // Redirect authenticated users away from Basic routes (like login/signup)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default Basic;
