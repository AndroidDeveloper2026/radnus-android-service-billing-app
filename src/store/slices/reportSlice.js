import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// ─── Date Formatter ───────────────────────────────────────────────────────────
const formatDate = (value) => {
  if (!value || value === null || value === undefined) return '-';
  
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
  }
  
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined' || str === 'NaN' || str === 'Invalid Date') return '-';

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  } catch (e) {
    console.warn('Date parsing failed for:', str);
  }

  return str;
};

const safeNum = (val) => {
  if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return 0;
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

const safeStr = (val, fallback = '-') => {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val)) {
    const filtered = val.filter(v => v && v !== 'null' && v !== 'undefined');
    return filtered.length ? filtered.join(', ') : fallback;
  }
  const s = String(val).trim();
  if (!s || s === 'null' || s === 'undefined' || s === 'NaN' || s === 'nan') return fallback;
  return s;
};

// ─── Engineer-wise Report ──────────────────────────────────────────────────
export const fetchEngineerWiseReport = createAsyncThunk(
  'reports/engineerWise',
  async ({ fromDate, toDate, status } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      if (status && status !== 'All Status') filters.status = status;
      
      console.log('[EngineerReport] Fetching jobs with filters:', filters);
      const jobs = await api.getJobs(filters);
      console.log('[EngineerReport] Jobs count:', jobs.length);
      
      const engineers = await api.getEngineers();
      console.log('[EngineerReport] Engineers count:', engineers.length);
      
      // Group jobs by engineer
      const report = engineers.map(eng => ({
        engineer: eng.name,
        jobs: jobs.filter(j => j.engineerId === eng.name || j.engineer === eng.name),
      }));
      
      const noEngineerJobs = jobs.filter(j => 
        !j.engineerId || j.engineerId === '-' || j.engineerId === '' || !j.engineer
      );
      
      console.log('[EngineerReport] Report sections:', report.length);
      console.log('[EngineerReport] Unassigned jobs:', noEngineerJobs.length);
      
      return { engineerReport: report, noEngineerJobs };
    } catch (error) {
      console.error('[EngineerReport] Error:', error);
      return { engineerReport: [], noEngineerJobs: [] };
    }
  }
);

// ─── Value Report ──────────────────────────────────────────────────────────
export const fetchValueReport = createAsyncThunk(
  'reports/value',
  async ({ fromDate, toDate, engineerId } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      if (engineerId) filters.engineerId = engineerId;
      
      console.log('[ValueReport] Fetching jobs with filters:', filters);
      const jobs = await api.getJobs(filters);
      console.log('[ValueReport] Jobs count:', jobs.length);
      
      return jobs.map(job => {
        const serviceCharges = job.serviceCharges || job.service?.serviceCharge || 0;
        const spareCharges = job.spareCharges || job.service?.spareCharge || 0;
        
        return {
          jobNo: job.jobNo || job.jobSheetNo || '-',
          name: job.customerName || job.customer?.name || '-',
          received: job.savedDate ? formatDate(job.savedDate) : (job.createdAt ? formatDate(job.createdAt) : '-'),
          repaired: job.repairedDate ? formatDate(job.repairedDate) : (job.service?.repairDate ? formatDate(job.service.repairDate) : '-'),
          delivered: job.deliveredDate ? formatDate(job.deliveredDate) : (job.service?.deliveryDate ? formatDate(job.service.deliveryDate) : '-'),
          service: serviceCharges,
          spare: spareCharges,
          total: serviceCharges + spareCharges,
        };
      });
    } catch (error) {
      console.error('[ValueReport] Error:', error);
      return [];
    }
  }
);

