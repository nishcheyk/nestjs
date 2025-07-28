import React from "react";
import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../services/api";
import { useAppSelector } from "../store/store";

export default function AuthenticatedLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logoutUser] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser().unwrap();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ccc", display: "flex", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            App Logo
          </Link>
        </h1>

        <nav style={{ marginLeft: "auto" }}>
          <button onClick={handleLogout} style={{ cursor: "pointer" }}>
            Logout
          </button>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}
