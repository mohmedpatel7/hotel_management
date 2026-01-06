import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface CookUser {
  id: string;
  name: string;
  userId?: string;
}

interface CookState {
  loading: boolean;
  error: string | null;
  user: CookUser | null;
  cookToken: string | null;
}

interface SignInData {
  userId: string;
  password: string;
}

interface SignUpData {
  userId: string;
  password: string;
  name: string;
}

const initialState: CookState = {
  loading: false,
  error: null,
  user: null,
  cookToken: null,
};

const BASE_URL = "/api/cook";

export const signInCook = createAsyncThunk(
  "cook/signIn",
  async (data: SignInData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const cook = await response.json();

      if (!response.ok) {
        const message =
          (cook as { message?: string })?.message ||
          "Failed to sign in. Please try again.";
        return rejectWithValue(message);
      }

      return cook;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred during sign in");
    }
  }
);

export const signUpCook = createAsyncThunk(
  "cook/signUp",
  async (data: SignUpData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          manager_token: localStorage.getItem("manager_token") || "",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unexpected error occurred during sign up");
    }
  }
);

export const getProfile = createAsyncThunk(
  "cook/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          cook_token: localStorage.getItem("cook_token") || "",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to fetch profile");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(
        "An unexpected error occurred while fetching profile"
      );
    }
  }
);

const cookSlice = createSlice({
  name: "cook",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.cookToken = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign In Cases
    builder
      .addCase(signInCook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInCook.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          console.log("Cook token", action.payload.cook_token);
          state.cookToken = action.payload.cook_token;
          state.error = null;
          localStorage.setItem("cook_token", action.payload.cook_token);
        } else {
          state.cookToken = null;
          state.error = action.payload.message || "Authentication failed";
          localStorage.removeItem("cook_token");
        }
      })
      .addCase(signInCook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sign Up Cases
    builder
      .addCase(signUpCook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpCook.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signUpCook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Profile Cases
    builder
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, logout } = cookSlice.actions;
export default cookSlice.reducer;