// ─── Spare Parts Report ────────────────────────────────────────────────────
export const fetchSpareReport = createAsyncThunk(
  'reports/spare',
  async ({ engineerId, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      if (engineerId) filters.engineerId = engineerId;
      
      console.log('[SpareReport] Fetching jobs with filters:', filters);
      const jobs = await api.getJobs(filters);
      console.log('[SpareReport] Jobs count:', jobs.length);
      
      const spareItems = [];
      
      jobs.forEach(job => {
        const spareItemsList = job.spareItems || [];
        
        if (spareItemsList && spareItemsList.length) {
          spareItemsList.forEach(item => {
            const qty = safeNum(item.qty || item.quantity);
            const rate = safeNum(item.rate || item.price);
            const amount = safeNum(item.amount) || (qty * rate);
            
            spareItems.push({
              jobSheet: job.jobNo || job.jobSheetNo || '-',
              spare: safeStr(item.name || item.spareName || item.partName || 'Unknown'),
              qty: qty,
              rate: rate,
              amount: amount,
            });
          });
        }
      });
      
      console.log('[SpareReport] Spare items count:', spareItems.length);
      return spareItems;
    } catch (error) {
      console.error('[SpareReport] Error:', error);
      return [];
    }
  }
);

// ─── Dealer Report ─────────────────────────────────────────────────────────
export const fetchDealerReport = createAsyncThunk(
  'reports/dealer',
  async ({ dealerName, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      console.log('[DealerReport] Fetching jobs with filters:', filters);
      let jobs = await api.getJobs(filters);
      console.log('[DealerReport] Jobs count:', jobs.length);
      
      if (dealerName) {
        jobs = jobs.filter(job => 
          (job.dealerName || job.dealer || '').toLowerCase().includes(dealerName.toLowerCase())
        );
        console.log('[DealerReport] Filtered jobs count:', jobs.length);
      }
      
      return jobs;
    } catch (error) {
      console.error('[DealerReport] Error:', error);
      return [];
    }
  }
);

// ─── Daily Summary Report ──────────────────────────────────────────────────
export const fetchDailySummary = createAsyncThunk(
  'reports/dailySummary',
  async ({ type, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      console.log('[DailySummary] Fetching jobs with filters:', filters);
      const jobs = await api.getJobs(filters);
      console.log('[DailySummary] Jobs count:', jobs.length);
      
      const grouped = {};

      jobs.forEach(job => {
        let dateKey = null;
        
        if (type === 'received') {
          dateKey = job.savedDate ? formatDate(job.savedDate) : (job.createdAt ? formatDate(job.createdAt) : null);
        } else if (type === 'delivered') {
          dateKey = job.deliveredDate ? formatDate(job.deliveredDate) : (job.service?.deliveryDate ? formatDate(job.service.deliveryDate) : null);
        } else if (type === 'repaired') {
          dateKey = job.repairedDate ? formatDate(job.repairedDate) : (job.service?.repairDate ? formatDate(job.service.repairDate) : null);
        }

        if (dateKey && dateKey !== '-') {
          grouped[dateKey] = (grouped[dateKey] || 0) + 1;
        }
      });

      const summary = Object.entries(grouped).map(([date, count]) => ({ date, count }));
      
      // Sort by actual date value
      summary.sort((a, b) => {
        const parseDate = (s) => {
          if (!s || s === '-') return new Date(0);
          const parts = s.split('/');
          if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
          }
          return new Date(s);
        };
        return parseDate(a.date) - parseDate(b.date);
      });
      
      console.log('[DailySummary] Summary count:', summary.length);
      return summary;
    } catch (error) {
      console.error('[DailySummary] Error:', error);
      return [];
    }
  }
);

// ─── Pending Reports ───────────────────────────────────────────────────────
export const fetchPendingReport = createAsyncThunk(
  'reports/pending',
  async ({ type, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      console.log('[PendingReport] Fetching jobs with filters:', filters);
      const jobs = await api.getJobs(filters);
      console.log('[PendingReport] Jobs count:', jobs.length);
      
      let filteredJobs = [];
      
      if (type === 'repairPending') {
        filteredJobs = jobs.filter(job => {
          const status = (job.status || job.jobStatus || '').toLowerCase();
          return status === 'received' || status === 'pending';
        });
      } else if (type === 'deliveryPending') {
        filteredJobs = jobs.filter(job => {
          const status = (job.status || job.jobStatus || '').toLowerCase();
          const deliveredDate = job.deliveredDate || job.service?.deliveryDate;
          return status === 'repaired' || (status === 'pending' && (!deliveredDate || deliveredDate === '-'));
        });
      }
      
      console.log('[PendingReport] Filtered jobs count:', filteredJobs.length);
      return filteredJobs;
    } catch (error) {
      console.error('[PendingReport] Error:', error);
      return [];
    }
  }
);

