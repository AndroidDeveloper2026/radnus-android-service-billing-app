// // src/store/slices/reportSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { api } from '../../utils/api';

// // ─── Date Formatter ──────────────────────────────────────────────────────────
// const formatDate = (value) => {
//   if (!value || value === null || value === undefined) return '-';
//   if (value instanceof Date && !isNaN(value.getTime())) {
//     return `${value.getDate()}/${value.getMonth() + 1}/${value.getFullYear()}`;
//   }
//   const str = String(value).trim();
//   if (!str || str === 'null' || str === 'undefined' || str === 'NaN' || str === 'Invalid Date') return '-';
//   if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) return str;
//   try {
//     const d = new Date(str);
//     if (!isNaN(d.getTime())) {
//       return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
//     }
//   } catch (e) {}
//   return str;
// };

// const safeNum = (val) => {
//   if (val === null || val === undefined || val === '') return 0;
//   const n = Number(val);
//   return isNaN(n) || !isFinite(n) ? 0 : n;
// };

// const safeStr = (val, fallback = '-') => {
//   if (val === null || val === undefined) return fallback;
//   if (Array.isArray(val)) {
//     const filtered = val.filter(v => v && v !== 'null' && v !== 'undefined');
//     return filtered.length ? filtered.join(', ') : fallback;
//   }
//   const s = String(val).trim();
//   if (!s || s === 'null' || s === 'undefined' || s === 'NaN' || s === 'nan') return fallback;
//   return s;
// };

// // ─── Engineer-wise Report ─────────────────────────────────────────────────────
// export const fetchEngineerWiseReport = createAsyncThunk(
//   'reports/engineerWise',
//   async ({ fromDate, toDate, status } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
//       if (status && status !== 'All Status') filters.status = status;
//       const jobs = await api.getJobs(filters);
//       const engineers = await api.getEngineers();
//       const report = engineers.map(eng => ({
//         engineer: eng.name,
//         jobs: jobs.filter(j => j.engineerId === eng.name || j.engineer === eng.name),
//       }));
//       const noEngineerJobs = jobs.filter(j =>
//         !j.engineerId || j.engineerId === '-' || j.engineerId === '' || !j.engineer
//       );
//       return { engineerReport: report, noEngineerJobs };
//     } catch (error) {
//       console.error('[EngineerReport] Error:', error);
//       return { engineerReport: [], noEngineerJobs: [] };
//     }
//   }
// );

// // ─── Value Report ─────────────────────────────────────────────────────────────
// export const fetchValueReport = createAsyncThunk(
//   'reports/value',
//   async ({ fromDate, toDate, engineerId } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
//       if (engineerId) filters.engineerId = engineerId;
//       const jobs = await api.getJobs(filters);
//       return jobs.map(job => {
//         const serviceCharges = job.serviceCharges || job.service?.serviceCharge || 0;
//         const spareCharges = job.spareCharges || job.service?.spareCharge || 0;
//         return {
//           jobNo: job.jobNo || job.jobSheetNo || '-',
//           name: job.customerName || job.customer?.name || '-',
//           received: job.savedDate ? formatDate(job.savedDate) : (job.createdAt ? formatDate(job.createdAt) : '-'),
//           repaired: job.repairedDate ? formatDate(job.repairedDate) : (job.service?.repairDate ? formatDate(job.service.repairDate) : '-'),
//           delivered: job.deliveredDate ? formatDate(job.deliveredDate) : (job.service?.deliveryDate ? formatDate(job.service.deliveryDate) : '-'),
//           service: serviceCharges,
//           spare: spareCharges,
//           total: serviceCharges + spareCharges,
//         };
//       });
//     } catch (error) {
//       console.error('[ValueReport] Error:', error);
//       return [];
//     }
//   }
// );

