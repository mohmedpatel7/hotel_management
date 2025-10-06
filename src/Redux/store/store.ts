import { configureStore } from "@reduxjs/toolkit";
import Manager from "../slices/Manager";
import Foodlist from "../slices/Foodlist";

// Create the Redux store and add the auth reducer
export const store = configureStore({
  reducer: {
    manager: Manager,
    foodlist: Foodlist,
  },
});

// Export types for use in the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
