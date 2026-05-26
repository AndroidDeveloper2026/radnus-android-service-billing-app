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
const transformJobToFrontend = (job) => ({
  id: job._id,
  jobNo: job.jobSheetNo,
  customerName: job.customer?.name || '',
  contact: job.customer?.contact || '',
  altContact: job.customer?.altContact || '',
  address: job.customer?.address || '',
  email: job.customer?.email || '',
  makeId: job.device?.make || '',
  modelId: job.device?.model || '',
  imei: job.device?.imei || '',
  warranty: job.device?.warranty || 'No Warranty',
  patternPin: job.device?.pattern || '',
  idProof: job.idProofType || '',
  physicalConditions: job.physicalCondition || [],
  accessoriesReceived: job.accessories || [],
  batteryNumber: '',
  engineerId: job.service?.engineer || '',
  dealerName: job.service?.dealer || '',
  drawerId: job.service?.drawer || '',
  serviceCharges: job.service?.serviceCharge || 0,
  spareCharges: job.service?.spareCharge || 0,
  estimateAmount: parseFloat(job.service?.estimate) || 0,
  paymentMode: job.service?.paymentMode || '',
  // Store dates as strings (ISO) – serializable
  repairDate: job.service?.repairDate ? job.service.repairDate : new Date().toISOString(),
  deliveredDate: job.service?.deliveryDate || null,
  remarks: job.service?.remarks || '',
  spareItems: job.spareItems || [],
  status: job.device?.mobileStatus || 'Received',
  savedDate: job.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
  isInvoiced: job.isInvoiced || false,
});

const transformJobToBackend = (jobData, currentUser) => ({
  jobSheetNo: jobData.jobNo,
  customer: {
    name: jobData.customerName,
    contact: jobData.contact,
    altContact: jobData.altContact,
    address: jobData.address,
    email: jobData.email,
  },
  device: {
    make: jobData.makeId,
    model: jobData.modelId,
    imei: jobData.imei,
    warranty: jobData.warranty,
    pattern: jobData.patternPin,
    mobileStatus: jobData.status,
  },
  physicalCondition: jobData.physicalConditions,
  accessories: jobData.accessoriesReceived,
  visualIssues: [],
  idProofType: jobData.idProof,
  service: {
    engineer: jobData.engineerId,
    dealer: jobData.dealerName,
    drawer: jobData.drawerId,
    serviceCharge: Number(jobData.serviceCharges),
    spareCharge: Number(jobData.spareCharges),
    estimate: String(jobData.estimateAmount),
    paymentMode: jobData.paymentMode,
    repairDate: jobData.repairDate, // already string or Date – axios will stringify
    deliveryDate: jobData.deliveredDate,
    remarks: jobData.remarks,
  },
  spareItems: jobData.spareItems,
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

  // Jobs
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('q', filters.search);
    if (filters.status && filters.status !== 'All Status') params.append('status', filters.status);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.engineerId) params.append('engineer', filters.engineerId);
    const response = await apiClient.get(`/api/jobsheets/filter?${params.toString()}`);
    return response.data.map(transformJobToFrontend);
  },

  getJobById: async (id) => {
    const response = await apiClient.get(`/api/jobsheets/${id}`);
    return transformJobToFrontend(response.data);
  },

  createJob: async (jobData) => {
    const userStr = await AsyncStorage.getItem('@radnus_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const backendData = transformJobToBackend(jobData, user);
    const response = await apiClient.post('/api/jobsheets', backendData);
    return transformJobToFrontend(response.data);
  },

  updateJob: async (id, jobData) => {
    const userStr = await AsyncStorage.getItem('@radnus_user');
    const user = userStr ? JSON.parse(userStr) : null;
    const backendData = transformJobToBackend(jobData, user);
    const response = await apiClient.put(`/api/jobsheets/${id}`, backendData);
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
    const response = await apiClient.get('/api/engineers');
    return response.data.map(e => ({ id: e._id, name: e.name }));
  },
  addEngineer: async (name) => {
    const response = await apiClient.post('/api/engineers', { name });
    return { id: response.data._id, name: response.data.name };
  },
  deleteEngineer: async (id) => {
    await apiClient.delete(`/api/engineers/${id}`);
  },

  // Makes
  getMakes: async () => {
    const response = await apiClient.get('/api/makes');
    return response.data.map(m => ({ id: m._id, name: m.name }));
  },
  addMake: async (name) => {
    const response = await apiClient.post('/api/makes', { name });
    return { id: response.data._id, name: response.data.name };
  },
  deleteMake: async (id) => {
    await apiClient.delete(`/api/makes/${id}`);
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
    return { id: response.data._id, name: response.data.name, makeId };
  },
  deleteModel: async (id) => {
    await apiClient.delete(`/api/models/${id}`);
  },

  // Faults
  getFaults: async () => {
    const response = await apiClient.get('/api/faults');
    return response.data.map(f => ({ id: f._id, name: f.name }));
  },
  addFault: async (name) => {
    const response = await apiClient.post('/api/faults', { name, price: 0 });
    return { id: response.data._id, name: response.data.name };
  },
  deleteFault: async (id) => {
    await apiClient.delete(`/api/faults/${id}`);
  },

  // Drawers
  getDrawers: async () => {
    const response = await apiClient.get('/api/drawers');
    return response.data.map(d => ({ id: d._id, name: d.name }));
  },
  addDrawer: async (name) => {
    const response = await apiClient.post('/api/drawers', { name });
    return { id: response.data._id, name: response.data.name };
  },
  deleteDrawer: async (id) => {
    await apiClient.delete(`/api/drawers/${id}`);
  },

// Add inside the api object in src/utils/api.js

getUsers: async () => {
  const response = await apiClient.get('/api/users');
  return response.data;
},

addUser: async (userData) => {
  const response = await apiClient.post('/api/users', userData);
  return response.data;
},

deleteUser: async (id) => {
  await apiClient.delete(`/api/users/${id}`);
},

updateEngineer: async (id, name) => {
  const response = await apiClient.put(`/api/engineers/${id}`, { name });
  return response.data;
},

// Inside src/utils/api.js, add to the api object:
getUserReport: async (searchTerm = '') => {
  const params = new URLSearchParams();
  if (searchTerm) params.append('jobSheetNo', searchTerm);
  const response = await apiClient.get(`/api/jobsheets/user-report?${params.toString()}`);
  return response.data;
},

};