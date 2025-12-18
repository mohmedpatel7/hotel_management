import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ManagerState {
  name: string;
  userId: string;
  token: string | null;
  loading: boolean;
  error: string | null;
  dashboard: {
    monthlyRevenue: number;
    todaysOrdersCount: number;
    totalWaiters: number;
    totalCooks: number;
    famousFoods: {
      name: string;
      price: string | number;
      orders: string;
    }[];
  } | null;
  ordersReport: {
    orders: {
      _id: string;
      createdAt: string;
      tableNo: number;
      status: string;
      price: number;
      quantity: string;
      food: {
        _id?: string;
        foodName?: string;
        fullPrice?: string | number;
      } | null;
      weater: {
        _id?: string;
        name?: string;
      } | null;
    }[];
  } | null;
  revenueReport: {
    totalRevenue: number;
  } | null;
  users: {
    // new slice property
    waiters: { name: string; userId: string }[];
    cooks: { name: string; userId: string }[];
    managers: { name: string; userId: string }[];
  } | null;
}

const initialState: ManagerState = {
  name: "",
  userId: "",
  token: null,
  loading: false,
  error: null,
  dashboard: null,
  ordersReport: null,
  revenueReport: null,
  users: null,
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

export const fetchManagerDashboard = createAsyncThunk(
  "manager/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/reportss/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          manager_token: localStorage.getItem("manager_token") || "",
        },
      });

      if (!response.ok) {
        const error: ErrorType = {
          message: "Failed to fetch dashboard",
          status: response.status,
        };
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      const errorMessage: ErrorType = {
        message:
          error instanceof Error ? error.message : "Failed to fetch dashboard",
        status: 500,
      };
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrdersReport = createAsyncThunk(
  "manager/ordersReport",
  async ({ from, to }: { from: string; to: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/reportss/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          manager_token: localStorage.getItem("manager_token") || "",
        },
        body: JSON.stringify({ from, to }),
      });
      if (!response.ok) {
        const error: ErrorType = {
          message: "Failed to fetch dashboard",
          status: response.status,
        };
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      const errorMessage: ErrorType = {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch orders report",
        status: 500,
      };
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchRevenueReport = createAsyncThunk(
  "manager/revenueReport",
  async ({ from, to }: { from: string; to: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/reportss/revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          manager_token: localStorage.getItem("manager_token") || "",
        },
        body: JSON.stringify({ from, to }),
      });
      if (!response.ok) {
        const error: ErrorType = {
          message: "Failed to fetch dashboard",
          status: response.status,
        };
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      const errorMessage: ErrorType = {
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch revenue report",
        status: 500,
      };
      return rejectWithValue(errorMessage);
    }
  }
);

// new thunk for fetching users
export const fetchUsers = createAsyncThunk(
  "manager/users",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/reportss/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          manager_token: localStorage.getItem("manager_token") || "",
        },
      });
      if (!response.ok) {
        const error: ErrorType = {
          message: "Failed to fetch dashboard",
          status: response.status,
        };
        return rejectWithValue(error);
      }

      return await response.json();
    } catch (error) {
      const errorMessage: ErrorType = {
        message:
          error instanceof Error ? error.message : "Failed to fetch users",
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
      state.dashboard = null;
      state.ordersReport = null;
      state.revenueReport = null;
      state.users = null;
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
      })

      // Fetch Dashboard
      .addCase(fetchManagerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = {
          monthlyRevenue: action.payload.monthlyRevenue,
          todaysOrdersCount: action.payload.todaysOrdersCount, // fixed typo
          totalWaiters: action.payload.totalWaiters,
          totalCooks: action.payload.totalCooks,
          famousFoods: action.payload.famousFoods,
        };
        state.error = null;
      })
      .addCase(fetchManagerDashboard.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as ErrorType;
        state.error = error.message;
      })

      // Fetch Orders Report
      .addCase(fetchOrdersReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersReport.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersReport = action.payload;
        state.error = null;
      })
      .addCase(fetchOrdersReport.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as ErrorType;
        state.error = error.message;
      })

      // Fetch Revenue Report
      .addCase(fetchRevenueReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueReport = { totalRevenue: action.payload.totalRevenue };
        state.error = null;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as ErrorType;
        state.error = error.message;
      })

      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = {
          waiters: action.payload.weaters, // backend uses "weaters"
          cooks: action.payload.cooks,
          managers: action.payload.managers,
        };
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        const error = action.payload as ErrorType;
        state.error = error.message;
      });
  },
});

export const { logout, clearError } = managerSlice.actions;
export default managerSlice.reducer;
