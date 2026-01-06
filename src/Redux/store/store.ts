import { configureStore } from "@reduxjs/toolkit";
import Manager from "../slices/Manager";
import Foodlist from "../slices/Foodlist";
import Table from "../slices/Table";
import Bill from "../slices/Bill";
import Order from "../slices/Order";
import Cook from "../slices/Cook";
import Waiter from "../slices/Waiter";

// Create the Redux store and add the auth reducer
export const store = configureStore({
  reducer: {
    manager: Manager,
    foodlist: Foodlist,
    table: Table,
    bills: Bill,
    order: Order,
    cook: Cook,
    waiter: Waiter,
  },
});

// Export types for use in the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