// ─── Delivered NR/NA Report ────────────────────────────────────────────────
export const fetchDeliveredNRNAReport = createAsyncThunk(
  'reports/deliveredNRNA',
  async ({ fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      console.log('[NRNAReport] Fetching jobs with filters:', filters);
      const jobs = await api.getJobs(filters);
      console.log('[NRNAReport] Jobs count:', jobs.length);
      
      const filteredJobs = jobs.filter(job => {
        const status = (job.status || job.jobStatus || '').toLowerCase();
        const physicalConditions = job.physicalConditions || job.physicalCondition || [];
        
        // Check if physical conditions contain NR/NA
        let hasNRNA = false;
        if (Array.isArray(physicalConditions)) {
          hasNRNA = physicalConditions.some(cond => 
            cond?.toUpperCase()?.includes('NR') || cond?.toUpperCase()?.includes('NA')
          );
        } else if (typeof physicalConditions === 'string') {
          hasNRNA = physicalConditions.toUpperCase().includes('NR') || physicalConditions.toUpperCase().includes('NA');
        }
        
        return status === 'delivered' && hasNRNA;
      });
      
      console.log('[NRNAReport] Filtered jobs count:', filteredJobs.length);
      return filteredJobs;
    } catch (error) {
      console.error('[NRNAReport] Error:', error);
      return [];
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────
const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    engineerReport: [],
    noEngineerJobs: [],
    valueReport: [],
    spareReport: [],
    dealerReport: [],
    dailySummary: [],
    pendingReport: [],
    deliveredNRNA: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearReports: (state) => {
      state.engineerReport = [];
      state.noEngineerJobs = [];
      state.valueReport = [];
      state.spareReport = [];
      state.dealerReport = [];
      state.dailySummary = [];
      state.pendingReport = [];
      state.deliveredNRNA = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pendingState = (state) => {
      state.loading = true;
      state.error = null;
    };
    
    const rejectedState = (state, action) => {
      state.loading = false;
      state.error = action.error?.message || 'An error occurred';
    };

    builder
      .addCase(fetchEngineerWiseReport.pending, pendingState)
      .addCase(fetchEngineerWiseReport.rejected, rejectedState)
      .addCase(fetchEngineerWiseReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.engineerReport = payload.engineerReport;
        state.noEngineerJobs = payload.noEngineerJobs;
      })

      .addCase(fetchValueReport.pending, pendingState)
      .addCase(fetchValueReport.rejected, rejectedState)
      .addCase(fetchValueReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.valueReport = payload;
      })

      .addCase(fetchSpareReport.pending, pendingState)
      .addCase(fetchSpareReport.rejected, rejectedState)
      .addCase(fetchSpareReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.spareReport = payload;
      })

      .addCase(fetchDealerReport.pending, pendingState)
      .addCase(fetchDealerReport.rejected, rejectedState)
      .addCase(fetchDealerReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.dealerReport = payload;
      })

      .addCase(fetchDailySummary.pending, pendingState)
      .addCase(fetchDailySummary.rejected, rejectedState)
      .addCase(fetchDailySummary.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.dailySummary = payload;
      })

      .addCase(fetchPendingReport.pending, pendingState)
      .addCase(fetchPendingReport.rejected, rejectedState)
      .addCase(fetchPendingReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.pendingReport = payload;
      })

      .addCase(fetchDeliveredNRNAReport.pending, pendingState)
      .addCase(fetchDeliveredNRNAReport.rejected, rejectedState)
      .addCase(fetchDeliveredNRNAReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.deliveredNRNA = payload;
      });
  },
});

export const { clearReports } = reportSlice.actions;
export default reportSlice.reducer;