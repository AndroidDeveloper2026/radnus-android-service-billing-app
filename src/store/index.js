// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import jobReducer from './slices/jobSlice';
import adminReducer from './slices/adminSlice';
import reportReducer from './slices/reportSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    jobs: jobReducer,
    admin: adminReducer,
    reports: reportReducer,
    users: userReducer,
  },
});