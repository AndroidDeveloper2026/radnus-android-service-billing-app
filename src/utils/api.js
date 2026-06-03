// src/utils/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@radnus_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Transformers ----------
const transformJobToFrontend = (job) => {
  if (!job) return {};
  
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
    makeId: job.device?.make || '',
    modelId: job.device?.model || '',
    imei: job.device?.imei || '',
    warranty: job.device?.warranty || 'No Warranty',
    patternPin: job.device?.pattern || '',
    mobileStatus: job.device?.mobileStatus || 'Received',
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
    status: job.device?.mobileStatus || 'Received',
    jobStatus: job.device?.mobileStatus || 'Received',
    savedDate: job.createdAt || new Date().toISOString(),
    createdAt: job.createdAt || new Date().toISOString(),
    createdBy: job.createdBy || {},
    isInvoiced: job.isInvoiced || false,
  };
};

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
    make: jobData.makeId || '',
    model: jobData.modelId || '',
    imei: jobData.imei || '',
    warranty: jobData.warranty || 'No Warranty',
    pattern: jobData.patternPin || '',
    mobileStatus: jobData.status || 'Received',
  },
  physicalCondition: jobData.physicalConditions || [],
  accessories: jobData.accessoriesReceived || [],
  visualIssues: [],
  idProofType: jobData.idProof || '',
  service: {
    engineer: jobData.engineerId || '',
    dealer: jobData.dealerName || '',
    drawer: jobData.drawerId || '',
    serviceCharge: Number(jobData.serviceCharges) || 0,
    spareCharge: Number(jobData.spareCharges) || 0,
    estimate: String(jobData.estimateAmount || '0'),
    paymentMode: jobData.paymentMode || '',
    repairDate: jobData.repairDate || new Date().toISOString(),
    deliveryDate: jobData.deliveredDate || null,
    remarks: jobData.remarks || '',
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

// ---------- API Functions ----------
export const api = {
  // Auth
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

  // Jobs - FIXED: Return raw data without transformation for reports
  getJobs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.search || filters.q) params.append('q', filters.search || filters.q);
      if (filters.status && filters.status !== 'All Status') params.append('status', filters.status);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.engineerId || filters.engineer) params.append('engineer', filters.engineerId || filters.engineer);
      if (filters.dealerName || filters.dealer) params.append('dealer', filters.dealerName || filters.dealer);
      
      const queryString = params.toString();
      console.log('[API] Fetching jobs with params:', queryString);
      
      const response = await apiClient.get(`/api/jobsheets/filter${queryString ? '?' + queryString : ''}`);
      
      console.log('[API] Response data type:', typeof response.data);
      console.log('[API] Is array:', Array.isArray(response.data));
      console.log('[API] Data length:', Array.isArray(response.data) ? response.data.length : 'N/A');
      
      // Handle different response formats
      let jobs = [];
      if (Array.isArray(response.data)) {
        jobs = response.data;
      } else if (response.data && response.data.jobs && Array.isArray(response.data.jobs)) {
        jobs = response.data.jobs;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        jobs = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find any array in the response
        const arrayKey = Object.keys(response.data).find(key => Array.isArray(response.data[key]));
        if (arrayKey) {
          console.log('[API] Found array in key:', arrayKey);
          jobs = response.data[arrayKey];
        } else {
          console.warn('[API] Unexpected response format, keys:', Object.keys(response.data));
        }
      }
      
      // Transform to ensure all required fields exist
      const transformedJobs = jobs.map(transformJobToFrontend);
      console.log('[API] Transformed jobs count:', transformedJobs.length);
      
      return transformedJobs;
    } catch (error) {
      console.error('[API] Error fetching jobs:', error);
      throw error;
    }
  },

  getJobById: async (id) => {
    const response = await apiClient.get(`/api/jobsheets/${id}`);
    return transformJobToFrontend(response.data);
  },

  createJob: async (jobData) => {
    // 1. Get the next job number from the backend
    let nextJobNo;
    try {
      const nextRes = await apiClient.get('/api/jobsheets/next-number');
      nextJobNo = nextRes.data.next;
    } catch (err) {
      console.warn('Failed to fetch next job number, using fallback:', err);
      nextJobNo = `JS-${Date.now()}`;
    }

    // 2. Merge the job number into the data
    const dataWithNo = { ...jobData, jobNo: nextJobNo };

    const userStr = await AsyncStorage.getItem('@radnus_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const backendData = transformJobToBackend(dataWithNo, user);
    
    // 3. Stringify nested objects as required by the backend
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
    
    // Ensure jobSheetNo is included
    payload.jobSheetNo = nextJobNo;
    
    const response = await apiClient.post('/api/jobsheets', payload);
    return transformJobToFrontend(response.data);
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
    return transformJobToFrontend(response.data);
  },

  deleteJob: async (id) => {
    throw new Error('Delete not implemented in backend');
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/dashboard/stats');
    return {
      total: response.data.totalJobs,
      pending: response.data.pendingJobs,
      completed: response.data.completedJobs,
    };
  },

  // Engineers
  getEngineers: async () => {
    try {
      const response = await apiClient.get('/api/engineers');
      console.log('[API] Engineers response:', response.data);
      
      // Handle different response formats
      let engineers = [];
      if (Array.isArray(response.data)) {
        engineers = response.data;
      } else if (response.data && response.data.engineers && Array.isArray(response.data.engineers)) {
        engineers = response.data.engineers;
      }
      
      return engineers.map(e => ({ 
        id: e._id, 
        _id: e._id, 
        name: e.name 
      }));
    } catch (error) {
      console.error('[API] Error fetching engineers:', error);
      return [];
    }
  },
  
  addEngineer: async (name) => {
    const response = await apiClient.post('/api/engineers', { name });
    return { id: response.data._id, _id: response.data._id, name: response.data.name };
  },
  
  updateEngineer: async (id, name) => {
    const response = await apiClient.put(`/api/engineers/${id}`, { name });
    return { id: response.data._id, _id: response.data._id, name: response.data.name };
  },
  
  deleteEngineer: async (id) => {
    console.log('API deleteEngineer called with id:', id);
    const response = await apiClient.delete(`/api/engineers/${id}`);
    return response.data;
  },

  // Makes
  getMakes: async () => {
    const response = await apiClient.get('/api/makes');
    return response.data.map(m => ({ id: m._id, _id: m._id, name: m.name }));
  },
  
  addMake: async (name) => {
    const response = await apiClient.post('/api/makes', { name });
    return { id: response.data._id, _id: response.data._id, name: response.data.name };
  },
  
  deleteMake: async (id) => {
    console.log('API deleteMake called with id:', id);
    const response = await apiClient.delete(`/api/makes/${id}`);
    return response.data;
  },

  // Models
  getModels: async () => {
    const makes = await api.getMakes();
    let allModels = [];
    for (const make of makes) {
      try {
        const res = await apiClient.get(`/api/models/${encodeURIComponent(make.name)}`);
        const modelsWithMakeId = res.data.map(m => ({
          id: m._id,
          _id: m._id,
          name: m.name,
          makeId: make.id,
        }));
        allModels.push(...modelsWithMakeId);
      } catch (err) {
        console.warn(`Failed to fetch models for make ${make.name}:`, err);
      }
    }
    return allModels;
  },
  
  addModel: async (makeId, name) => {
    const makes = await api.getMakes();
    const make = makes.find(m => m.id === makeId);
    if (!make) throw new Error('Make not found');
    const response = await apiClient.post('/api/models', { name, make: make.name });
    return { id: response.data._id, _id: response.data._id, name: response.data.name, makeId };
  },
  
  deleteModel: async (id) => {
    console.log('API deleteModel called with id:', id);
    const response = await apiClient.delete(`/api/models/${id}`);
    return response.data;
  },

  // Faults
  getFaults: async () => {
    const response = await apiClient.get('/api/faults');
    return response.data.map(f => ({ id: f._id, _id: f._id, name: f.name }));
  },
  
  addFault: async (name) => {
    const response = await apiClient.post('/api/faults', { name, price: 0 });
    return { id: response.data._id, _id: response.data._id, name: response.data.name };
  },
  
  deleteFault: async (id) => {
    console.log('API deleteFault called with id:', id);
    const response = await apiClient.delete(`/api/faults/${id}`);
    return response.data;
  },

  // Drawers
  getDrawers: async () => {
    const response = await apiClient.get('/api/drawers');
    return response.data.map(d => ({ id: d._id, _id: d._id, name: d.name }));
  },
  
  addDrawer: async (name) => {
    const response = await apiClient.post('/api/drawers', { name });
    return { id: response.data._id, _id: response.data._id, name: response.data.name };
  },
  
  deleteDrawer: async (id) => {
    console.log('API deleteDrawer called with id:', id);
    const response = await apiClient.delete(`/api/drawers/${id}`);
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await apiClient.get('/api/users');
    return response.data;
  },
  
  addUser: async (userData) => {
    const response = await apiClient.post('/api/users', userData);
    return response.data;
  },
  
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },

  // User Report
  getUserReport: async (searchTerm = '') => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('jobSheetNo', searchTerm);
    const response = await apiClient.get(`/api/jobsheets/user-report?${params.toString()}`);
    return response.data;
  },

  // Dealers - Add this function if you have a dealers endpoint
  getDealers: async () => {
    try {
      const response = await apiClient.get('/api/dealers');
      console.log('[API] Dealers response:', response.data);
      
      let dealers = [];
      if (Array.isArray(response.data)) {
        dealers = response.data;
      } else if (response.data && response.data.dealers && Array.isArray(response.data.dealers)) {
        dealers = response.data.dealers;
      }
      
      return dealers.map(d => ({ 
        id: d._id, 
        _id: d._id, 
        name: d.name 
      }));
    } catch (error) {
      console.warn('[API] Error fetching dealers (endpoint may not exist):', error.message);
      return [];
    }
  },
};

export default api;