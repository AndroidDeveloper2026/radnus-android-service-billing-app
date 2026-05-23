// src/store/slices/reportSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';

export const fetchEngineerWiseReport = createAsyncThunk('reports/engineerWise', async ({ fromDate, toDate }) => {
  const jobs = await api.getJobs({ fromDate, toDate });
  const engineers = await api.getEngineers();
  const report = engineers.map(eng => ({
    engineer: eng.name,
    jobs: jobs.filter(j => j.engineerId === eng.id),
  }));
  const noEngineerJobs = jobs.filter(j => !j.engineerId || j.engineerId === '6');
  return { engineerReport: report, noEngineerJobs };
});

export const fetchValueReport = createAsyncThunk('reports/value', async ({ fromDate, toDate }) => {
  const jobs = await api.getJobs({ fromDate, toDate });
  return jobs.map(job => ({
    jobNo: job.jobNo,
    name: job.customerName,
    received: job.savedDate,
    repaired: job.repairedDate,
    delivered: job.deliveredDate,
    service: job.serviceCharges || 0,
    spare: job.spareCharges || 0,
    total: (job.serviceCharges || 0) + (job.spareCharges || 0),
  }));
});

export const fetchSpareReport = createAsyncThunk('reports/spare', async ({ engineerId, fromDate, toDate }) => {
  const jobs = await api.getJobs({ fromDate, toDate, engineerId });
  const spareItems = [];
  jobs.forEach(job => {
    if (job.spareItems && job.spareItems.length) {
      job.spareItems.forEach(item => {
        spareItems.push({
          jobSheet: job.jobNo,
          spare: item.name,
          qty: item.qty,
          rate: item.rate,
          amount: item.qty * item.rate,
        });
      });
    }
  });
  return spareItems;
});

export const fetchDealerReport = createAsyncThunk('reports/dealer', async ({ dealerName, fromDate, toDate }) => {
  const jobs = await api.getJobs({ fromDate, toDate });
  let filtered = jobs;
  if (dealerName) {
    filtered = jobs.filter(j => j.dealerName?.toLowerCase().includes(dealerName.toLowerCase()));
  }
  return filtered;
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    engineerReport: [],
    noEngineerJobs: [],
    valueReport: [],
    spareReport: [],
    dealerReport: [],
    loading: false,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEngineerWiseReport.fulfilled, (state, action) => {
        state.engineerReport = action.payload.engineerReport;
        state.noEngineerJobs = action.payload.noEngineerJobs;
      })
      .addCase(fetchValueReport.fulfilled, (state, action) => {
        state.valueReport = action.payload;
      })
      .addCase(fetchSpareReport.fulfilled, (state, action) => {
        state.spareReport = action.payload;
      })
      .addCase(fetchDealerReport.fulfilled, (state, action) => {
        state.dealerReport = action.payload;
      });
  },
});

export default reportSlice.reducer;