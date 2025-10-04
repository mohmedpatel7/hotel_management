import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ManagerState {
  name: string;
  userId: string;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  name: "",
  userId: "",
  token: null,
  loading: false,
  error: null,
};

type ErrorType = {
  message: string;
  status?: number;
};

export const signInManager = createAsyncThunk(
  "manager/signin",
  async (
    { userId, password }: { userId: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/manager/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        const error: ErrorType = {
          message: data.message || "Failed to sign in",
          status: response.status,
        };
        return rejectWithValue(error);
      }
      return data;
    } catch (error) {
      const errorMessage: ErrorType = {
        message: error instanceof Error ? error.message : "Failed to sign in",
        status: 500,
      };
      return rejectWithValue(errorMessage);
    }
  }
);

export const signUpManager = createAsyncThunk(
  "manager/signup",
  async (
    {
      name,
      userId,
      password,
    }: { name: string; userId: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/manager/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        const error: ErrorType = {
          message: data.message || "Failed to sign up",
          status: response.status,
        };
        return rejectWithValue(error);
      }
      return data;
    } catch (error) {
      const errorMessage: ErrorType = {
        message: error instanceof Error ? error.message : "Failed to sign up",
        status: 500,
      };
      return rejectWithValue(errorMessage);
    }
  }
);

export const getManagerProfile = createAsyncThunk(
  "manager/profile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("manager_token");
      const response = await fetch("/api/manager/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          manager_token: token || "",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        const error: ErrorType = {
          message: data.message || "Failed to fetch profile",
          status: response.status,
        };
        return rejectWithValue(error);
      }
      return data;
    } catch (error) {
      const errorMessage: ErrorType = {
        message:
          error instanceof Error ? error.message : "Failed to fetch profile",
        status: 500,
      };
      return rejectWithValue(errorMessage);
    }
  }
);

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    logout: (state) => {
      state.name = "";
      state.userId = "";
      state.token = null;
      state.error = null;
      localStorage.removeItem("manager_token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign In
    builder
      .addCase(signInManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInManager.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.token = action.payload.manager_token;
          state.error = null;
          localStorage.setItem("manager_token", action.payload.manager_token);
        } else {
          state.token = null;
          state.error = action.payload.message || "Authentication failed";
        }
      })
      .addCase(signInManager.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as ErrorType;
        state.error = error.message;
      })
      // Sign Up
      .addCase(signUpManager.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpManager.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.manager_token;
        state.error = null;
        // localStorage.setItem("manager_token", action.payload.manager_token);
      })
      .addCase(signUpManager.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as ErrorType;
        state.error = error.message;
      })
      // Get Profile
      .addCase(getManagerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getManagerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.name = action.payload.response.name;
        state.userId = action.payload.response.userId;
        state.error = null;
      })
      .addCase(getManagerProfile.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as ErrorType;
        state.error = error.message;
      });
  },
});

export const { logout, clearError } = managerSlice.actions;
export default managerSlice.reducer;
