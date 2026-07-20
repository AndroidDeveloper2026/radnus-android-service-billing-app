// src/store/slices/myReportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// ─── Fetch My Report ──────────────────────────────────────────────────────
// username is passed in from the screen (via useAuth()) instead of the
// slice trying to fetch it itself with api.getCurrentUser(), which doesn't
// exist in utils/api.js — that was the original crash.
//
// Every external call below is guarded so a missing/renamed function in
// utils/api.js produces a clear rejected-state message on screen instead
// of an uncaught "X is not a function" crash.
export const fetchMyReport = createAsyncThunk(
  'myReport/fetch',
  async ({ fromDate, toDate, search, username } = {}, { rejectWithValue }) => {
    try {
      // Prefer the username passed in from the screen (from useAuth()).
      // Fall back to api.getCurrentUser(), which reads the logged-in user
      // straight from AsyncStorage and is known to work.
      if (!username) {
        try {
          const currentUser = await api.getCurrentUser();
          username = currentUser?.username || '';
        } catch (e) {
          // ignore, handled by the check below
        }
      }

      if (!username) {
        return rejectWithValue(
          'Could not detect the logged-in username. Please log out and log back in.'
        );
      }

      if (typeof api?.getJobs !== 'function') {
        return rejectWithValue(
          'api.getJobs is not available in utils/api.js — check the export name.'
        );
      }

      // Build filters
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;

      // Fetch all jobs with filters
      let jobs;
      try {
        jobs = await api.getJobs(filters);
      } catch (apiErr) {
        return rejectWithValue(apiErr?.message || 'Failed to load jobs from server');
      }

      if (!Array.isArray(jobs)) jobs = [];

      // Filter jobs created by current user
      const myJobs = jobs.filter(job => {
        const createdBy = job?.createdBy?.username || job?.createdBy || '';
        return String(createdBy).toLowerCase() === username.toLowerCase();
      });

      // Optional client-side search on job sheet number / customer name
      const q = (search || '').toLowerCase().trim();
      const searched = q
        ? myJobs.filter(job => {
            const jobSheetNo = (job?.jobSheetNo || '').toLowerCase();
            const customerName = (job?.customer?.name || '').toLowerCase();
            return jobSheetNo.includes(q) || customerName.includes(q);
          })
        : myJobs;

      // Group by user (though it's just one user)
      const grouped = {};
      if (searched.length > 0) {
        grouped[username] = searched;
      }

      return {
        grouped,
        jobs: searched,
        username,
        totalJobs: searched.length,
      };
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch report');
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────
const initialState = {
  grouped: {},
  jobs: [],
  username: '',
  totalJobs: 0,
  loading: false,
  error: null,
  view: 'table', // 'table' | 'dashboard'
  searchQuery: '',
  fromDate: '',
  toDate: '',
  expandedUser: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────
const myReportSlice = createSlice({
  name: 'myReport',
  initialState,
  reducers: {
    setView: (state, action) => {
      state.view = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setFromDate: (state, action) => {
      state.fromDate = action.payload;
    },
    setToDate: (state, action) => {
      state.toDate = action.payload;
    },
    toggleExpanded: (state, action) => {
      state.expandedUser = state.expandedUser === action.payload ? null : action.payload;
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.fromDate = '';
      state.toDate = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.grouped = action.payload?.grouped || {};
        state.jobs = action.payload?.jobs || [];
        state.username = action.payload?.username || '';
        state.totalJobs = action.payload?.totalJobs || 0;
        state.error = null;
      })
      .addCase(fetchMyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch report';
      });
  },
});

export const {
  setView,
  setSearchQuery,
  setFromDate,
  setToDate,
  toggleExpanded,
  clearFilters,
  clearError,
} = myReportSlice.actions;

export default myReportSlice.reducer;