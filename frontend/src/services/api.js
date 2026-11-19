const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('otg_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status === 401 && typeof window !== 'undefined') {
      // Auto logout on unauthorized if token is invalid
      // localStorage.removeItem('otg_token');
      // localStorage.removeItem('otg_user');
    }
    throw err;
  }
}

export const api = {
  // Auth API
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request('/auth/me'),
    updateProfile: (data) =>
      request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Orders API
  orders: {
    create: (orderData) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      }),
    getMyOrders: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/orders/my-orders${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/orders/${id}`),
    track: (trackingNumber) => request(`/orders/track/${encodeURIComponent(trackingNumber)}`),
    cancel: (id, reason) =>
      request(`/orders/${id}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      }),
    submitFeedback: (id, feedback) =>
      request(`/orders/${id}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedback),
      }),
  },

  // Courier API
  courier: {
    getProfile: () => request('/courier/profile'),
    getDeliveries: (status) =>
      request(`/courier/deliveries${status ? `?status=${status}` : ''}`),
    getAvailable: () => request('/courier/available'),
    accept: (orderId) =>
      request(`/courier/deliveries/${orderId}/accept`, {
        method: 'POST',
      }),
    updateStatus: (orderId, updateData) =>
      request(`/courier/deliveries/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }),
    toggleAvailability: (isAvailable) =>
      request('/courier/availability', {
        method: 'PUT',
        body: JSON.stringify({ is_available: isAvailable }),
      }),
  },

  // Admin API
  admin: {
    getStats: () => request('/admin/dashboard-stats'),
    getAnalytics: () => request('/admin/analytics'),
    getAllOrders: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/orders${query ? `?${query}` : ''}`);
    },
    assignCourier: (orderId, courierId) =>
      request(`/admin/orders/${orderId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ courier_id: courierId }),
      }),
    getAllCouriers: () => request('/admin/couriers'),
    getAllUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/admin/users${query ? `?${query}` : ''}`);
    },
    toggleUserStatus: (userId) =>
      request(`/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
      }),
    getReports: () => request('/admin/reports'),
  },
};

export default api;
