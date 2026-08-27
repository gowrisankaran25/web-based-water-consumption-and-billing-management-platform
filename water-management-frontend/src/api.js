import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getCommunities: async () => {
    const res = await api.get('/auth/communities');
    return res.data;
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  forceReset: async (email, newPassword) => {
    const res = await api.post('/auth/force-reset', { email, newPassword });
    return res.data;
  },
  resetPassword: async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res.data;
  }
};

export const superAdminApi = {
  getAllCommunities: () => api.get('/superadmin/communities').then(res => res.data),
  registerCommunity: (data) => api.post('/superadmin/communities', data).then(res => res.data),
  approveCommunity: (id) => api.patch(`/superadmin/communities/${id}/approve`).then(res => res.data),
  
  // Global aggregate endpoints
  getAllHouseholds: () => api.get('/superadmin/households').then(res => res.data),
  getAllInvoices: () => api.get('/superadmin/invoices').then(res => res.data),
  getAllMeterReadings: () => api.get('/superadmin/meters').then(res => res.data),
  getAllServiceTickets: () => api.get('/superadmin/tickets').then(res => res.data),
};

export const communityAdminApi = {
  inviteResident: (data) => api.post('/communityadmin/invitations', data).then(res => res.data),
  getInvitations: (communityId) => api.get(`/communityadmin/invitations/${communityId}`).then(res => res.data),
  
  submitMeterReading: (data) => api.post('/communityadmin/meters', data).then(res => res.data),
  getMeterReadings: (communityId) => api.get(`/communityadmin/meters/${communityId}`).then(res => res.data),
  updateMeterStatus: (readingId, status) => api.patch(`/communityadmin/meters/${readingId}/status`, { status }).then(res => res.data),
  
  updateTariff: (communityId, tariffRate) => api.patch(`/communityadmin/tariff/${communityId}`, { tariffRate }).then(res => res.data),
  updateUsageThreshold: (communityId, flatNumber, waterUsageThreshold) => api.patch(`/communityadmin/threshold/${communityId}`, { flatNumber, waterUsageThreshold }).then(res => res.data),
  
  getHouseholds: async (communityId) => {
    const res = await api.get(`/communityadmin/households/${communityId}`);
    return res.data;
  },
  
  generateInvoices: (communityId) => api.post(`/communityadmin/invoices/${communityId}`).then(res => res.data),
  getInvoices: (communityId) => api.get(`/communityadmin/invoices/${communityId}`).then(res => res.data),
};

export const tariffPlanApi = {
  create: (data) => api.post('/tariffs', data).then(res => res.data),
  getByCommunity: (communityId) => api.get(`/tariffs/${communityId}`).then(res => res.data),
  update: (id, data) => api.put(`/tariffs/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/tariffs/${id}`).then(res => res.data),
};

export const bulkWaterPurchaseApi = {
  create: (data) => api.post('/bulk-water-purchases', data).then(res => res.data),
  getByCommunity: (communityId) => api.get(`/bulk-water-purchases/${communityId}`).then(res => res.data),
  update: (id, data) => api.put(`/bulk-water-purchases/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/bulk-water-purchases/${id}`).then(res => res.data),
};

export const billingCycleApi = {
  open: (communityId, startDate, endDate) => api.post('/billing-cycles', null, { params: { communityId, startDate, endDate } }).then(res => res.data),
  getByCommunity: (communityId) => api.get(`/billing-cycles/${communityId}`).then(res => res.data),
  finalize: (id) => api.patch(`/billing-cycles/${id}/finalize`).then(res => res.data),
  archive: (id) => api.patch(`/billing-cycles/${id}/archive`).then(res => res.data),
};

export const notificationApi = {
  sendEmail: (communityId, flatNumber, email, title, message) => api.post('/notifications/email', null, { params: { communityId, flatNumber, email, title, message } }).then(res => res.data),
  sendInApp: (communityId, householdId, flatNumber, title, message) => api.post('/notifications/in-app', null, { params: { communityId, householdId, flatNumber, title, message } }).then(res => res.data),
  getByCommunity: (communityId) => api.get(`/notifications/${communityId}`).then(res => res.data),
};

export const paymentApi = {
  createOrder: (invoiceId) => api.post('/payments/create-order', { invoiceId }).then(res => res.data),
  verifySignature: (data) => api.post('/payments/verify', data).then(res => res.data),
  mockPay: (invoiceId) => api.post('/payments/mock-pay', { invoiceId }).then(res => res.data),
};

export const ticketApi = {
  create: (data) => api.post('/tickets/create', data).then(res => res.data),
  getByCommunity: (communityId) => api.get(`/tickets/community/${communityId}`).then(res => res.data),
  getByFlat: (flatNumber) => api.get(`/tickets/flat/${flatNumber}`).then(res => res.data),
  updateStatus: (id, status) => api.put(`/tickets/${id}/status`, null, { params: { status } }).then(res => res.data),
};

export const invoiceApi = {
  downloadPdf: (invoiceId) => api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' }).then(res => res.data),
};

export default api;

