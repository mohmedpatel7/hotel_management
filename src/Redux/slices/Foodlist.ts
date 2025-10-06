import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Define TypeScript interfaces for better type safety
interface FoodItem {
  id: string;
  type: string;
  status: "available" | "unavailable";
  category: string;
  foodName: string;
  halfPrice?: string;
  fullPrice: string;
  foodImage: string;
}

interface FoodState {
  foodItems: FoodItem[];
  selectedFood: FoodItem | null;
  loading: boolean;
  error: string | null;
}

// Initial state with proper typing
const initialState: FoodState = {
  foodItems: [],
  selectedFood: null,
  loading: false,
  error: null,
};

// Async thunk for adding new food item
export const addFoodItem = createAsyncThunk(
  "food/addFoodItem",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/foodlist/addFood", {
        method: "POST",
        headers: {
          manager_token: localStorage.getItem("manager_token") || "",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Async thunk for fetching food list
export const getFoodList = createAsyncThunk(
  "food/getFoodList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/foodlist/addFood", {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Async thunk for fetching single food item
export const getFoodItem = createAsyncThunk(
  "food/getFoodItem",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/foodlist/addFood/${id}`, {
        method: "GET",
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Async thunk for updating food status
export const updateFoodStatus = createAsyncThunk(
  "food/updateFoodStatus",
  async (
    { id, status }: { id: string; status: "available" | "unavailable" },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/foodlist/addFood/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          cook_token: localStorage.getItem("cook_token") || "",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Async thunk for updating food info (prices, type, category, foodName, image)
export const updateFoodInfo = createAsyncThunk(
  "food/updateFoodInfo",
  async (
    {
      id,
      type,
      category,
      foodName,
      halfPrice,
      fullPrice,
      foodImage,
    }: {
      id: string;
      type?: string;
      category?: string;
      foodName?: string;
      halfPrice?: string;
      fullPrice?: string;
      foodImage?: File | null;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      if (type) formData.append("type", type);
      if (category) formData.append("category", category);
      if (foodName) formData.append("foodName", foodName);
      if (halfPrice !== undefined) formData.append("halfPrice", halfPrice);
      if (fullPrice) formData.append("fullPrice", fullPrice);
      if (foodImage) formData.append("foodImage", foodImage);

      const response = await fetch(`/api/foodlist/addFood/${id}`, {
        method: "PUT",
        headers: {
          manager_token: localStorage.getItem("manager_token") || "",
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("An unknown error occurred");
    }
  }
);

// Create the food slice
const foodSlice = createSlice({
  name: "food",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Add food item cases
    builder
      .addCase(addFoodItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFoodItem.fulfilled, (state, action) => {
        state.loading = false;
        state.foodItems.push(action.payload.newFoodItem);
      })
      .addCase(addFoodItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get food list cases
      .addCase(getFoodList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFoodList.fulfilled, (state, action) => {
        state.loading = false;
        state.foodItems = action.payload.foodItems;
      })
      .addCase(getFoodList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get single food item cases
      .addCase(getFoodItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFoodItem.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFood = action.payload.food;
      })
      .addCase(getFoodItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update food status cases
      .addCase(updateFoodStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFoodStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFood = action.payload.food;
        const index = state.foodItems.findIndex(
          (item) => item.id === updatedFood.id
        );
        if (index !== -1) {
          state.foodItems[index] = updatedFood;
        }
        if (state.selectedFood?.id === updatedFood.id) {
          state.selectedFood = updatedFood;
        }
      })
      .addCase(updateFoodStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update food prices cases
      .addCase(updateFoodInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFoodInfo.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFood = action.payload.updatePrice;
        const index = state.foodItems.findIndex(
          (item) => item.id === updatedFood.id
        );
        if (index !== -1) {
          state.foodItems[index] = updatedFood;
        }
        if (state.selectedFood?.id === updatedFood.id) {
          state.selectedFood = updatedFood;
        }
      })
      .addCase(updateFoodInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default foodSlice.reducer;
