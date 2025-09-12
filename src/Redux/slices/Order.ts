import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface Order {
  _id: string;
  foodId: string;
  quntity: "half" | "full";
  price: number;
  weaterId: string;
  tableNo: number;
  status: "pending" | "completed" | "cancelled";
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

// Create new order
export const createOrder = createAsyncThunk<
  Order,
  Omit<Order, "_id" | "status">,
  { rejectValue: string }
>("order/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || "Failed to create order");
    }
    const data = await response.json();
    return data.order;
  } catch (error) {
    return rejectWithValue("Network error");
  }
});

// Fetch all orders
export const fetchOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("order/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/order");
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || "Failed to fetch orders");
    }
    const data = await response.json();
    return data.response;
  } catch (error) {
    return rejectWithValue("Network error");
  }
});

// Fetch single order by ID
export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("order/fetchOrderById", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/order/${id}`);
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || "Failed to fetch order");
    }
    const data = await response.json();
    return data.response;
  } catch (error) {
    return rejectWithValue("Network error");
  }
});

// Update order status
export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: string },
  { rejectValue: string }
>("order/updateOrderStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await fetch(`/api/order/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      return rejectWithValue(error.message || "Failed to update order status");
    }
    const data = await response.json();
    return data.response;
  } catch (error) {
    return rejectWithValue("Network error");
  }
});

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create order cases
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create order";
      })
      // Fetch orders cases
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch orders";
      })
      // Fetch order by ID cases
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch order";
      })
      // Update order status cases
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const order = state.orders.find((o) => o._id === action.payload._id);
        if (order) {
          order.status = action.payload.status;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update order status";
      });
  },
});

export default orderSlice.reducer;
