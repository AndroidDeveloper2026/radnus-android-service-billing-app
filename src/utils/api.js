// src/utils/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('@radnus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================
// TRANSFORM JOB TO FRONTEND
// ============================================
const transformJobToFrontend = (job, makes = [], models = []) => {
  if (!job) return {};

  // Function to check if string is ObjectId
  const isObjectId = str => str && str.match(/^[0-9a-fA-F]{24}$/);

  const makeValue = job.device?.make || '';
  const modelValue = job.device?.model || '';

  // ✅ Resolve make name from ObjectId
  let makeName = makeValue;
  if (isObjectId(makeValue)) {
    const found = makes.find(m => m.id === makeValue || m._id === makeValue);
    makeName = found ? found.name : makeValue;
  }

  // ✅ Resolve model name from ObjectId
  let modelName = modelValue;
  if (isObjectId(modelValue)) {
    const found = models.find(m => m.id === modelValue || m._id === modelValue);
    modelName = found ? found.name : modelValue;
  }

  return {
    id: job._id,
    jobSheetNo: job.jobSheetNo || job.jobNo || '',
    jobNo: job.jobSheetNo || job.jobNo || '',

    customer: job.customer || {},
    customerName: job.customer?.name || '',
    contact: job.customer?.contact || '',
    altContact: job.customer?.altContact || '',
    address: job.customer?.address || '',
    email: job.customer?.email || '',

    device: job.device || {},

    // ✅ Store both raw and resolved values
    makeId: makeValue, // Raw value from DB (could be ID or name)
    modelId: modelValue, // Raw value from DB (could be ID or name)
    makeName: makeName, // Resolved name for display
    modelName: modelName, // Resolved name for display
    makeRaw: makeValue,
    modelRaw: modelValue,
    makeResolved: makeName,
    modelResolved: modelName,

    imei: job.device?.imei || '',
    warranty: job.device?.warranty || 'No Warranty',
    patternPin: job.device?.pattern || '',
    mobileStatus: job.device?.mobileStatus || 'Received',
    status: job.device?.mobileStatus || 'Received',

    idProof: job.idProofType || '',
    physicalCondition: job.physicalCondition || [],
    physicalConditions: job.physicalCondition || [],
    accessories: job.accessories || [],
    accessoriesReceived: job.accessories || [],
    visualIssues: job.visualIssues || [],
    batteryNumber: '',

    service: job.service || {},
    engineerId: job.service?.engineer || '',
    engineer: job.service?.engineer || '',
    assignedTo: job.assignedTo || job.service?.engineer || '',
    dealerName: job.service?.dealer || '',
    dealer: job.service?.dealer || '',
    drawerId: job.service?.drawer || '',
    drawer: job.service?.drawer || '',
    serviceCharges: job.service?.serviceCharge || 0,
    serviceCharge: job.service?.serviceCharge || 0,
    spareCharges: job.service?.spareCharge || 0,
    spareCharge: job.service?.spareCharge || 0,
    estimateAmount: parseFloat(job.service?.estimate) || 0,
    estimate: job.service?.estimate || '0',
    paymentMode: job.service?.paymentMode || '',
    repairDate: job.service?.repairDate || null,
    repairedDate: job.service?.repairDate || null,
    deliveryDate: job.service?.deliveryDate || null,
    deliveredDate: job.service?.deliveryDate || null,
    remarks: job.service?.remarks || '',

    spareItems: job.spareItems || [],

    advanceAmount: job.service?.advanceAmount || 0,
    advanceDate: job.service?.advanceDate || null,
    advanceItems: job.service?.advanceItems || [],
    marginAmount: job.service?.margin || 0,
    margin: job.service?.margin || 0,
    income: job.service?.income || 0,
    othersAmount: job.service?.othersAmount || 0,
    othersItems: job.service?.othersItems || [],
    instaFollowers: job.service?.instaFollowers || '',
    googleReview: job.service?.googleReview || '',

    statusLogs: job.statusLogs || [],
    repairSteps: job.repairSteps || [],
    transferLog: job.transferLog || [],
    savedDate: job.createdAt || new Date().toISOString(),
    createdAt: job.createdAt || new Date().toISOString(),
    createdBy: job.createdBy || {},
    isInvoiced: job.isInvoiced || false,
    isCancelled: job.isCancelled || false,
    cancelRemarks: job.cancelRemarks || '',
    cancelledBy: job.cancelledBy || '',
    cancelledAt: job.cancelledAt || null,
    rebillPending: job.rebillPending || false,
    rebillHistory: job.rebillHistory || [],
  };
};

// ============================================
// TRANSFORM JOB TO BACKEND
// ============================================
const transformJobToBackend = (jobData, currentUser) => ({
  jobSheetNo: jobData.jobNo || jobData.jobSheetNo || '',
  customer: {
    name: jobData.customerName || '',
    contact: jobData.contact || '',
    altContact: jobData.altContact || '',
    address: jobData.address || '',
    email: jobData.email || '',
  },
  device: {
    // ✅ Send the ID to backend, not the name
    make: jobData.makeId || jobData.makeRaw || '',
    model: jobData.modelId || jobData.modelRaw || '',
    imei: jobData.imei || '',
    warranty: jobData.warranty || 'No Warranty',
    pattern: jobData.patternPin || '',
    mobileStatus: jobData.status || 'Received',
  },
  physicalCondition: jobData.physicalConditions || [],
  accessories: jobData.accessoriesReceived || [],
  visualIssues: jobData.visualIssues || [],
  idProofType: jobData.idProof || '',
  service: {
    engineer: jobData.engineerId || '',
    dealer: jobData.dealerName || '',
    drawer: jobData.drawerId || '',
    serviceRep: jobData.serviceRepId || '',
    serviceCharge: Number(jobData.serviceCharges) || 0,
    spareCharge: Number(jobData.spareCharges) || 0,
    estimate: String(jobData.estimateAmount || '0'),
    paymentMode: jobData.paymentMode || '',
    repairDate: jobData.repairDate || new Date().toISOString(),
    deliveryDate: jobData.deliveredDate || null,
    remarks: jobData.remarks || '',
    advanceAmount: Number(jobData.advanceAmount) || 0,
    advanceDate: jobData.advanceDate || null,
    advanceItems: jobData.advanceItems || [],
    margin: Number(jobData.marginAmount) || 0,
    income: Number(jobData.income) || 0,
    othersAmount: Number(jobData.othersAmount) || 0,
    othersItems: jobData.othersItems || [],
    instaFollowers: jobData.instaFollowers || '',
    googleReview: jobData.googleReview || '',
  },
  spareItems: (jobData.spareItems || []).map(item => ({
    name: item.name || '',
    qty: Number(item.qty) || 0,
    rate: Number(item.rate) || 0,
    amount: (Number(item.qty) || 0) * (Number(item.rate) || 0),
  })),
  createdBy: {
    username: currentUser?.username || 'unknown',
    role: currentUser?.role || 'user',
  },
});

