import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to update bill status
export const updateBillStatus = createAsyncThunk(
  "bills/updateStatus",
  async (
    { billId, status }: { billId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("manager_token");
      if (!token) {
        return rejectWithValue("Authorization Failed !");
      }

      const response = await fetch("/api/bills/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          manager_token: token,
        },
        body: JSON.stringify({ billId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || "Internal Server Error !");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error || "Internal Server Error !");
    }
  }
);

// Slice
const billSlice = createSlice({
  name: "bills",
  initialState: {
    loading: false,
    error: null as string | null,
    message: null as string | null,
  },
  reducers: {
    resetBillState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateBillStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateBillStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(updateBillStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetBillState } = billSlice.actions;
export default billSlice.reducer;