// // ─── Spare Parts Report ───────────────────────────────────────────────────────
// export const fetchSpareReport = createAsyncThunk(
//   'reports/spare',
//   async ({ engineerId, fromDate, toDate } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
//       if (engineerId) filters.engineerId = engineerId;
//       const jobs = await api.getJobs(filters);
//       const spareItems = [];
//       jobs.forEach(job => {
//         const list = job.spareItems || [];
//         if (list && list.length) {
//           list.forEach(item => {
//             const qty = safeNum(item.qty || item.quantity);
//             const rate = safeNum(item.rate || item.price);
//             const amount = safeNum(item.amount) || (qty * rate);
//             spareItems.push({
//               jobSheet: job.jobNo || job.jobSheetNo || '-',
//               spare: safeStr(item.name || item.spareName || item.partName || 'Unknown'),
//               qty,
//               rate,
//               amount,
//             });
//           });
//         }
//       });
//       return spareItems;
//     } catch (error) {
//       console.error('[SpareReport] Error:', error);
//       return [];
//     }
//   }
// );

// // ─── Dealer Report ────────────────────────────────────────────────────────────
// export const fetchDealerReport = createAsyncThunk(
//   'reports/dealer',
//   async ({ dealerName, fromDate, toDate } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
//       let jobs = await api.getJobs(filters);
//       if (dealerName) {
//         jobs = jobs.filter(job =>
//           (job.dealerName || job.dealer || '').toLowerCase().includes(dealerName.toLowerCase())
//         );
//       }
//       return jobs;
//     } catch (error) {
//       console.error('[DealerReport] Error:', error);
//       return [];
//     }
//   }
// );

// // ─── Daily Summary Report ─────────────────────────────────────────────────────
// export const fetchDailySummary = createAsyncThunk(
//   'reports/dailySummary',
//   async ({ type, fromDate, toDate } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
//       const jobs = await api.getJobs(filters);
//       const grouped = {};
//       jobs.forEach(job => {
//         let dateKey = null;
//         if (type === 'received') {
//           dateKey = job.savedDate ? formatDate(job.savedDate) : (job.createdAt ? formatDate(job.createdAt) : null);
//         } else if (type === 'delivered') {
//           dateKey = job.deliveredDate ? formatDate(job.deliveredDate) : (job.service?.deliveryDate ? formatDate(job.service.deliveryDate) : null);
//         } else if (type === 'repaired') {
//           dateKey = job.repairedDate ? formatDate(job.repairedDate) : (job.service?.repairDate ? formatDate(job.service.repairDate) : null);
//         }
//         if (dateKey && dateKey !== '-') {
//           grouped[dateKey] = (grouped[dateKey] || 0) + 1;
//         }
//       });
//       const summary = Object.entries(grouped).map(([date, count]) => ({ date, count }));
//       summary.sort((a, b) => {
//         const pd = (s) => {
//           if (!s || s === '-') return new Date(0);
//           const parts = s.split('/');
//           return parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : new Date(s);
//         };
//         return pd(a.date) - pd(b.date);
//       });
//       return summary;
//     } catch (error) {
//       return [];
//     }
//   }
// );

// // ─── Pending Reports ──────────────────────────────────────────────────────────
// export const fetchPendingReport = createAsyncThunk(
//   'reports/pending',
//   async ({ type, fromDate, toDate } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
//       const jobs = await api.getJobs(filters);
//       let filteredJobs = [];
//       if (type === 'repairPending') {
//         filteredJobs = jobs.filter(job => {
//           const status = (job.status || job.jobStatus || '').toLowerCase();
//           return status === 'received' || status === 'pending';
//         });
//       } else if (type === 'deliveryPending') {
//         filteredJobs = jobs.filter(job => {
//           const status = (job.status || job.jobStatus || '').toLowerCase();
//           const deliveredDate = job.deliveredDate || job.service?.deliveryDate;
//           return status === 'repaired' || (status === 'pending' && (!deliveredDate || deliveredDate === '-'));
//         });
//       }
//       return filteredJobs;
//     } catch (error) {
//       return [];
//     }
//   }
// );

