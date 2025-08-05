import React, { useCallback } from "react";
import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLogoutMutation } from "../services/api";
import { useAppSelector, useAppDispatch } from "../store/store";
import { setAccessToken, setAuthenticated } from "../reducers/authReducers";
import { useInactivityTimer } from "../hooks/useInactivityTimer";
import { useAutoRefreshToken } from "../hooks/useAutoRefreshToken";

export default function AuthenticatedLayout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logoutUser, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') ?? '';
  const accessToken = localStorage.getItem('accessToken') ?? '';

  const warning1ToastId = "warning1-toast";
  const warning2ToastId = "warning2-toast";
  const countdownToastId = "countdown-toast";

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser({ userId, accessToken }).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(setAccessToken(undefined));
      dispatch(setAuthenticated(false));

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("sessionId");

      navigate("/login", { replace: true });
    }
  }, [dispatch, logoutUser, navigate, userId, accessToken]);

  const handleLogoutOnInactive = useCallback(() => {
    toast.dismiss(); // Dismiss all toasts on logout
    handleLogout();
  }, [handleLogout]);

  // Warning 1 toast (10 minutes remaining) - auto closes after 15 seconds
  const handleWarning1 = useCallback(() => {
    toast.dark(
      "You have been inactive for 10 minutes. Please interact to stay logged in.",
      {
        toastId: warning1ToastId,
        autoClose: 15000, // 15 seconds
        closeButton: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  }, []);

  // Warning 2 toast (5 minutes remaining) - stays visible until user interacts or logout
  const handleWarning2 = useCallback(() => {
    if (!toast.isActive(warning2ToastId)) {
      toast.warn("5 minutes remaining before automatic logout due to inactivity.", {
        toastId: warning2ToastId,
        autoClose: (5*60*1000)-10,  // stay for 14 min 50 sec
        closeButton: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, []);

  // Final countdown toast update
  const handleFinalCountdownTick = useCallback((secondsRemaining: number) => {
    const secondsStr = `${secondsRemaining} second${secondsRemaining !== 1 ? "s" : ""}`;

    toast.update(countdownToastId, {
      render: `Logging out in ${secondsStr} due to inactivity.`,
      autoClose: false,
      closeButton: false,
      pauseOnHover: false,
      draggable: false,
    });

    if (!toast.isActive(countdownToastId)) {
      toast.error(`Logging out in ${secondsStr} due to inactivity.`, {
        toastId: countdownToastId,
        autoClose: false,
        closeButton: false,
        pauseOnHover: false,
        draggable: false,
      });
    }
  }, []);

  // Clears all toasts on user activity to prevent stuck notifications
  const handleReset = useCallback(() => {
    [warning1ToastId, warning2ToastId, countdownToastId].forEach((id) => toast.dismiss(id));
  }, []);

  // Initialize inactivity timer with callbacks
  useInactivityTimer({
    onWarning1: handleWarning1,
    onWarning2: handleWarning2,
    onFinalCountdownTick: handleFinalCountdownTick,
    onInactive: handleLogoutOnInactive,
    onReset: handleReset,
  });

  useAutoRefreshToken(isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          width: "100vw",
          boxSizing: "border-box",
          backgroundColor: "#fff",
        }}
      >
        <h1 style={{ marginRight: "auto" }}>
          <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
            App Logo
          </Link>
        </h1>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "#004990",
            color: "#fff",
            borderRadius: 6,
            border: "none",
            fontWeight: "bold",
          }}
          aria-label="Logout"
          title="Logout"
        >
          Logout ⏻
        </button>
      </header>

      {/* Toast container for notifications */}
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

      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}

