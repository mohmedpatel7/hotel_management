import { configureStore } from "@reduxjs/toolkit";

// Create the Redux store and add the auth reducer
export const store = configureStore({
  reducer: {},
});

// Export types for use in the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
