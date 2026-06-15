// src/store/slices/staleJobsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchStaleJobs = createAsyncThunk(
  'staleJobs/fetch',
  async ({ days = 3 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.getStaleJobs({ days });
      return response;
    } catch (error) {
      console.error('Failed to fetch stale jobs:', error.message);
      if (error.response) {
        return rejectWithValue(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        return rejectWithValue('Cannot connect to server. Check your network connection.');
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const staleJobsSlice = createSlice({
  name: 'staleJobs',
  initialState: { jobs: [], loading: false, error: null },
  reducers: {
    clearStaleJobs: (state) => { state.jobs = []; state.loading = false; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaleJobs.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStaleJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch stale jobs';
      })
      .addCase(fetchStaleJobs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.jobs = payload || [];
        state.error = null;
      });
  },
});

export const { clearStaleJobs } = staleJobsSlice.actions;
export default staleJobsSlice.reducer;
