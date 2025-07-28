import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLoginMutation } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";
import {
  Google,
  LinkedIn,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
const validationSchema = yup.object({
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 chars are required")
    .max(16, "Maximum 16 chars allowed"),
});

type FormData = yup.InferType<typeof validationSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // State to toggle show/hide password
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await loginUser(data).unwrap();
      toast.success("User logged in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      const validationError =
        error?.data?.data?.errors?.[0]?.msg || error?.data?.message;
      toast.error(
        validationError || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className="form-container">
      <p className="title">Login</p>
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            autoComplete="username"
            placeholder="Enter your email"
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && (
            <small role="alert" className="error-text">
              {errors.email.message}
            </small>
          )}
        </div>

        <div className="input-group" style={{ position: "relative" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={errors.password ? "input-error" : ""}
          />
          {/* Toggle show/hide icon button */}
          <button
            type="button"
            onClick={toggleShowPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "10px",
              top: "38px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              color: "#999",
            }}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </button>

          <div className="forgot">
            <a href="/forgot-password" rel="noopener noreferrer">
              Forgot Password?
            </a>
          </div>
          {errors.password && (
            <small role="alert" className="error-text">
              {errors.password.message}
            </small>
          )}
        </div>

        <button className="sign" type="submit" disabled={!isValid || isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="social-message">
        <div className="line"></div>
        <p className="message">Login with social accounts</p>
        <div className="line"></div>
      </div>

      <div className="social-icons">
        <button aria-label="Log in with Google" className="icon">
          <Google sx={{ height: 30, width: 30, fill: "#4c89ed" }} />
        </button>
        <button aria-label="Log in with LinkedIn" className="icon">
          <LinkedIn sx={{ height: 30, width: 30, fill: "#0a66c2" }} />
        </button>
        <button aria-label="Log in with GitHub" className="icon">
          {/* GitHub SVG or icon */}
        </button>
      </div>

      <p className="signup">
        Don't have an account?{" "}
        <a href="/signup" rel="noopener noreferrer" className="">
          Sign up
        </a>
      </p>
    </div>
  );
}
