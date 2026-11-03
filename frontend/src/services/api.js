/**
 * API Service for FraudShield AI Platform
 * Handles communication with FastAPI backend endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const getAuthToken = () => localStorage.getItem('fraud_token');
export const setAuthToken = (token) => localStorage.setItem('fraud_token', token);
export const removeAuthToken = () => localStorage.removeItem('fraud_token');

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMessage = errData.detail || errorMessage;
    } catch {
      // Fallback
    }
    throw new Error(errorMessage);
  }

  // If response is a file download or raw text
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.blob();
  }

  return response.json();
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  getMe: () => request('/auth/me'),

  // Analytics & KPIs
  getOverviewKPIs: () => request('/analytics/overview'),
  getTrends: () => request('/analytics/trends'),
  getCategories: () => request('/analytics/categories'),
  getRiskDistribution: () => request('/analytics/risk-distribution'),

  // Transactions
  getTransactions: ({ search = '', risk_level = '', merchant_category = '', page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (risk_level) params.append('risk_level', risk_level);
    if (merchant_category) params.append('merchant_category', merchant_category);
    params.append('page', page);
    params.append('limit', limit);
    return request(`/transactions/?${params.toString()}`);
  },

  getTransactionDetails: (txnId) => request(`/transactions/${txnId}`),

  // Real-Time ML Prediction
  predictSingle: (transactionData) =>
    request('/predict/', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    }),

  // CSV Batch Upload
  uploadBatchCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/transactions/batch-upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Alerts Management
  getAlerts: (statusFilter = '', limit = 50) => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);
    params.append('limit', limit);
    return request(`/alerts/?${params.toString()}`);
  },

  updateAlertStatus: (alertId, status, notes = '') =>
    request(`/alerts/${alertId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // Reports
  getCSVExportUrl: (onlyFlagged = true) =>
    `${API_BASE_URL}/reports/export-csv?only_flagged=${onlyFlagged}`,

  // Reset & Demo Seeding (For Clean Viva/Presentation Demos)
  resetAllData: () => request('/analytics/reset-all', { method: 'POST' }),
  seedDemoData: () => request('/analytics/seed-demo', { method: 'POST' }),
};
