import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import authReducer from "../features/auth/authSlice";
import employeeReducer from "../features/employees/employeeSlice";
import settingsReducer from "../features/settings/settingSlice";
import loaderReducer from "../features/loader/loaderSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    employees: employeeReducer,
    settings: settingsReducer,
    loader: loaderReducer,
  },
});