// // ─── Delivered NR/NA Report ───────────────────────────────────────────────────
// export const fetchDeliveredNRNAReport = createAsyncThunk(
//   'reports/deliveredNRNA',
//   async ({ fromDate, toDate } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
//       const jobs = await api.getJobs(filters);
//       const filteredJobs = jobs.filter(job => {
//         const status = (job.status || job.jobStatus || '').toLowerCase();
//         const physicalConditions = job.physicalConditions || job.physicalCondition || [];
//         let hasNRNA = false;
//         if (Array.isArray(physicalConditions)) {
//           hasNRNA = physicalConditions.some(cond =>
//             cond?.toUpperCase()?.includes('NR') || cond?.toUpperCase()?.includes('NA')
//           );
//         } else if (typeof physicalConditions === 'string') {
//           hasNRNA = physicalConditions.toUpperCase().includes('NR') || physicalConditions.toUpperCase().includes('NA');
//         }
//         return status === 'delivered' && hasNRNA;
//       });
//       return filteredJobs;
//     } catch (error) {
//       console.error('[NRNAReport] Error:', error);
//       return [];
//     }
//   }
// );

// // ─── Rebill Report ────────────────────────────────────────────────────────────
// export const fetchRebillReport = createAsyncThunk(
//   'reports/rebill',
//   async ({ fromDate, toDate } = {}) => {
//     try {
//       const filters = {};
//       if (fromDate) filters.fromDate = fromDate;
//       if (toDate) filters.toDate = toDate;
      
//       const jobs = await api.getJobs(filters);
      
//       // Filter jobs that have rebillHistory with at least one entry
//       const rebilledJobs = jobs.filter(job => 
//         job.rebillHistory && Array.isArray(job.rebillHistory) && job.rebillHistory.length > 0
//       );
      
//       return rebilledJobs;
//     } catch (error) {
//       console.error('[RebillReport] Error:', error);
//       return [];
//     }
//   }
// );

// // ─── Slice ────────────────────────────────────────────────────────────────────
// const reportSlice = createSlice({
//   name: 'reports',
//   initialState: {
//     engineerReport: [],
//     noEngineerJobs: [],
//     valueReport: [],
//     spareReport: [],
//     dealerReport: [],
//     dailySummary: [],
//     pendingReport: [],
//     deliveredNRNA: [],
//     rebillReport: [],
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     clearReports: (state) => {
//       state.engineerReport = [];
//       state.noEngineerJobs = [];
//       state.valueReport = [];
//       state.spareReport = [];
//       state.dealerReport = [];
//       state.dailySummary = [];
//       state.pendingReport = [];
//       state.deliveredNRNA = [];
//       state.rebillReport = [];
//       state.loading = false;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     const pendingState = (state) => { state.loading = true; state.error = null; };
//     const rejectedState = (state, action) => {
//       state.loading = false;
//       state.error = action.error?.message || 'An error occurred';
//     };
//     builder
//       .addCase(fetchEngineerWiseReport.pending, pendingState)
//       .addCase(fetchEngineerWiseReport.rejected, rejectedState)
//       .addCase(fetchEngineerWiseReport.fulfilled, (state, { payload }) => {
//         state.loading = false;
//         state.engineerReport = payload.engineerReport;
//         state.noEngineerJobs = payload.noEngineerJobs;
//       })
//       .addCase(fetchValueReport.pending, pendingState)
//       .addCase(fetchValueReport.rejected, rejectedState)
//       .addCase(fetchValueReport.fulfilled, (state, { payload }) => { 
//         state.loading = false; 
//         state.valueReport = payload; 
//       })
//       .addCase(fetchSpareReport.pending, pendingState)
//       .addCase(fetchSpareReport.rejected, rejectedState)
//       .addCase(fetchSpareReport.fulfilled, (state, { payload }) => { 
//         state.loading = false; 
//         state.spareReport = payload; 
//       })
//       .addCase(fetchDealerReport.pending, pendingState)
//       .addCase(fetchDealerReport.rejected, rejectedState)
//       .addCase(fetchDealerReport.fulfilled, (state, { payload }) => { 
//         state.loading = false; 
//         state.dealerReport = payload; 
//       })
//       .addCase(fetchDailySummary.pending, pendingState)
//       .addCase(fetchDailySummary.rejected, rejectedState)
//       .addCase(fetchDailySummary.fulfilled, (state, { payload }) => { 
//         state.loading = false; 
//         state.dailySummary = payload; 
//       })
//       .addCase(fetchPendingReport.pending, pendingState)
//       .addCase(fetchPendingReport.rejected, rejectedState)
//       .addCase(fetchPendingReport.fulfilled, (state, { payload }) => { 
//         state.loading = false; 
//         state.pendingReport = payload; 
//       })
//       .addCase(fetchDeliveredNRNAReport.pending, pendingState)
//       .addCase(fetchDeliveredNRNAReport.rejected, rejectedState)
//       .addCase(fetchDeliveredNRNAReport.fulfilled, (state, { payload }) => { 
//         state.loading = false; 
//         state.deliveredNRNA = payload; 
//       })
//       .addCase(fetchRebillReport.pending, pendingState)
//       .addCase(fetchRebillReport.rejected, rejectedState)
//       .addCase(fetchRebillReport.fulfilled, (state, { payload }) => {
//         state.loading = false;
//         state.rebillReport = payload;
//       });
//   },
// });

// export const { clearReports } = reportSlice.actions;
// export default reportSlice.reducer;

//++++++++++++++++++++++++

// src/store/slices/reportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

// ─── Date Formatter ──────────────────────────────────────────────────────────
const formatDate = (value) => {
  if (!value || value === null || value === undefined) return '-';
  if (value instanceof Date && !isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }
  const str = String(value).trim();
  if (!str || str === 'null' || str === 'undefined' || str === 'NaN' || str === 'Invalid Date') return '-';
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) return str;
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  } catch (e) {}
  return str;
};

