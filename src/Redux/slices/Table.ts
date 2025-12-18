import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Define the base URL for the API
const BASE_URL = "/api/table";

interface Table {
  _id: string;
  status: string;
  number: number;
}

interface TableState {
  tables: Table[];
  loading: boolean;
  error: string | null;
}

const initialState: TableState = {
  tables: [],
  loading: false,
  error: null,
};

// Thunk for creating a table
export const createTable = createAsyncThunk<
  { table: Table },
  { status: string; number: number },
  { rejectValue: { message: string } }
>("table/createTable", async (tableData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/createTable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        manager_token: localStorage.getItem("manager_token") || "",
      },
      body: JSON.stringify(tableData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData);
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

// Thunk for fetching tables
export const fetchTables = createAsyncThunk<
  { tables: Table[] },
  void,
  { rejectValue: { message: string } }
>("table/fetchTables", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/createTable`, {
      method: "GET",
      headers: {
        manager_token: localStorage.getItem("manager_token") || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData);
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

// Thunk for updating table status
export const updateTableStatus = createAsyncThunk<
  { table: Table },
  { id: string; status: string },
  { rejectValue: { message: string } }
>("table/updateTableStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/updateStatus/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        weater_token: localStorage.getItem("weater_token") || "",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData);
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

// Thunk for deleting a table
export const deleteTable = createAsyncThunk<
  { table: Table },
  string,
  { rejectValue: { message: string } }
>("table/deleteTable", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BASE_URL}/createTable/${id}`, {
      method: "DELETE",
      headers: {
        manager_token: localStorage.getItem("manager_token") || "",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(errorData);
    }

    return await response.json();
  } catch (error) {
    return rejectWithValue({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create Table
    builder
      .addCase(createTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.loading = false;
        state.tables.push(action.payload.table);
      })
      .addCase(createTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create table";
      });

    // Fetch Tables
    builder
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = action.payload.tables;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch tables";
      });

    // Update Table Status
    builder
      .addCase(updateTableStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tables.findIndex(
          (table) => table._id === action.payload.table._id
        );
        if (index !== -1) {
          state.tables[index] = action.payload.table;
        }
      })
      .addCase(updateTableStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update table status";
      });

    // Delete Table
    builder
      .addCase(deleteTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = state.tables.filter(
          (table) => table._id !== action.payload.table._id
        );
      })
      .addCase(deleteTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete table";
      });
  },
});

export default tableSlice.reducer;
