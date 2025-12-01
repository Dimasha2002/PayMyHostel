import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('adminUser');
      // Dispatch custom event to trigger logout in App component
      window.dispatchEvent(new CustomEvent('unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

// Admin APIs
export const adminAPI = {
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getRoomOccupancy: () => api.get('/admin/room-occupancy'),
  approvePayment: (paymentId) => api.put(`/admin/payments/${paymentId}/approve`),
  rejectPayment: (paymentId, reason) => api.put(`/admin/payments/${paymentId}/reject`, { reason })
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getRoommates: () => api.get('/users/roommates'),
  getStudents: () => api.get('/users/students'),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/users/${userId}`)
};

// Payment APIs
export const paymentAPI = {
  submitPayment: (formData) => {
    return api.post('/payments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getMyPayments: () => api.get('/payments/my-payments'),
  getPendingPayments: () => api.get('/payments/pending'),
  getAllPayments: () => api.get('/payments'),
  getPaymentReceipt: (paymentId) => api.get(`/payments/${paymentId}/receipt`, {
    responseType: 'blob'
  })
};

// Notice APIs
export const noticeAPI = {
  createNotice: (data) => api.post('/notices', data),
  getAllNotices: () => api.get('/notices/admin/all'),
  getActiveNotices: () => api.get('/notices'),
  updateNotice: (noticeId, data) => api.put(`/notices/${noticeId}`, data),
  deleteNotice: (noticeId) => api.delete(`/notices/${noticeId}`)
};

// Room APIs
export const roomAPI = {
  getAllRooms: () => api.get('/rooms'),
  getRoom: (roomId) => api.get(`/rooms/${roomId}`)
};

export default api;
