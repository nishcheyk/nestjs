import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface ApiResponse<T> {
  access_token?: string;
  data?: T;
  message: string;
  success: boolean;
}

interface User {
  _id: string;
  email: string; 
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3000", 
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.access_token; 
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    signup: builder.mutation<ApiResponse<User>, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/users/signup",
        method: "POST",
        body: credentials,
      }),
    }),
    login: builder.mutation<ApiResponse<{ access_token: string }>, { email: string; password: string }>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    
    logout: builder.mutation<ApiResponse<void>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
    
  }),
});

export const {  useSignupMutation, useLoginMutation, useGetProfileQuery, useLogoutMutation } = api;