const safeNum = (val) => {
  if (val === null || val === undefined || val === '') return 0;
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

// ─── Engineer-wise Report ─────────────────────────────────────────────────────
export const fetchEngineerWiseReport = createAsyncThunk(
  'reports/engineerWise',
  async ({ fromDate, toDate, status } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      if (status && status !== 'All' && status !== 'All Status') filters.status = status;
      
      const jobs = await api.getJobs(filters);
      
      // Get unique engineers from jobs
      const engineerMap = {};
      jobs.forEach(job => {
        const eng = job.service?.engineer || job.engineer || job.engineerId;
        if (eng && eng !== '-' && eng.trim()) {
          if (!engineerMap[eng]) engineerMap[eng] = [];
          engineerMap[eng].push(job);
        }
      });
      
      const report = Object.keys(engineerMap).map(eng => ({
        engineer: eng,
        jobs: engineerMap[eng],
      }));
      
      const noEngineerJobs = jobs.filter(job => {
        const eng = job.service?.engineer || job.engineer || job.engineerId;
        return !eng || eng === '-' || eng.trim() === '';
      });
      
      return { engineerReport: report, noEngineerJobs };
    } catch (error) {
      console.error('[EngineerReport] Error:', error);
      return { engineerReport: [], noEngineerJobs: [] };
    }
  }
);

