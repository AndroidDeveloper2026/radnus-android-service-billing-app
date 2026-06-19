// src/store/slices/jobSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// ─── Existing Thunks ──────────────────────────────────────────────────────
export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async filters => {
  return await api.getJobs(filters);
});

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id, { getState }) => {
    const state = getState();
    const existingJob = state.jobs.list.find(job => job.id === id);
    if (existingJob) {
      return existingJob;
    }
    return await api.getJobById(id);
  },
);

export const createJob = createAsyncThunk('jobs/createJob', async jobData => {
  return await api.createJob(jobData);
});

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, data }) => {
    return await api.updateJob(id, data);
  },
);

export const deleteJob = createAsyncThunk('jobs/deleteJob', async id => {
  await api.deleteJob(id);
  return id;
});

// ─── NEW: Status Update ────────────────────────────────────────────────────
export const updateJobStatus = createAsyncThunk(
  'jobs/updateStatus',
  async ({ id, status, updatedBy }) => {
    return await api.updateJobStatus(id, status, updatedBy);
  },
);

// ─── NEW: Repair Steps ────────────────────────────────────────────────────
export const addRepairStep = createAsyncThunk(
  'jobs/addStep',
  async ({ id, step, note, completedBy }) => {
    return await api.addRepairStep(id, step, note, completedBy);
  },
);

export const toggleRepairStep = createAsyncThunk(
  'jobs/toggleStep',
  async ({ id, stepId, done, completedBy }) => {
    return await api.toggleRepairStep(id, stepId, done, completedBy);
  },
);

export const deleteRepairStep = createAsyncThunk(
  'jobs/deleteStep',
  async ({ id, stepId }) => {
    return await api.deleteRepairStep(id, stepId);
  },
);

// ─── NEW: Transfer ────────────────────────────────────────────────────────
export const transferJob = createAsyncThunk(
  'jobs/transfer',
  async ({ id, from, to, note }) => {
    return await api.transferJob(id, from, to, note);
  },
);

// ─── NEW: Invoice ──────────────────────────────────────────────────────────
export const lockInvoice = createAsyncThunk('jobs/lockInvoice', async id => {
  return await api.lockInvoice(id);
});

// ─── NEW: Cancel ──────────────────────────────────────────────────────────
export const cancelJob = createAsyncThunk(
  'jobs/cancel',
  async ({ id, cancelRemarks, cancelledBy }) => {
    return await api.cancelJob(id, cancelRemarks, cancelledBy);
  },
);

// ─── NEW: Rebill ──────────────────────────────────────────────────────────
export const rebillJob = createAsyncThunk(
  'jobs/rebill',
  async ({ id, rebilledBy }) => {
    return await api.rebillJob(id, rebilledBy);
  },
);

// ─── NEW: Update Spares ────────────────────────────────────────────────────
export const updateSpares = createAsyncThunk(
  'jobs/updateSpares',
  async ({ id, spareItems }) => {
    return await api.updateSpares(id, spareItems);
  },
);

// ─── Slice ──────────────────────────────────────────────────────────────────
const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    list: [],
    currentJob: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      status: 'All Status',
      fromDate: '',
      toDate: '',
      engineerId: '',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentJob: state => {
      state.currentJob = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Fetch Job By ID
      .addCase(fetchJobById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create Job
      .addCase(createJob.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.currentJob = action.payload;
      })
      // Update Job
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
      })
      // Delete Job
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.list = state.list.filter(j => j.id !== action.payload);
      })
      // ─── NEW: Update Status ──────────────────────────────────────────────
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
      })
      // ─── NEW: Add Repair Step ────────────────────────────────────────────
      .addCase(addRepairStep.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      // ─── NEW: Toggle Repair Step ─────────────────────────────────────────
      .addCase(toggleRepairStep.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      // ─── NEW: Delete Repair Step ─────────────────────────────────────────
      .addCase(deleteRepairStep.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      // ─── NEW: Transfer ────────────────────────────────────────────────────
      .addCase(transferJob.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      // ─── NEW: Lock Invoice ───────────────────────────────────────────────
      .addCase(lockInvoice.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      // ─── NEW: Cancel ─────────────────────────────────────────────────────
      .addCase(cancelJob.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      // ─── NEW: Rebill ─────────────────────────────────────────────────────
      .addCase(rebillJob.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })

      // Add to extraReducers:
      .addCase(updateSpares.fulfilled, (state, action) => {
        if (state.currentJob?.id === action.payload.id)
          state.currentJob = action.payload;
        const index = state.list.findIndex(j => j.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      });
  },
});

export const { setFilters, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
