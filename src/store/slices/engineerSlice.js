// src/store/slices/engineerSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchEngineerJobs = createAsyncThunk(
  'engineer/fetchJobs',
  async (engineerName, { rejectWithValue }) => {
    try {
      const jobs = await api.getJobs({ engineer: engineerName });
      return jobs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateJobStatus = createAsyncThunk(
  'engineer/updateStatus',
  async ({ jobId, status, updatedBy }, { rejectWithValue }) => {
    try {
      const updatedJob = await api.updateJobStatus(jobId, status, updatedBy);
      return updatedJob;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addRepairStep = createAsyncThunk(
  'engineer/addStep',
  async ({ jobId, step, note, completedBy }, { rejectWithValue }) => {
    try {
      const updatedJob = await api.addRepairStep(jobId, step, note, completedBy);
      return updatedJob;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleRepairStep = createAsyncThunk(
  'engineer/toggleStep',
  async ({ jobId, stepId, done, completedBy }, { rejectWithValue }) => {
    try {
      const updatedJob = await api.toggleRepairStep(jobId, stepId, done, completedBy);
      return updatedJob;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRepairStep = createAsyncThunk(
  'engineer/deleteStep',
  async ({ jobId, stepId }, { rejectWithValue }) => {
    try {
      const updatedJob = await api.deleteRepairStep(jobId, stepId);
      return updatedJob;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const transferJob = createAsyncThunk(
  'engineer/transferJob',
  async ({ jobId, from, to, note }, { rejectWithValue }) => {
    try {
      const updatedJob = await api.transferJob(jobId, from, to, note);
      return { jobId, updatedJob };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWorkload = createAsyncThunk(
  'engineer/fetchWorkload',
  async (_, { rejectWithValue }) => {
    try {
      const workload = await api.getWorkload();
      return workload;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  jobs: [],
  workload: [],
  loading: false,
  updating: null,
  stepLoading: null,
  transferLoading: false,
  error: null,
  searchQuery: '',
  expandedJobId: null,
};

const engineerSlice = createSlice({
  name: 'engineer',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setExpandedJob: (state, action) => {
      state.expandedJobId = state.expandedJobId === action.payload ? null : action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchEngineerJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEngineerJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchEngineerJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Status
      .addCase(updateJobStatus.pending, (state, action) => {
        state.updating = action.meta.arg.jobId;
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.updating = null;
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(updateJobStatus.rejected, (state) => {
        state.updating = null;
      })
      
      // Add Step
      .addCase(addRepairStep.pending, (state, action) => {
        state.stepLoading = action.meta.arg.jobId;
      })
      .addCase(addRepairStep.fulfilled, (state, action) => {
        state.stepLoading = null;
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      
      // Toggle Step
      .addCase(toggleRepairStep.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      
      // Delete Step
      .addCase(deleteRepairStep.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(job => job.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      
      // Transfer Job
      .addCase(transferJob.pending, (state) => {
        state.transferLoading = true;
      })
      .addCase(transferJob.fulfilled, (state, action) => {
        state.transferLoading = false;
        state.jobs = state.jobs.filter(job => job.id !== action.payload.jobId);
      })
      
      // Fetch Workload
      .addCase(fetchWorkload.fulfilled, (state, action) => {
        state.workload = action.payload;
      });
  },
});

export const { setSearchQuery, setExpandedJob, clearError } = engineerSlice.actions;
export default engineerSlice.reducer;