// ============================================
// API FUNCTIONS
// ============================================
export const api = {
  // =============================================
  // AUTHENTICATION
  // =============================================
  login: async (username, password) => {
    const response = await apiClient.post('/api/login', { username, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('@radnus_token', token);
    await AsyncStorage.setItem('@radnus_user', JSON.stringify(user));
    return { token, user };
  },

  logout: async () => {
    await AsyncStorage.removeItem('@radnus_token');
    await AsyncStorage.removeItem('@radnus_user');
  },

  getToken: async () => {
    return await AsyncStorage.getItem('@radnus_token');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('@radnus_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // =============================================
  // JOBS
  // =============================================
  getJobs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search || filters.q)
        params.append('q', filters.search || filters.q);
      if (filters.status && filters.status !== 'All Status')
        params.append('status', filters.status);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.engineerId || filters.engineer)
        params.append('engineer', filters.engineerId || filters.engineer);
      if (filters.dealerName || filters.dealer)
        params.append('dealer', filters.dealerName || filters.dealer);

      const queryString = params.toString();
      const response = await apiClient.get(
        `/api/jobsheets/filter${queryString ? '?' + queryString : ''}`,
      );

      let jobs = [];
      if (Array.isArray(response.data)) {
        jobs = response.data;
      } else if (
        response.data &&
        response.data.jobs &&
        Array.isArray(response.data.jobs)
      ) {
        jobs = response.data.jobs;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        jobs = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        const arrayKey = Object.keys(response.data).find(key =>
          Array.isArray(response.data[key]),
        );
        if (arrayKey) {
          jobs = response.data[arrayKey];
        }
      }

      // ✅ Get makes and models for resolving IDs
      const makes = await api.getMakes();
      const models = await api.getModels();

      const transformedJobs = jobs.map(job =>
        transformJobToFrontend(job, makes, models),
      );
      return transformedJobs;
    } catch (error) {
      console.error('[API] Error fetching jobs:', error);
      throw error;
    }
  },

  getJobById: async id => {
    const response = await apiClient.get(`/api/jobsheets/${id}`);
    // ✅ Get makes and models for resolving IDs
    const makes = await api.getMakes();
    const models = await api.getModels();
    return transformJobToFrontend(response.data, makes, models);
  },

  createJob: async jobData => {
    let nextJobNo;
    try {
      const nextRes = await apiClient.get('/api/jobsheets/next-number');
      nextJobNo = nextRes.data.next;
    } catch (err) {
      console.warn('Failed to fetch next job number, using fallback:', err);
      nextJobNo = `JS-${Date.now()}`;
    }

    const dataWithNo = { ...jobData, jobNo: nextJobNo };
    const userStr = await AsyncStorage.getItem('@radnus_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const backendData = transformJobToBackend(dataWithNo, user);

    const payload = {
      ...backendData,
      customer: JSON.stringify(backendData.customer),
      device: JSON.stringify(backendData.device),
      service: JSON.stringify(backendData.service),
      physicalCondition: JSON.stringify(backendData.physicalCondition),
      accessories: JSON.stringify(backendData.accessories),
      visualIssues: JSON.stringify(backendData.visualIssues),
      spareItems: JSON.stringify(backendData.spareItems),
      createdBy: JSON.stringify(backendData.createdBy),
    };

    payload.jobSheetNo = nextJobNo;
    const response = await apiClient.post('/api/jobsheets', payload);

    // ✅ Get makes and models for resolving IDs
    const makes = await api.getMakes();
    const models = await api.getModels();
    return transformJobToFrontend(response.data, makes, models);
  },

  updateJob: async (id, jobData) => {
    const userStr = await AsyncStorage.getItem('@radnus_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const backendData = transformJobToBackend(jobData, user);

    const payload = {
      ...backendData,
      customer: JSON.stringify(backendData.customer),
      device: JSON.stringify(backendData.device),
      service: JSON.stringify(backendData.service),
      physicalCondition: JSON.stringify(backendData.physicalCondition),
      accessories: JSON.stringify(backendData.accessories),
      visualIssues: JSON.stringify(backendData.visualIssues),
      spareItems: JSON.stringify(backendData.spareItems),
      createdBy: JSON.stringify(backendData.createdBy),
    };

    if (!payload.jobSheetNo) delete payload.jobSheetNo;
    const response = await apiClient.put(`/api/jobsheets/${id}`, payload);

    // ✅ Get makes and models for resolving IDs
    const makes = await api.getMakes();
    const models = await api.getModels();
    return transformJobToFrontend(response.data, makes, models);
  },

  deleteJob: async id => {
    throw new Error('Delete not implemented in backend');
  },

  // =============================================
  // ENGINEER DASHBOARD APIs
  // =============================================

  updateJobStatus: async (jobId, status, updatedBy) => {
    try {
      const response = await apiClient.patch(`/api/jobsheets/${jobId}/status`, {
        status,
        updatedBy,
      });
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error updating job status:', error);
      throw error;
    }
  },

  addRepairStep: async (jobId, step, note, completedBy) => {
    try {
      const response = await apiClient.post(`/api/jobsheets/${jobId}/steps`, {
        step,
        note: note || '',
        completedBy,
      });
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error adding repair step:', error);
      throw error;
    }
  },

  toggleRepairStep: async (jobId, stepId, done, completedBy) => {
    try {
      const response = await apiClient.patch(
        `/api/jobsheets/${jobId}/steps/${stepId}`,
        {
          done,
          completedBy,
        },
      );
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error toggling repair step:', error);
      throw error;
    }
  },

  deleteRepairStep: async (jobId, stepId) => {
    try {
      const response = await apiClient.delete(
        `/api/jobsheets/${jobId}/steps/${stepId}`,
      );
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error deleting repair step:', error);
      throw error;
    }
  },

  transferJob: async (jobId, from, to, note) => {
    try {
      const response = await apiClient.patch(
        `/api/jobsheets/${jobId}/transfer`,
        {
          from,
          to,
          note: note || '',
        },
      );
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error transferring job:', error);
      throw error;
    }
  },

  getWorkload: async () => {
    try {
      const response = await apiClient.get('/api/jobsheets/workload');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('[API] Error fetching workload:', error);
      return [];
    }
  },

  // =============================================
  // INVOICE & ESTIMATE APIs
  // =============================================

  sendInvoice: async jobId => {
    try {
      const response = await apiClient.post(
        `/api/jobsheets/send-invoice/${jobId}`,
      );
      return response.data;
    } catch (error) {
      console.error('[API] Error sending invoice:', error);
      throw error;
    }
  },

  sendEstimate: async jobId => {
    try {
      const response = await apiClient.post(
        `/api/jobsheets/send-estimate/${jobId}`,
      );
      return response.data;
    } catch (error) {
      console.error('[API] Error sending estimate:', error);
      throw error;
    }
  },

  lockInvoice: async jobId => {
    try {
      const response = await apiClient.put(`/api/jobsheets/${jobId}/invoice`);
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error locking invoice:', error);
      throw error;
    }
  },

  // =============================================
  // JOB MANAGEMENT APIs
  // =============================================

  cancelJob: async (jobId, cancelRemarks, cancelledBy) => {
    try {
      const response = await apiClient.put(`/api/jobsheets/${jobId}/cancel`, {
        cancelRemarks,
        cancelledBy,
      });
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error cancelling job:', error);
      throw error;
    }
  },

  rebillJob: async (jobId, rebilledBy) => {
    try {
      const response = await apiClient.put(`/api/jobsheets/${jobId}/rebill`, {
        rebilledBy,
      });
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error rebilling job:', error);
      throw error;
    }
  },

  updateSpares: async (jobId, spareItems) => {
    try {
      const response = await apiClient.put(`/api/jobsheets/${jobId}/spares`, {
        spareItems,
      });
      const makes = await api.getMakes();
      const models = await api.getModels();
      return transformJobToFrontend(response.data, makes, models);
    } catch (error) {
      console.error('[API] Error updating spares:', error);
      throw error;
    }
  },

  // =============================================
  // CUSTOMER APIs
  // =============================================

  searchCustomers: async (query, type = 'name') => {
    try {
      const response = await apiClient.get('/api/jobsheets/customers/search', {
        params: { q: query, type },
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error searching customers:', error);
      return [];
    }
  },

  // =============================================
  // REPORT APIs
  // =============================================

  getStaleJobs: async ({ days = 3 } = {}) => {
    try {
      const response = await apiClient.get('/api/jobsheets/stale', {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching stale jobs:', error);
      throw error;
    }
  },

  getUserReport: async (searchTerm = '') => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('jobSheetNo', searchTerm);
      const response = await apiClient.get(
        `/api/jobsheets/user-report?${params.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching user report:', error);
      throw error;
    }
  },

  getSalesRepReport: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.salesRep) queryParams.append('salesRep', params.salesRep);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);

      const response = await apiClient.get(
        `/api/jobsheets/salesrep-report?${queryParams.toString()}`,
      );
      return response.data;
    } catch (error) {
      console.error('[API] Error fetching sales rep report:', error);
      throw error;
    }
  },

  // =============================================
  // DASHBOARD STATS
  // =============================================
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats');
      return {
        total: response.data.totalJobs || 0,
        pending: response.data.pendingJobs || 0,
        completed: response.data.completedJobs || 0,
      };
    } catch (error) {
      console.error('[API] Error fetching dashboard stats:', error);
      return { total: 0, pending: 0, completed: 0 };
    }
  },

  // =============================================
  // ENGINEERS MANAGEMENT
  // =============================================
  getEngineers: async () => {
    const response = await apiClient.get('/api/engineers');
    let engineers = [];
    if (Array.isArray(response.data)) {
      engineers = response.data;
    } else if (
      response.data &&
      response.data.engineers &&
      Array.isArray(response.data.engineers)
    ) {
      engineers = response.data.engineers;
    }

    return engineers.map(e => ({
      id: e._id,
      _id: e._id,
      name: e.name,
    }));
  },

  addEngineer: async name => {
    const response = await apiClient.post('/api/engineers', { name });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
    };
  },

  updateEngineer: async (id, name) => {
    const response = await apiClient.put(`/api/engineers/${id}`, { name });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
    };
  },

  deleteEngineer: async id => {
    const response = await apiClient.delete(`/api/engineers/${id}`);
    return response.data;
  },

  // =============================================
  // SALES REPS MANAGEMENT
  // =============================================
  getSalesReps: async () => {
    const response = await apiClient.get('/api/salesreps');
    let salesReps = [];
    if (Array.isArray(response.data)) {
      salesReps = response.data;
    } else if (
      response.data &&
      response.data.salesReps &&
      Array.isArray(response.data.salesReps)
    ) {
      salesReps = response.data.salesReps;
    }

    return salesReps.map(s => ({
      id: s._id,
      _id: s._id,
      name: s.name,
    }));
  },

  addSalesRep: async name => {
    const response = await apiClient.post('/api/salesreps', { name });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
    };
  },

  updateSalesRep: async (id, name) => {
    const response = await apiClient.put(`/api/salesreps/${id}`, { name });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
    };
  },

  deleteSalesRep: async id => {
    const response = await apiClient.delete(`/api/salesreps/${id}`);
    return response.data;
  },

  // =============================================
  // MAKES MANAGEMENT
  // =============================================
  getMakes: async () => {
    const response = await apiClient.get('/api/makes');
    return response.data.map(m => ({ id: m._id, _id: m._id, name: m.name }));
  },

  addMake: async name => {
    const response = await apiClient.post('/api/makes', { name });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
    };
  },

  deleteMake: async id => {
    const response = await apiClient.delete(`/api/makes/${id}`);
    return response.data;
  },

  // =============================================
  // MODELS MANAGEMENT
  // =============================================
  getModels: async () => {
    const makes = await api.getMakes();
    let allModels = [];
    let failedCount = 0;
    for (const make of makes) {
      try {
        const res = await apiClient.get(
          `/api/models/${encodeURIComponent(make.name)}`,
        );
        const modelsWithMakeId = res.data.map(m => ({
          id: m._id,
          _id: m._id,
          name: m.name,
          makeId: make.id,
        }));
        allModels.push(...modelsWithMakeId);
      } catch (err) {
        failedCount += 1;
        console.warn(`Failed to fetch models for make ${make.name}:`, err.message);
      }
    }
    // If there were makes to fetch models for and every single request failed,
    // this is a real connectivity/backend problem, not "no models exist" -
    // surface it instead of silently returning an empty list.
    if (makes.length > 0 && failedCount === makes.length) {
      throw new Error('Failed to fetch models for any make - check API connectivity');
    }
    return allModels;
  },

  addModel: async (makeId, name) => {
    const makes = await api.getMakes();
    const make = makes.find(m => m.id === makeId);
    if (!make) throw new Error('Make not found');
    const response = await apiClient.post('/api/models', {
      name,
      make: make.name,
    });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
      makeId,
    };
  },

  deleteModel: async id => {
    const response = await apiClient.delete(`/api/models/${id}`);
    return response.data;
  },

  // =============================================
  // FAULTS MANAGEMENT
  // =============================================
  getFaults: async () => {
    const response = await apiClient.get('/api/faults');
    return response.data.map(f => ({ id: f._id, _id: f._id, name: f.name }));
  },

  addFault: async name => {
    const response = await apiClient.post('/api/faults', { name, price: 0 });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
    };
  },

  deleteFault: async id => {
    const response = await apiClient.delete(`/api/faults/${id}`);
    return response.data;
  },

  // =============================================
  // DRAWERS MANAGEMENT
  // =============================================
  getDrawers: async () => {
    const response = await apiClient.get('/api/drawers');
    return response.data.map(d => ({ id: d._id, _id: d._id, name: d.name }));
  },

  addDrawer: async name => {
    const response = await apiClient.post('/api/drawers', { name });
    return {
      id: response.data._id,
      _id: response.data._id,
      name: response.data.name,
    };
  },

  deleteDrawer: async id => {
    const response = await apiClient.delete(`/api/drawers/${id}`);
    return response.data;
  },

  // =============================================
  // DEALERS MANAGEMENT
  // =============================================
  getDealers: async () => {
    try {
      const response = await apiClient.get('/api/dealers');
      let dealers = [];
      if (Array.isArray(response.data)) {
        dealers = response.data;
      } else if (
        response.data &&
        response.data.dealers &&
        Array.isArray(response.data.dealers)
      ) {
        dealers = response.data.dealers;
      }

      return dealers.map(d => ({
        id: d._id,
        _id: d._id,
        name: d.name,
      }));
    } catch (error) {
      console.warn(
        '[API] Error fetching dealers (endpoint may not exist):',
        error.message,
      );
      return [];
    }
  },

  // =============================================
  // USERS MANAGEMENT
  // =============================================
  getUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },

  addUser: async userData => {
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  },

  deleteUser: async id => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },
};

export default api;

//++++++++++++++++++++++++++++++++++++++++++++++++++++++

// // src/utils/api.js

// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_BASE_URL } from '@env';

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// // Attach JWT token to every request
// apiClient.interceptors.request.use(async config => {
//   const token = await AsyncStorage.getItem('@radnus_token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ============================================
// // TRANSFORM JOB TO FRONTEND
// // ============================================
// const transformJobToFrontend = (job, makes = [], models = []) => {
//   if (!job) return {};

//   // Function to check if string is ObjectId
//   const isObjectId = str => str && str.match(/^[0-9a-fA-F]{24}$/);

//   const makeValue = job.device?.make || '';
//   const modelValue = job.device?.model || '';

//   // ✅ Resolve make name from ObjectId
//   let makeName = makeValue;
//   if (isObjectId(makeValue)) {
//     const found = makes.find(m => m.id === makeValue || m._id === makeValue);
//     makeName = found ? found.name : makeValue;
//   }

//   // ✅ Resolve model name from ObjectId
//   let modelName = modelValue;
//   if (isObjectId(modelValue)) {
//     const found = models.find(m => m.id === modelValue || m._id === modelValue);
//     modelName = found ? found.name : modelValue;
//   }

//   return {
//     id: job._id,
//     jobSheetNo: job.jobSheetNo || job.jobNo || '',
//     jobNo: job.jobSheetNo || job.jobNo || '',

//     customer: job.customer || {},
//     customerName: job.customer?.name || '',
//     contact: job.customer?.contact || '',
//     altContact: job.customer?.altContact || '',
//     address: job.customer?.address || '',
//     email: job.customer?.email || '',

//     device: job.device || {},

//     // ✅ Store both raw and resolved values
//     makeId: makeValue, // Raw value from DB (could be ID or name)
//     modelId: modelValue, // Raw value from DB (could be ID or name)
//     makeName: makeName, // Resolved name for display
//     modelName: modelName, // Resolved name for display
//     makeRaw: makeValue,
//     modelRaw: modelValue,
//     makeResolved: makeName,
//     modelResolved: modelName,

//     imei: job.device?.imei || '',
//     warranty: job.device?.warranty || 'No Warranty',
//     patternPin: job.device?.pattern || '',
//     mobileStatus: job.device?.mobileStatus || 'Received',
//     status: job.device?.mobileStatus || 'Received',

//     idProof: job.idProofType || '',
//     physicalCondition: job.physicalCondition || [],
//     physicalConditions: job.physicalCondition || [],
//     accessories: job.accessories || [],
//     accessoriesReceived: job.accessories || [],
//     visualIssues: job.visualIssues || [],
//     batteryNumber: '',

//     service: job.service || {},
//     engineerId: job.service?.engineer || '',
//     engineer: job.service?.engineer || '',
//     assignedTo: job.assignedTo || job.service?.engineer || '',
//     dealerName: job.service?.dealer || '',
//     dealer: job.service?.dealer || '',
//     drawerId: job.service?.drawer || '',
//     drawer: job.service?.drawer || '',
//     serviceCharges: job.service?.serviceCharge || 0,
//     serviceCharge: job.service?.serviceCharge || 0,
//     spareCharges: job.service?.spareCharge || 0,
//     spareCharge: job.service?.spareCharge || 0,
//     estimateAmount: parseFloat(job.service?.estimate) || 0,
//     estimate: job.service?.estimate || '0',
//     paymentMode: job.service?.paymentMode || '',
//     repairDate: job.service?.repairDate || null,
//     repairedDate: job.service?.repairDate || null,
//     deliveryDate: job.service?.deliveryDate || null,
//     deliveredDate: job.service?.deliveryDate || null,
//     remarks: job.service?.remarks || '',

//     spareItems: job.spareItems || [],

//     advanceAmount: job.service?.advanceAmount || 0,
//     advanceDate: job.service?.advanceDate || null,
//     advanceItems: job.service?.advanceItems || [],
//     marginAmount: job.service?.margin || 0,
//     margin: job.service?.margin || 0,
//     income: job.service?.income || 0,
//     othersAmount: job.service?.othersAmount || 0,
//     othersItems: job.service?.othersItems || [],
//     instaFollowers: job.service?.instaFollowers || '',
//     googleReview: job.service?.googleReview || '',

//     statusLogs: job.statusLogs || [],
//     repairSteps: job.repairSteps || [],
//     transferLog: job.transferLog || [],
//     savedDate: job.createdAt || new Date().toISOString(),
//     createdAt: job.createdAt || new Date().toISOString(),
//     createdBy: job.createdBy || {},
//     isInvoiced: job.isInvoiced || false,
//     isCancelled: job.isCancelled || false,
//     cancelRemarks: job.cancelRemarks || '',
//     cancelledBy: job.cancelledBy || '',
//     cancelledAt: job.cancelledAt || null,
//     rebillPending: job.rebillPending || false,
//     rebillHistory: job.rebillHistory || [],
//   };
// };

// // ============================================
// // TRANSFORM JOB TO BACKEND
// // ============================================
// const transformJobToBackend = (jobData, currentUser) => ({
//   jobSheetNo: jobData.jobNo || jobData.jobSheetNo || '',
//   customer: {
//     name: jobData.customerName || '',
//     contact: jobData.contact || '',
//     altContact: jobData.altContact || '',
//     address: jobData.address || '',
//     email: jobData.email || '',
//   },
//   device: {
//     // ✅ Send the ID to backend, not the name
//     make: jobData.makeId || jobData.makeRaw || '',
//     model: jobData.modelId || jobData.modelRaw || '',
//     imei: jobData.imei || '',
//     warranty: jobData.warranty || 'No Warranty',
//     pattern: jobData.patternPin || '',
//     mobileStatus: jobData.status || 'Received',
//   },
//   physicalCondition: jobData.physicalConditions || [],
//   accessories: jobData.accessoriesReceived || [],
//   visualIssues: jobData.visualIssues || [],
//   idProofType: jobData.idProof || '',
//   service: {
//     engineer: jobData.engineerId || '',
//     dealer: jobData.dealerName || '',
//     drawer: jobData.drawerId || '',
//     serviceRep: jobData.serviceRepId || '',
//     serviceCharge: Number(jobData.serviceCharges) || 0,
//     spareCharge: Number(jobData.spareCharges) || 0,
//     estimate: String(jobData.estimateAmount || '0'),
//     paymentMode: jobData.paymentMode || '',
//     repairDate: jobData.repairDate || new Date().toISOString(),
//     deliveryDate: jobData.deliveredDate || null,
//     remarks: jobData.remarks || '',
//     advanceAmount: Number(jobData.advanceAmount) || 0,
//     advanceDate: jobData.advanceDate || null,
//     advanceItems: jobData.advanceItems || [],
//     margin: Number(jobData.marginAmount) || 0,
//     income: Number(jobData.income) || 0,
//     othersAmount: Number(jobData.othersAmount) || 0,
//     othersItems: jobData.othersItems || [],
//     instaFollowers: jobData.instaFollowers || '',
//     googleReview: jobData.googleReview || '',
//   },
//   spareItems: (jobData.spareItems || []).map(item => ({
//     name: item.name || '',
//     qty: Number(item.qty) || 0,
//     rate: Number(item.rate) || 0,
//     amount: (Number(item.qty) || 0) * (Number(item.rate) || 0),
//   })),
//   createdBy: {
//     username: currentUser?.username || 'unknown',
//     role: currentUser?.role || 'user',
//   },
// });

// // ============================================
// // API FUNCTIONS
// // ============================================
// export const api = {
//   // =============================================
//   // AUTHENTICATION
//   // =============================================
//   login: async (username, password) => {
//     const response = await apiClient.post('/api/login', { username, password });
//     const { token, user } = response.data;
//     await AsyncStorage.setItem('@radnus_token', token);
//     await AsyncStorage.setItem('@radnus_user', JSON.stringify(user));
//     return { token, user };
//   },

//   logout: async () => {
//     await AsyncStorage.removeItem('@radnus_token');
//     await AsyncStorage.removeItem('@radnus_user');
//   },

//   getToken: async () => {
//     return await AsyncStorage.getItem('@radnus_token');
//   },

//   getCurrentUser: async () => {
//     const userStr = await AsyncStorage.getItem('@radnus_user');
//     return userStr ? JSON.parse(userStr) : null;
//   },

//   // =============================================
//   // JOBS
//   // =============================================
//   getJobs: async (filters = {}) => {
//     try {
//       const params = new URLSearchParams();
//       if (filters.search || filters.q)
//         params.append('q', filters.search || filters.q);
//       if (filters.status && filters.status !== 'All Status')
//         params.append('status', filters.status);
//       if (filters.fromDate) params.append('fromDate', filters.fromDate);
//       if (filters.toDate) params.append('toDate', filters.toDate);
//       if (filters.engineerId || filters.engineer)
//         params.append('engineer', filters.engineerId || filters.engineer);
//       if (filters.dealerName || filters.dealer)
//         params.append('dealer', filters.dealerName || filters.dealer);

//       const queryString = params.toString();
//       const response = await apiClient.get(
//         `/api/jobsheets/filter${queryString ? '?' + queryString : ''}`,
//       );

//       let jobs = [];
//       if (Array.isArray(response.data)) {
//         jobs = response.data;
//       } else if (
//         response.data &&
//         response.data.jobs &&
//         Array.isArray(response.data.jobs)
//       ) {
//         jobs = response.data.jobs;
//       } else if (
//         response.data &&
//         response.data.data &&
//         Array.isArray(response.data.data)
//       ) {
//         jobs = response.data.data;
//       } else if (response.data && typeof response.data === 'object') {
//         const arrayKey = Object.keys(response.data).find(key =>
//           Array.isArray(response.data[key]),
//         );
//         if (arrayKey) {
//           jobs = response.data[arrayKey];
//         }
//       }

//       // ✅ Get makes and models for resolving IDs
//       const makes = await api.getMakes();
//       const models = await api.getModels();

//       const transformedJobs = jobs.map(job =>
//         transformJobToFrontend(job, makes, models),
//       );
//       return transformedJobs;
//     } catch (error) {
//       console.error('[API] Error fetching jobs:', error);
//       throw error;
//     }
//   },

//   getJobById: async id => {
//     const response = await apiClient.get(`/api/jobsheets/${id}`);
//     // ✅ Get makes and models for resolving IDs
//     const makes = await api.getMakes();
//     const models = await api.getModels();
//     return transformJobToFrontend(response.data, makes, models);
//   },

//   createJob: async jobData => {
//     let nextJobNo;
//     try {
//       const nextRes = await apiClient.get('/api/jobsheets/next-number');
//       nextJobNo = nextRes.data.next;
//     } catch (err) {
//       console.warn('Failed to fetch next job number, using fallback:', err);
//       nextJobNo = `JS-${Date.now()}`;
//     }

//     const dataWithNo = { ...jobData, jobNo: nextJobNo };
//     const userStr = await AsyncStorage.getItem('@radnus_user');
//     const user = userStr ? JSON.parse(userStr) : null;
//     const backendData = transformJobToBackend(dataWithNo, user);

//     const payload = {
//       ...backendData,
//       customer: JSON.stringify(backendData.customer),
//       device: JSON.stringify(backendData.device),
//       service: JSON.stringify(backendData.service),
//       physicalCondition: JSON.stringify(backendData.physicalCondition),
//       accessories: JSON.stringify(backendData.accessories),
//       visualIssues: JSON.stringify(backendData.visualIssues),
//       spareItems: JSON.stringify(backendData.spareItems),
//       createdBy: JSON.stringify(backendData.createdBy),
//     };

//     payload.jobSheetNo = nextJobNo;
//     const response = await apiClient.post('/api/jobsheets', payload);

//     // ✅ Get makes and models for resolving IDs
//     const makes = await api.getMakes();
//     const models = await api.getModels();
//     return transformJobToFrontend(response.data, makes, models);
//   },

//   updateJob: async (id, jobData) => {
//     const userStr = await AsyncStorage.getItem('@radnus_user');
//     const user = userStr ? JSON.parse(userStr) : null;
//     const backendData = transformJobToBackend(jobData, user);

//     const payload = {
//       ...backendData,
//       customer: JSON.stringify(backendData.customer),
//       device: JSON.stringify(backendData.device),
//       service: JSON.stringify(backendData.service),
//       physicalCondition: JSON.stringify(backendData.physicalCondition),
//       accessories: JSON.stringify(backendData.accessories),
//       visualIssues: JSON.stringify(backendData.visualIssues),
//       spareItems: JSON.stringify(backendData.spareItems),
//       createdBy: JSON.stringify(backendData.createdBy),
//     };

//     if (!payload.jobSheetNo) delete payload.jobSheetNo;
//     const response = await apiClient.put(`/api/jobsheets/${id}`, payload);

//     // ✅ Get makes and models for resolving IDs
//     const makes = await api.getMakes();
//     const models = await api.getModels();
//     return transformJobToFrontend(response.data, makes, models);
//   },

//   deleteJob: async id => {
//     throw new Error('Delete not implemented in backend');
//   },

//   // =============================================
//   // ENGINEER DASHBOARD APIs
//   // =============================================

//   updateJobStatus: async (jobId, status, updatedBy) => {
//     try {
//       const response = await apiClient.patch(`/api/jobsheets/${jobId}/status`, {
//         status,
//         updatedBy,
//       });
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error updating job status:', error);
//       throw error;
//     }
//   },

//   addRepairStep: async (jobId, step, note, completedBy) => {
//     try {
//       const response = await apiClient.post(`/api/jobsheets/${jobId}/steps`, {
//         step,
//         note: note || '',
//         completedBy,
//       });
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error adding repair step:', error);
//       throw error;
//     }
//   },

//   toggleRepairStep: async (jobId, stepId, done, completedBy) => {
//     try {
//       const response = await apiClient.patch(
//         `/api/jobsheets/${jobId}/steps/${stepId}`,
//         {
//           done,
//           completedBy,
//         },
//       );
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error toggling repair step:', error);
//       throw error;
//     }
//   },

//   deleteRepairStep: async (jobId, stepId) => {
//     try {
//       const response = await apiClient.delete(
//         `/api/jobsheets/${jobId}/steps/${stepId}`,
//       );
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error deleting repair step:', error);
//       throw error;
//     }
//   },

//   transferJob: async (jobId, from, to, note) => {
//     try {
//       const response = await apiClient.patch(
//         `/api/jobsheets/${jobId}/transfer`,
//         {
//           from,
//           to,
//           note: note || '',
//         },
//       );
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error transferring job:', error);
//       throw error;
//     }
//   },

//   getWorkload: async () => {
//     try {
//       const response = await apiClient.get('/api/jobsheets/workload');
//       return Array.isArray(response.data) ? response.data : [];
//     } catch (error) {
//       console.error('[API] Error fetching workload:', error);
//       return [];
//     }
//   },

//   // =============================================
//   // INVOICE & ESTIMATE APIs
//   // =============================================

//   sendInvoice: async jobId => {
//     try {
//       const response = await apiClient.post(
//         `/api/jobsheets/send-invoice/${jobId}`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('[API] Error sending invoice:', error);
//       throw error;
//     }
//   },

//   sendEstimate: async jobId => {
//     try {
//       const response = await apiClient.post(
//         `/api/jobsheets/send-estimate/${jobId}`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('[API] Error sending estimate:', error);
//       throw error;
//     }
//   },

//   lockInvoice: async jobId => {
//     try {
//       const response = await apiClient.put(`/api/jobsheets/${jobId}/invoice`);
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error locking invoice:', error);
//       throw error;
//     }
//   },

//   // =============================================
//   // JOB MANAGEMENT APIs
//   // =============================================

//   cancelJob: async (jobId, cancelRemarks, cancelledBy) => {
//     try {
//       const response = await apiClient.put(`/api/jobsheets/${jobId}/cancel`, {
//         cancelRemarks,
//         cancelledBy,
//       });
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error cancelling job:', error);
//       throw error;
//     }
//   },

//   rebillJob: async (jobId, rebilledBy) => {
//     try {
//       const response = await apiClient.put(`/api/jobsheets/${jobId}/rebill`, {
//         rebilledBy,
//       });
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error rebilling job:', error);
//       throw error;
//     }
//   },

//   updateSpares: async (jobId, spareItems) => {
//     try {
//       const response = await apiClient.put(`/api/jobsheets/${jobId}/spares`, {
//         spareItems,
//       });
//       const makes = await api.getMakes();
//       const models = await api.getModels();
//       return transformJobToFrontend(response.data, makes, models);
//     } catch (error) {
//       console.error('[API] Error updating spares:', error);
//       throw error;
//     }
//   },

//   // =============================================
//   // CUSTOMER APIs
//   // =============================================

//   searchCustomers: async (query, type = 'name') => {
//     try {
//       const response = await apiClient.get('/api/jobsheets/customers/search', {
//         params: { q: query, type },
//       });
//       return response.data;
//     } catch (error) {
//       console.error('[API] Error searching customers:', error);
//       return [];
//     }
//   },

//   // =============================================
//   // REPORT APIs
//   // =============================================

//   getStaleJobs: async ({ days = 3 } = {}) => {
//     try {
//       const response = await apiClient.get('/api/jobsheets/stale', {
//         params: { days },
//       });
//       return response.data;
//     } catch (error) {
//       console.error('[API] Error fetching stale jobs:', error);
//       throw error;
//     }
//   },

//   getUserReport: async (searchTerm = '') => {
//     try {
//       const params = new URLSearchParams();
//       if (searchTerm) params.append('jobSheetNo', searchTerm);
//       const response = await apiClient.get(
//         `/api/jobsheets/user-report?${params.toString()}`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('[API] Error fetching user report:', error);
//       throw error;
//     }
//   },

//   getSalesRepReport: async (params = {}) => {
//     try {
//       const queryParams = new URLSearchParams();
//       if (params.salesRep) queryParams.append('salesRep', params.salesRep);
//       if (params.fromDate) queryParams.append('fromDate', params.fromDate);
//       if (params.toDate) queryParams.append('toDate', params.toDate);

//       const response = await apiClient.get(
//         `/api/jobsheets/salesrep-report?${queryParams.toString()}`,
//       );
//       return response.data;
//     } catch (error) {
//       console.error('[API] Error fetching sales rep report:', error);
//       throw error;
//     }
//   },

//   // =============================================
//   // DASHBOARD STATS
//   // =============================================
//   getDashboardStats: async () => {
//     try {
//       const response = await apiClient.get('/api/dashboard/stats');
//       return {
//         total: response.data.totalJobs || 0,
//         pending: response.data.pendingJobs || 0,
//         completed: response.data.completedJobs || 0,
//       };
//     } catch (error) {
//       console.error('[API] Error fetching dashboard stats:', error);
//       return { total: 0, pending: 0, completed: 0 };
//     }
//   },

//   // =============================================
//   // ENGINEERS MANAGEMENT
//   // =============================================
//   getEngineers: async () => {
//     try {
//       const response = await apiClient.get('/api/engineers');
//       let engineers = [];
//       if (Array.isArray(response.data)) {
//         engineers = response.data;
//       } else if (
//         response.data &&
//         response.data.engineers &&
//         Array.isArray(response.data.engineers)
//       ) {
//         engineers = response.data.engineers;
//       }

//       return engineers.map(e => ({
//         id: e._id,
//         _id: e._id,
//         name: e.name,
//       }));
//     } catch (error) {
//       console.error('[API] Error fetching engineers:', error);
//       return [];
//     }
//   },

//   addEngineer: async name => {
//     const response = await apiClient.post('/api/engineers', { name });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//     };
//   },

//   updateEngineer: async (id, name) => {
//     const response = await apiClient.put(`/api/engineers/${id}`, { name });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//     };
//   },

//   deleteEngineer: async id => {
//     const response = await apiClient.delete(`/api/engineers/${id}`);
//     return response.data;
//   },

//   // =============================================
//   // SALES REPS MANAGEMENT
//   // =============================================
//   getSalesReps: async () => {
//     try {
//       const response = await apiClient.get('/api/salesreps');
//       let salesReps = [];
//       if (Array.isArray(response.data)) {
//         salesReps = response.data;
//       } else if (
//         response.data &&
//         response.data.salesReps &&
//         Array.isArray(response.data.salesReps)
//       ) {
//         salesReps = response.data.salesReps;
//       }

//       return salesReps.map(s => ({
//         id: s._id,
//         _id: s._id,
//         name: s.name,
//       }));
//     } catch (error) {
//       console.warn('[API] Error fetching sales reps:', error.message);
//       return [];
//     }
//   },

//   addSalesRep: async name => {
//     const response = await apiClient.post('/api/salesreps', { name });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//     };
//   },

//   updateSalesRep: async (id, name) => {
//     const response = await apiClient.put(`/api/salesreps/${id}`, { name });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//     };
//   },

//   deleteSalesRep: async id => {
//     const response = await apiClient.delete(`/api/salesreps/${id}`);
//     return response.data;
//   },

//   // =============================================
//   // MAKES MANAGEMENT
//   // =============================================
//   getMakes: async () => {
//     const response = await apiClient.get('/api/makes');
//     return response.data.map(m => ({ id: m._id, _id: m._id, name: m.name }));
//   },

//   addMake: async name => {
//     const response = await apiClient.post('/api/makes', { name });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//     };
//   },

//   deleteMake: async id => {
//     const response = await apiClient.delete(`/api/makes/${id}`);
//     return response.data;
//   },

//   // =============================================
//   // MODELS MANAGEMENT
//   // =============================================
//   getModels: async () => {
//     const makes = await api.getMakes();
//     let allModels = [];
//     for (const make of makes) {
//       try {
//         const res = await apiClient.get(
//           `/api/models/${encodeURIComponent(make.name)}`,
//         );
//         const modelsWithMakeId = res.data.map(m => ({
//           id: m._id,
//           _id: m._id,
//           name: m.name,
//           makeId: make.id,
//         }));
//         allModels.push(...modelsWithMakeId);
//       } catch (err) {
//         console.warn(`Failed to fetch models for make ${make.name}:`, err);
//       }
//     }
//     return allModels;
//   },

//   addModel: async (makeId, name) => {
//     const makes = await api.getMakes();
//     const make = makes.find(m => m.id === makeId);
//     if (!make) throw new Error('Make not found');
//     const response = await apiClient.post('/api/models', {
//       name,
//       make: make.name,
//     });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//       makeId,
//     };
//   },

//   deleteModel: async id => {
//     const response = await apiClient.delete(`/api/models/${id}`);
//     return response.data;
//   },

//   // =============================================
//   // FAULTS MANAGEMENT
//   // =============================================
//   getFaults: async () => {
//     const response = await apiClient.get('/api/faults');
//     return response.data.map(f => ({ id: f._id, _id: f._id, name: f.name }));
//   },

//   addFault: async name => {
//     const response = await apiClient.post('/api/faults', { name, price: 0 });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//     };
//   },

//   deleteFault: async id => {
//     const response = await apiClient.delete(`/api/faults/${id}`);
//     return response.data;
//   },

//   // =============================================
//   // DRAWERS MANAGEMENT
//   // =============================================
//   getDrawers: async () => {
//     const response = await apiClient.get('/api/drawers');
//     return response.data.map(d => ({ id: d._id, _id: d._id, name: d.name }));
//   },

//   addDrawer: async name => {
//     const response = await apiClient.post('/api/drawers', { name });
//     return {
//       id: response.data._id,
//       _id: response.data._id,
//       name: response.data.name,
//     };
//   },

//   deleteDrawer: async id => {
//     const response = await apiClient.delete(`/api/drawers/${id}`);
//     return response.data;
//   },

//   // =============================================
//   // DEALERS MANAGEMENT
//   // =============================================
//   getDealers: async () => {
//     try {
//       const response = await apiClient.get('/api/dealers');
//       let dealers = [];
//       if (Array.isArray(response.data)) {
//         dealers = response.data;
//       } else if (
//         response.data &&
//         response.data.dealers &&
//         Array.isArray(response.data.dealers)
//       ) {
//         dealers = response.data.dealers;
//       }

//       return dealers.map(d => ({
//         id: d._id,
//         _id: d._id,
//         name: d.name,
//       }));
//     } catch (error) {
//       console.warn(
//         '[API] Error fetching dealers (endpoint may not exist):',
//         error.message,
//       );
//       return [];
//     }
//   },

//   // =============================================
//   // USERS MANAGEMENT
//   // =============================================
//   getUsers: async () => {
//     const response = await apiClient.get('/api/users');
//     return response.data;
//   },

//   addUser: async userData => {
//     const response = await apiClient.post('/api/users', userData);
//     return response.data;
//   },

//   deleteUser: async id => {
//     const response = await apiClient.delete(`/api/users/${id}`);
//     return response.data;
//   },
// };

// export default api;
