import React, { useState } from "react";
import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../services/api";
import { useAppSelector, useAppDispatch } from "../store/store";
import { setAccessToken, setAuthenticated } from "../reducers/authReducers";

export default function AuthenticatedLayout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [logoutUser] = useLogoutMutation();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(setAccessToken(undefined));
      dispatch(setAuthenticated(false));
      localStorage.removeItem("access_token");
      navigate("/login");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Styles
  const headerStyle: React.CSSProperties = {
    padding: "1rem 2rem",
    borderBottom: "1px solid #ccc",
    display: "flex",
    alignItems: "center",
    width: "100vw",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  };

  const logoStyle: React.CSSProperties = {
    marginRight: "1rem",
    whiteSpace: "nowrap",
    fontWeight: "bold",
    fontSize: "1.25rem",
  };

  // Navigation grows to fill remainder of header width
  const navContainerStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
  };

  // Button container with animated width on hover
  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    backgroundColor: "rgba(0, 73, 144)",
    width: isHovered ? 300 : 250,
    height: 40,
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: 10,
    boxShadow:
      "rgba(0, 0, 0, 0.35) 0px 5px 15px, rgba(0, 73, 144, 0.5) 5px 10px 15px",
    transition: "width 0.5s",
    cursor: "pointer",
    userSelect: "none",
  };

  const buttonStyle: React.CSSProperties = {
    outline: "none",
    border: "none",
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    transition: "transform 0.3s ease-in-out",
    cursor: "pointer",
    fontSize: 20,
  };

  
  const buttonTransform = buttonHover ? "translateY(-3px)" : undefined;

  return (
    <>
      <header style={headerStyle}>
        <h1 style={logoStyle}>
          <Link to="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
            App Logo
          </Link>
        </h1>

        <nav style={navContainerStyle}>
          <div
            style={buttonContainerStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button
              onClick={handleLogout}
              style={{ ...buttonStyle, transform: buttonTransform }}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              aria-label="Logout"
              title="Logout"
            >
              ⏻
            </button>
          </div>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
}