// ─── Value Report ─────────────────────────────────────────────────────────────
export const fetchValueReport = createAsyncThunk(
  'reports/value',
  async ({ fromDate, toDate, engineerId } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      if (engineerId) filters.engineerId = engineerId;
      
      const jobs = await api.getJobs(filters);
      
      return jobs.map(job => {
        const serviceCharges = safeNum(job.service?.serviceCharge || job.serviceCharges);
        const spareCharges = safeNum(job.service?.spareCharge || job.spareCharges);
        return {
          _id: job._id || job.id,
          jobNo: job.jobSheetNo || job.jobNo || '-',
          name: job.customer?.name || job.customerName || '-',
          received: formatDate(job.createdAt || job.savedDate),
          repaired: formatDate(job.service?.repairDate || job.repairedDate),
          delivered: formatDate(job.service?.deliveryDate || job.deliveredDate),
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

// ─── Spare Parts Report ───────────────────────────────────────────────────────
export const fetchSpareReport = createAsyncThunk(
  'reports/spare',
  async ({ engineerId, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      if (engineerId) filters.engineerId = engineerId;
      
      const jobs = await api.getJobs(filters);
      const spareItems = [];
      
      jobs.forEach(job => {
        const engineer = job.service?.engineer || job.engineer || 'No Engineer';
        const list = job.spareItems || [];
        if (list && list.length) {
          list.forEach(item => {
            const qty = safeNum(item.qty || item.quantity);
            const rate = safeNum(item.rate || item.price);
            const amount = safeNum(item.amount) || (qty * rate);
            spareItems.push({
              jobSheet: job.jobSheetNo || job.jobNo || '-',
              spare: safeStr(item.name || item.spareName || item.partName || 'Unknown'),
              qty,
              rate,
              amount,
              engineer,
              jobId: job._id || job.id,
            });
          });
        }
      });
      
      return spareItems;
    } catch (error) {
      console.error('[SpareReport] Error:', error);
      return [];
    }
  }
);

// ─── Dealer Report ────────────────────────────────────────────────────────────
export const fetchDealerReport = createAsyncThunk(
  'reports/dealer',
  async ({ dealerName, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      let jobs = await api.getJobs(filters);
      
      if (dealerName) {
        jobs = jobs.filter(job =>
          (job.service?.dealer || job.dealerName || job.dealer || '').toLowerCase().includes(dealerName.toLowerCase())
        );
      }
      
      // Filter only jobs with dealer
      jobs = jobs.filter(job => {
        const dealer = job.service?.dealer || job.dealerName || job.dealer;
        return dealer && dealer !== '-' && dealer.trim() !== '';
      });
      
      return jobs;
    } catch (error) {
      console.error('[DealerReport] Error:', error);
      return [];
    }
  }
);

// ─── Daily Summary Report ─────────────────────────────────────────────────────
export const fetchDailySummary = createAsyncThunk(
  'reports/dailySummary',
  async ({ type, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      const jobs = await api.getJobs(filters);
      const grouped = {};
      
      jobs.forEach(job => {
        let dateKey = null;
        const status = job.device?.mobileStatus || job.status || '';
        
        if (type === 'received') {
          if (status === 'Received') {
            dateKey = formatDate(job.createdAt || job.savedDate);
          }
        } else if (type === 'delivered') {
          if (status === 'Delivered') {
            dateKey = formatDate(job.service?.deliveryDate || job.deliveredDate || job.createdAt);
          }
        } else if (type === 'repaired') {
          if (status === 'Repaired') {
            dateKey = formatDate(job.service?.repairDate || job.repairedDate || job.createdAt);
          }
        }
        
        if (dateKey && dateKey !== '-') {
          grouped[dateKey] = (grouped[dateKey] || 0) + 1;
        }
      });
      
      const summary = Object.entries(grouped).map(([date, count]) => ({ date, count }));
      summary.sort((a, b) => {
        if (a.date === '-' || b.date === '-') return 0;
        return a.date.localeCompare(b.date);
      });
      
      return summary;
    } catch (error) {
      console.error('[DailySummary] Error:', error);
      return [];
    }
  }
);

// ─── Pending Reports ──────────────────────────────────────────────────────────
export const fetchPendingReport = createAsyncThunk(
  'reports/pending',
  async ({ type, fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      const jobs = await api.getJobs(filters);
      let filteredJobs = [];
      
      if (type === 'repairPending') {
        // FIXED: Use mobileStatus directly
        filteredJobs = jobs.filter(job => {
          const status = job.device?.mobileStatus || job.status || '';
          return status === 'Pending';
        });
      } else if (type === 'deliveryPending') {
        // FIXED: Use mobileStatus directly
        filteredJobs = jobs.filter(job => {
          const status = job.device?.mobileStatus || job.status || '';
          return status === 'Repaired' || status === 'Pending';
        });
      }
      
      return filteredJobs;
    } catch (error) {
      console.error('[PendingReport] Error:', error);
      return [];
    }
  }
);

// ─── Delivered NR/NA Report ───────────────────────────────────────────────────
export const fetchDeliveredNRNAReport = createAsyncThunk(
  'reports/deliveredNRNA',
  async ({ fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      const jobs = await api.getJobs(filters);
      
      // FIXED: Filter by mobileStatus directly
      const filteredJobs = jobs.filter(job => {
        const status = job.device?.mobileStatus || job.status || '';
        return status === 'Delivered NR/NA';
      });
      
      // Group by date
      const grouped = {};
      filteredJobs.forEach(job => {
        const date = formatDate(job.service?.repairDate || job.repairedDate || job.createdAt);
        if (date && date !== '-') {
          grouped[date] = (grouped[date] || 0) + 1;
        }
      });
      
      const summary = Object.entries(grouped).map(([date, count]) => ({ date, count }));
      summary.sort((a, b) => {
        if (a.date === '-' || b.date === '-') return 0;
        return a.date.localeCompare(b.date);
      });
      
      return summary;
    } catch (error) {
      console.error('[NRNAReport] Error:', error);
      return [];
    }
  }
);

// ─── Rebill Report ────────────────────────────────────────────────────────────
export const fetchRebillReport = createAsyncThunk(
  'reports/rebill',
  async ({ fromDate, toDate } = {}) => {
    try {
      const filters = {};
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;
      
      const jobs = await api.getJobs(filters);
      
      // Filter jobs that have rebillHistory with at least one entry
      const rebilledJobs = jobs.filter(job => 
        job.rebillHistory && Array.isArray(job.rebillHistory) && job.rebillHistory.length > 0
      );
      
      return rebilledJobs;
    } catch (error) {
      console.error('[RebillReport] Error:', error);
      return [];
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────
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
    rebillReport: [],
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
      state.rebillReport = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pendingState = (state) => { state.loading = true; state.error = null; };
    const rejectedState = (state, action) => {
      state.loading = false;
      state.error = action.error?.message || 'An error occurred';
    };
    builder
      .addCase(fetchEngineerWiseReport.pending, pendingState)
      .addCase(fetchEngineerWiseReport.rejected, rejectedState)
      .addCase(fetchEngineerWiseReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.engineerReport = payload.engineerReport || [];
        state.noEngineerJobs = payload.noEngineerJobs || [];
      })
      .addCase(fetchValueReport.pending, pendingState)
      .addCase(fetchValueReport.rejected, rejectedState)
      .addCase(fetchValueReport.fulfilled, (state, { payload }) => { 
        state.loading = false; 
        state.valueReport = payload || []; 
      })
      .addCase(fetchSpareReport.pending, pendingState)
      .addCase(fetchSpareReport.rejected, rejectedState)
      .addCase(fetchSpareReport.fulfilled, (state, { payload }) => { 
        state.loading = false; 
        state.spareReport = payload || []; 
      })
      .addCase(fetchDealerReport.pending, pendingState)
      .addCase(fetchDealerReport.rejected, rejectedState)
      .addCase(fetchDealerReport.fulfilled, (state, { payload }) => { 
        state.loading = false; 
        state.dealerReport = payload || []; 
      })
      .addCase(fetchDailySummary.pending, pendingState)
      .addCase(fetchDailySummary.rejected, rejectedState)
      .addCase(fetchDailySummary.fulfilled, (state, { payload }) => { 
        state.loading = false; 
        state.dailySummary = payload || []; 
      })
      .addCase(fetchPendingReport.pending, pendingState)
      .addCase(fetchPendingReport.rejected, rejectedState)
      .addCase(fetchPendingReport.fulfilled, (state, { payload }) => { 
        state.loading = false; 
        state.pendingReport = payload || []; 
      })
      .addCase(fetchDeliveredNRNAReport.pending, pendingState)
      .addCase(fetchDeliveredNRNAReport.rejected, rejectedState)
      .addCase(fetchDeliveredNRNAReport.fulfilled, (state, { payload }) => { 
        state.loading = false; 
        state.deliveredNRNA = payload || []; 
      })
      .addCase(fetchRebillReport.pending, pendingState)
      .addCase(fetchRebillReport.rejected, rejectedState)
      .addCase(fetchRebillReport.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.rebillReport = payload || [];
      });
  },
});

export const { clearReports } = reportSlice.actions;
export default reportSlice.reducer;