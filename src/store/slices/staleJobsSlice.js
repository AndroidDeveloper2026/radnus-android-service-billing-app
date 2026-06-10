// src/store/slices/staleJobsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api'; // Import your existing api client

export const fetchStaleJobs = createAsyncThunk(
  'staleJobs/fetch',
  async ({ days = 3 } = {}, { rejectWithValue }) => {
    try {
      console.log(`Fetching stale jobs with days: ${days}`);
      
      // Use your existing api client with proper base URL and auth
      const response = await api.getStaleJobs({ days });
      
      return response;
    } catch (error) {
      console.error('Failed to fetch stale jobs:', error.message);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return rejectWithValue(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        // The request was made but no response was received
        return rejectWithValue('Cannot connect to server. Check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        return rejectWithValue(error.message);
      }
    }
  }
);

const staleJobsSlice = createSlice({
  name: 'staleJobs',
  initialState: {
    jobs: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearStaleJobs: (state) => {
      state.jobs = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaleJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
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