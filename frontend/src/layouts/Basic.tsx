import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Basic() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        autoClose={5000}
      />
      <Outlet />
    </>
  );
}

export default Basic;
