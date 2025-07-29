import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSignupMutation } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import "../styles/AuthForm.css";

import { Visibility, VisibilityOff } from "@mui/icons-material";

// Updated validation schema with confirmPassword field
const validationSchema = yup.object({
  email: yup.string().email("Email is invalid").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(5, "Minimum 5 chars are required")
    .max(16, "Maximum 16 chars allowed"),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

type FormData = yup.InferType<typeof validationSchema>;

export function SignupForm() {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  // States to toggle show/hide for password and confirm password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

 
  const onSubmit = async (data: FormData) => {
       try {
         await registerUser(data).unwrap();
         toast.success("User registered successfully!");
         navigate("/login");
    } catch (error: any) {
     
      if (error?.status === 429) {
        toast.error("Too many login attempts. Please try again after 5 minutes.");
        return;
      }
  
      const validationError =
        error?.data?.data?.errors?.[0]?.msg || error?.data?.message;
  
      toast.error(validationError || "Login failed. Please check your credentials.");
    }
  };
  

  return (
    <div className="form-container">
      <p className="title">Sign Up</p>
      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email Field */}
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

        {/* Password Field */}
        <div className="input-group" style={{ position: "relative" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            aria-invalid={!!errors.password}
            autoComplete="new-password"
            placeholder="Enter your password"
            className={errors.password ? "input-error" : ""}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="password-toggle"
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </button>
          {errors.password && (
            <small role="alert" className="error-text">
              {errors.password.message}
            </small>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="input-group" style={{ position: "relative" }}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            autoComplete="new-password"
            placeholder="Confirm your password"
            className={errors.confirmPassword ? "input-error" : ""}
          />
          <button
            type="button"
            onClick={toggleShowConfirmPassword}
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            className="password-toggle"
          >
            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
          </button>
          {errors.confirmPassword && (
            <small role="alert" className="error-text">
              {errors.confirmPassword.message}
            </small>
          )}
        </div>

        <button className="sign" type="submit" disabled={!isValid || isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </button>
      </form>

      <div className="social-message">
        <div className="line"></div>
        <p className="message">Sign up with social accounts</p>
        <div className="line"></div>
      </div>

      <div className="social-icons">
        <button aria-label="Sign up with Google" className="icon">
          {/* Google SVG or icon */}
        </button>
        <button aria-label="Sign up with Twitter" className="icon">
          {/* Twitter SVG or icon */}
        </button>
        <button aria-label="Sign up with GitHub" className="icon">
          {/* GitHub SVG or icon */}
        </button>
      </div>

      <p className="signup">
        Already have an account?{" "}
        <a href="/login" className="">
          Login
        </a>
      </p>
    </div>
  );
}
