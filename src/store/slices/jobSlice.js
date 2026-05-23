// src/store/slices/jobSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (filters) => {
  return await api.getJobs(filters);
});

export const fetchJobById = createAsyncThunk('jobs/fetchJobById', async (id) => {
  return await api.getJobById(id);
});

export const createJob = createAsyncThunk('jobs/createJob', async (jobData) => {
  return await api.createJob(jobData);
});

export const updateJob = createAsyncThunk('jobs/updateJob', async ({ id, data }) => {
  return await api.updateJob(id, data);
});

export const deleteJob = createAsyncThunk('jobs/deleteJob', async (id) => {
  await api.deleteJob(id);
  return id;
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    list: [],
    currentJob: null,
    loading: false,
    error: null,
    filters: { search: '', status: 'All Status', fromDate: '', toDate: '', engineerId: '' },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.currentJob = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.currentJob?.id === action.payload.id) state.currentJob = action.payload;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.list = state.list.filter(j => j.id !== action.payload);
      });
  },
});

export const { setFilters, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;