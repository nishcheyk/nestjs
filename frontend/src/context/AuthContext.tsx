
import React, { createContext, useState } from "react";
import type { ReactNode } from "react";
import { loginUser, registerUser } from "../api/auth.api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../api/auth.api";

interface AuthContextType {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const register = async (payload: RegisterPayload) => {
    const data = await registerUser(payload);
    setUser(data.user);
    setAccessToken(data.accessToken);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    // Optional: clear storage tokens here
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
