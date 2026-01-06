import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
interface WaiterState {
  loading: boolean;
  error: string | null;
  waiterData: {
    name: string;
    userId: string;
    // Add other specific waiter data fields as needed
  } | null;
  waiterToken: string | null;
}

const initialState: WaiterState = {
  loading: false,
  error: null,
  waiterData: null,
  waiterToken: null,
};

export const loginWaiter = createAsyncThunk(
  "waiter/login",
  async (
    { userId, password }: { userId: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/weater/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, password }),
      });
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        message: "Failed to login",
        error,
      });
    }
  }
);

export const createWaiter = createAsyncThunk(
  "waiter/create",
  async (
    {
      name,
      userId,
      password,
    }: { name: string; userId: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/weater/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          manager_token: localStorage.getItem("manager_token") || "",
        },
        body: JSON.stringify({ name, userId, password }),
      });
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message);
      }
      return data;
    } catch (error) {
      return rejectWithValue({
        message: "Failed to create waiter",
        error,
      });
    }
  }
);

export const getWaiterProfile = createAsyncThunk(
  "waiter/profile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/weater/auth/signup", {
        headers: {
          weater_token: localStorage.getItem("weater_token") || "",
        },
      });
      const data = await response.json();

      if (!data.success) {
        return rejectWithValue(data.message);
      }
      return data.response;
    } catch (error) {
      return rejectWithValue({
        message: "Failed to fetch profile",
        error,
      });
    }
  }
);

const waiterSlice = createSlice({
  name: "waiter",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.waiterData = null;
      state.waiterToken = null;
      localStorage.removeItem("weater_token");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login Waiter
      .addCase(loginWaiter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWaiter.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.waiterToken = action.payload.weater_token;
          state.error = null;
        } else {
          state.waiterToken = null;
          state.error = action.payload.message || "Authentication failed";
          localStorage.removeItem("weater_token");
        }
      })
      .addCase(loginWaiter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.waiterToken = null;
        localStorage.removeItem("weater_token");
      })

      // Create Waiter
      .addCase(createWaiter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWaiter.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createWaiter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get Waiter Profile
      .addCase(getWaiterProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWaiterProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.waiterData = action.payload;
      })
      .addCase(getWaiterProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout } = waiterSlice.actions;
export default waiterSlice.reducer;
