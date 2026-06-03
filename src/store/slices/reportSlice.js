import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ─── Date Formatter ───────────────────────────────────────────────────────────
const formatDate = (value) => {
  if (value === null || value === undefined) return '-';
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined' || str === 'NaN') return '-';

  // Already formatted: 1/6/2026
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;

  // ISO / timestamp: 2026-06-01T00:00:00.000Z  or  2026-06-01
  if (/^\d{4}-\d{2}-\d{2}/.test(str) || /^\d{10,}$/.test(str)) {
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return str;
    }
  }

  // Generic parse
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    }
  } catch {}

  return str;
};

/** Returns 0 for null / undefined / NaN. */
const safeNum = (val) => {
  if (val === null || val === undefined || val === '' || val === 'null') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

/** Returns fallback for null / undefined / 'null' / 'NaN'. */
const safeStr = (val, fallback = '-') => {
  if (val === null || val === undefined) return fallback;
  if (Array.isArray(val)) {
    return val.filter(Boolean).join(', ') || fallback;
  }
  const s = String(val).trim();
  if (!s || s === 'null' || s === 'undefined' || s === 'NaN' || s === 'nan') return fallback;
  return s;
};

/**
 * Normalises a raw job object from the API so every field the UI needs
 * is guaranteed to exist, be the right type, and never be NaN or a raw ISO date.
 */
const normaliseJob = (job) => {
  if (!job) return {};
  
  // Handle nested objects
  const customer = job.customer || {};
  const device = job.device || {};
  const service = job.service || {};
  const createdBy = job.createdBy || {};
  
  return {
    // ── identifiers
    id:             job.id          ?? job._id          ?? '',
    jobNo:          safeStr(job.jobSheetNo ?? job.jobNo ?? job.JobNo ?? job.job_no ?? job.jobNumber),
    customerName:   safeStr(customer.name ?? job.customerName ?? job.CustomerName ?? job.customer_name ?? job.name),
    contact:        safeStr(customer.contact ?? job.contact ?? job.Contact ?? job.phone ?? job.mobile),
    altContact:     safeStr(customer.altContact ?? job.altContact ?? job.AltContact ?? job.alternateContact, '-'),
    // ── device
    makeId:         safeStr(device.make ?? job.makeId ?? job.Make ?? job.make ?? job.brand),
    modelId:        safeStr(device.model ?? job.modelId ?? job.Model ?? job.model ?? job.deviceModel),
    imei:           safeStr(device.imei ?? job.imei ?? job.IMEI ?? job.serial ?? job.serialNo),
    warranty:       safeStr(device.warranty ?? job.warranty ?? job.Warranty ?? job.warrantyStatus, 'No Warranty'),
    // ── assignment
    status:         safeStr(device.mobileStatus ?? job.status ?? job.Status ?? job.jobStatus),
    engineerId:     safeStr(service.engineer ?? job.engineerId ?? job.Engineer ?? job.engineer ?? job.technician, '-'),
    dealerName:     safeStr(service.dealer ?? job.dealerName ?? job.Dealer ?? job.dealer ?? job.dealerId, '-'),
    drawerId:       safeStr(service.drawer ?? job.drawerId ?? job.Drawer ?? job.drawer ?? job.drawerName, 'Booking'),
    // ── charges (always numbers)
    serviceCharges: safeNum(service.serviceCharge ?? job.serviceCharges ?? job.ServiceCharges ?? job.service_charges ?? job.serviceCharge ?? job.service ?? job.svcCharges),
    spareCharges:   safeNum(service.spareCharge ?? job.spareCharges ?? job.SpareCharges ?? job.spare_charges ?? job.spareCharge ?? job.spare ?? job.partCharges),
    // ── payment / condition
    paymentMode:    safeStr(service.paymentMode ?? job.paymentMode ?? job.Payment ?? job.payment ?? job.paymentType, '-'),
    problems:       safeStr(Array.isArray(job.visualIssues) ? job.visualIssues.filter(Boolean).join(', ') : (job.visualIssues ?? job.problems ?? job.Problems ?? job.problem ?? job.fault ?? job.issue), '-'),
    physicalConditions: safeStr(
      Array.isArray(job.physicalCondition) ? job.physicalCondition.join(', ') :
      (job.physicalCondition ?? job.physicalConditions ?? job.physical_condition ?? job.PhysicalCondition ?? job.physCond ?? job.PhysCond), '-'
    ),
    accessories:    safeStr(Array.isArray(job.accessories) ? job.accessories.join(', ') : (job.accessories ?? job.Accessories), '-'),
    remarks:        safeStr(service.remarks ?? job.remarks ?? job.Remarks ?? job.remark ?? job.note, '-'),
    // ── dates (all formatted as D/M/YYYY)
    savedDate:      formatDate(job.createdAt ?? job.savedDate ?? job.SavedDate ?? job.saved_date ?? job.created_at ?? job.receivedDate),
    repairedDate:   formatDate(service.repairDate ?? job.repairedDate ?? job.RepairDate ?? job.repair_date ?? job.repairDate ?? job.dateRepaired),
    deliveredDate:  formatDate(service.deliveryDate ?? job.deliveredDate ?? job.DeliveryDate ?? job.delivery_date ?? job.deliveryDate ?? job.dateDelivered),
    // ── meta
    createdBy:      safeStr(createdBy.username ?? createdBy.name ?? job.createdBy ?? job.CreatedBy ?? job.created_by ?? job.billingBy ?? job.billedBy, '-'),
    spareItems:     Array.isArray(job.spareItems) ? job.spareItems : [],
  };
};

// ─── API Helper ──────────────────────────────────────────────────────────────
// Import your actual API utility here
// import { api } from '../../utils/api';

// Mock API for demonstration - replace with your actual API calls
const api = {
  getJobs: async (filters = {}) => {
    // Your actual API call here
    // const response = await fetch(`${API_URL}/api/jobsheets/filter?${params}`);
    // const data = await response.json();
    // return Array.isArray(data) ? data : (data.jobs || data.data || []);
    return [];
  },
  getEngineers: async () => {
    // Your actual API call here
    // const response = await fetch(`${API_URL}/api/engineers`);
    // const data = await response.json();
    // return Array.isArray(data) ? data : (data.engineers || []);
    return [];
  },
};

// ─── Thunks ──────────────────────────────────────────────────────────────────

// Engineer-wise report (grouped)
export const fetchEngineerWiseReport = createAsyncThunk(
  'reports/engineerWise',
  async ({ fromDate, toDate }) => {
    const [rawJobs, engineers] = await Promise.all([
      api.getJobs({ fromDate, toDate }),
      api.getEngineers(),
    ]);
    const jobs = rawJobs.map(normaliseJob);

    const report = engineers.map(eng => ({
      engineer: eng.name,
      jobs: jobs.filter(j => j.engineerId === eng.name),
    }));
    const noEngineerJobs = jobs.filter(
      j => !j.engineerId || j.engineerId === '-' || j.engineerId === 'No Engineer'
    );
    return { engineerReport: report, noEngineerJobs };
  }
);

// Value report (service + spare totals per job)
export const fetchValueReport = createAsyncThunk(
  'reports/value',
  async ({ fromDate, toDate }) => {
    const rawJobs = await api.getJobs({ fromDate, toDate });
    return rawJobs.map(job => {
      const j = normaliseJob(job);
      return {
        jobNo:     j.jobNo,
        name:      j.customerName,
        received:  j.savedDate,
        repaired:  j.repairedDate,
        delivered: j.deliveredDate,
        service:   j.serviceCharges,
        spare:     j.spareCharges,
        total:     j.serviceCharges + j.spareCharges,
      };
    });
  }
);

// Spare parts report
export const fetchSpareReport = createAsyncThunk(
  'reports/spare',
  async ({ engineerId, fromDate, toDate }) => {
    const rawJobs = await api.getJobs({ fromDate, toDate, engineerId });
    const spareItems = [];
    rawJobs.forEach(job => {
      const j = normaliseJob(job);
      if (j.spareItems && j.spareItems.length) {
        j.spareItems.forEach(item => {
          const qty    = safeNum(item.qty);
          const rate   = safeNum(item.rate);
          spareItems.push({
            jobSheet: j.jobNo,
            spare:    safeStr(item.name ?? item.spareName ?? item.part),
            qty,
            rate,
            amount:   qty * rate,
          });
        });
      }
    });
    return spareItems;
  }
);

// Dealer report
export const fetchDealerReport = createAsyncThunk(
  'reports/dealer',
  async ({ dealerName, fromDate, toDate }) => {
    const rawJobs = await api.getJobs({ fromDate, toDate });
    const jobs = rawJobs.map(normaliseJob);
    if (dealerName) {
      return jobs.filter(j =>
        j.dealerName.toLowerCase().includes(dealerName.toLowerCase())
      );
    }
    return jobs;
  }
);

// Daily summary (received / delivered / repaired)
export const fetchDailySummary = createAsyncThunk(
  'reports/dailySummary',
  async ({ type, fromDate, toDate }) => {
    const rawJobs = await api.getJobs({ fromDate, toDate });
    const jobs    = rawJobs.map(normaliseJob);
    const grouped = {};

    jobs.forEach(j => {
      let dateKey;
      if      (type === 'received')  dateKey = j.savedDate;
      else if (type === 'delivered') dateKey = j.deliveredDate;
      else if (type === 'repaired')  dateKey = j.repairedDate;

      if (!dateKey || dateKey === '-') return;
      grouped[dateKey] = (grouped[dateKey] || 0) + 1;
    });

    const summary = Object.entries(grouped).map(([date, count]) => ({ date, count }));
    // Sort by actual date value
    summary.sort((a, b) => {
      const parse = (s) => {
        const [d, m, y] = s.split('/');
        return new Date(y, m - 1, d);
      };
      return parse(a.date) - parse(b.date);
    });
    return summary;
  }
);

// Pending reports
export const fetchPendingReport = createAsyncThunk(
  'reports/pending',
  async ({ type, fromDate, toDate }) => {
    const rawJobs = await api.getJobs({ fromDate, toDate });
    const jobs    = rawJobs.map(normaliseJob);

    if (type === 'repairPending') {
      return jobs.filter(j =>
        j.status?.toLowerCase() === 'received' ||
        j.status?.toLowerCase() === 'pending'
      );
    }
    if (type === 'deliveryPending') {
      return jobs.filter(j =>
        j.status?.toLowerCase() === 'repaired' ||
        (j.status?.toLowerCase() === 'pending' && (!j.deliveredDate || j.deliveredDate === '-'))
      );
    }
    return [];
  }
);

// Delivered NR/NA report
export const fetchDeliveredNRNAReport = createAsyncThunk(
  'reports/deliveredNRNA',
  async ({ fromDate, toDate }) => {
    const rawJobs = await api.getJobs({ fromDate, toDate });
    const jobs    = rawJobs.map(normaliseJob);
    return jobs.filter(j =>
      j.status?.toLowerCase() === 'delivered' &&
      j.physicalConditions?.toUpperCase?.()?.includes('NR/NA')
    );
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────
const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    engineerReport: [],
    noEngineerJobs: [],
    valueReport:    [],
    spareReport:    [],
    dealerReport:   [],
    dailySummary:   [],
    pendingReport:  [],
    deliveredNRNA:  [],
    loading:        false,
    error:          null,
  },
  reducers: {
    clearReports: (state) => {
      state.engineerReport = [];
      state.noEngineerJobs = [];
      state.valueReport    = [];
      state.spareReport    = [];
      state.dealerReport   = [];
      state.dailySummary   = [];
      state.pendingReport  = [];
      state.deliveredNRNA  = [];
      state.error          = null;
    },
  },
  extraReducers: (builder) => {
    const pending   = (state)         => { state.loading = true;  state.error = null; };
    const rejected  = (state, action) => { state.loading = false; state.error = action.error?.message ?? 'Error'; };

    builder
      .addCase(fetchEngineerWiseReport.pending,    pending)
      .addCase(fetchEngineerWiseReport.rejected,   rejected)
      .addCase(fetchEngineerWiseReport.fulfilled,  (state, { payload }) => {
        state.loading       = false;
        state.engineerReport = payload.engineerReport;
        state.noEngineerJobs = payload.noEngineerJobs;
      })

      .addCase(fetchValueReport.pending,   pending)
      .addCase(fetchValueReport.rejected,  rejected)
      .addCase(fetchValueReport.fulfilled, (state, { payload }) => {
        state.loading     = false;
        state.valueReport = payload;
      })

      .addCase(fetchSpareReport.pending,   pending)
      .addCase(fetchSpareReport.rejected,  rejected)
      .addCase(fetchSpareReport.fulfilled, (state, { payload }) => {
        state.loading     = false;
        state.spareReport = payload;
      })

      .addCase(fetchDealerReport.pending,   pending)
      .addCase(fetchDealerReport.rejected,  rejected)
      .addCase(fetchDealerReport.fulfilled, (state, { payload }) => {
        state.loading      = false;
        state.dealerReport = payload;
      })

      .addCase(fetchDailySummary.pending,   pending)
      .addCase(fetchDailySummary.rejected,  rejected)
      .addCase(fetchDailySummary.fulfilled, (state, { payload }) => {
        state.loading      = false;
        state.dailySummary = payload;
      })

      .addCase(fetchPendingReport.pending,   pending)
      .addCase(fetchPendingReport.rejected,  rejected)
      .addCase(fetchPendingReport.fulfilled, (state, { payload }) => {
        state.loading       = false;
        state.pendingReport = payload;
      })

      .addCase(fetchDeliveredNRNAReport.pending,   pending)
      .addCase(fetchDeliveredNRNAReport.rejected,  rejected)
      .addCase(fetchDeliveredNRNAReport.fulfilled, (state, { payload }) => {
        state.loading       = false;
        state.deliveredNRNA = payload;
      });
  },
});

export const { clearReports } = reportSlice.actions;
export default reportSlice.reducer;