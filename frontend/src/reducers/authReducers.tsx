import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { api } from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  access_token?: string;
}

const tokenKey = 'access_token';

const initialState: AuthState = {
  access_token: localStorage.getItem(tokenKey) || undefined,
  isAuthenticated: !!localStorage.getItem(tokenKey), 
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    setAccessToken(state, action: PayloadAction<string | undefined>) {
      state.access_token = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.isAuthenticated = true;
      state.access_token = payload.access_token;

      if (payload.access_token) {
        localStorage.setItem(tokenKey, payload.access_token);  // Save token
      }
    });
    builder.addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
      state.isAuthenticated = false;
      state.access_token = undefined;

      localStorage.removeItem(tokenKey);  // Remove token
    });
  },
});

export const { setAuthenticated, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
