/**
 * MVPLaunch NG - Production API Client
 * Wraps native fetch with credential cookies, Bearer token fallback, and standardized error parsing.
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')
  : '') + '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('mvplaunch_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('mvplaunch_token', token);
    } else {
      localStorage.removeItem('mvplaunch_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      Accept: 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const config = {
      credentials: 'include', // Sends & receives HTTP-only cookies
      ...options,
      headers
    };

    try {
      const res = await fetch(url, config);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : await res.text();

      if (!res.ok || (isJson && data.success === false)) {
        let errorMsg = data?.message;
        if (!errorMsg) {
          if (res.status === 500 && (!isJson || !data)) {
            errorMsg = 'Backend API server is unreachable on port 5005. Please make sure the backend server is running.';
          } else if ([502, 503, 504].includes(res.status)) {
            errorMsg = 'Backend service is temporarily unavailable. Please verify the server is running.';
          } else {
            errorMsg = `Request failed with status ${res.status}`;
          }
        }
        const error = new Error(errorMsg);
        error.statusCode = res.status;
        error.errors = data?.errors || null;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        const networkError = new Error('Cannot connect to MVPLaunch NG backend API. Make sure the backend server is running on port 5005.');
        networkError.statusCode = 503;
        throw networkError;
      }
      if (err.statusCode === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/me')) {
        this.setToken(null);
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PATCH', body, ...options });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  // --- 1. Auth Module ---
  auth = {
    register: (body) => this.post('/auth/register', body),
    login: (body) => this.post('/auth/login', body),
    logout: () => this.post('/auth/logout', {}),
    me: () => this.get('/auth/me'),
    changePassword: (body) => this.post('/auth/change-password', body)
  };

  // --- 2. Ideas Module ---
  ideas = {
    submit: (body) => this.post('/ideas', body),
    getMy: (query = '') => this.get(`/ideas/my${query}`),
    getAll: (query = '') => this.get(`/ideas${query}`),
    getById: (id) => this.get(`/ideas/${id}`),
    updateStatus: (id, body) => this.patch(`/ideas/${id}/status`, body)
  };

  // --- 3. Scope Module ---
  scope = {
    clarifyProblem: (body) => this.post('/scope/problem', body),
    defineCustomer: (body) => this.post('/scope/customer', body),
    defineMvp: (body) => this.post('/scope/mvp', body),
    getBundle: (ideaId) => this.get(`/scope/idea/${ideaId}`)
  };

  // --- 4. Projects Module ---
  projects = {
    create: (body) => this.post('/projects', body),
    submit: (body) => this.post('/projects/submit', body),
    list: (query = '') => this.get(`/projects${query}`),
    getById: (id) => this.get(`/projects/${id}`),
    getByCode: (code) => this.get(`/projects/track/${code}`),
    updateScope: (id, body) => this.patch(`/projects/${id}/scope`, body),
    assignEngineer: (id, body) => this.post(`/projects/${id}/assign-engineer`, body),
    accept: (id) => this.post(`/projects/${id}/accept`, {}),
    updateProgress: (id, body) => this.patch(`/projects/${id}/progress`, body),
    submitDeliverable: (id, body) => this.post(`/projects/${id}/deliverables`, body),
    reviewDeliverable: (deliverableId, body) => this.patch(`/projects/deliverables/${deliverableId}/review`, body),
    markDelivered: (id, body) => this.post(`/projects/${id}/deliver`, body),
    addNote: (id, body) => this.post(`/projects/${id}/notes`, body),
    getNotes: (id) => this.get(`/projects/${id}/notes`),
    listEngineers: () => this.get('/projects/meta/engineers'),
    updateStatus: (id, body) => this.patch(`/projects/${id}/status`, body)
  };

  // --- 5. Proposals Module ---
  proposals = {
    create: (body) => this.post('/proposals', body),
    getByProject: (projectId) => this.get(`/proposals/project/${projectId}`),
    getById: (id) => this.get(`/proposals/${id}`),
    respond: (id, action) => this.post(`/proposals/${id}/respond`, { action })
  };

  // --- 6. Orders Module ---
  orders = {
    list: (query = '') => this.get(`/orders${query}`),
    getById: (id) => this.get(`/orders/${id}`)
  };

  // --- 7. Milestones Module ---
  milestones = {
    create: (body) => this.post('/milestones', body),
    getByProject: (projectId) => this.get(`/milestones/project/${projectId}`),
    submit: (id) => this.post(`/milestones/${id}/submit`, {}),
    approve: (id) => this.post(`/milestones/${id}/approve`, {})
  };

  // --- 8. Tasks Module ---
  tasks = {
    create: (body) => this.post('/tasks', body),
    getByProject: (projectId) => this.get(`/tasks/project/${projectId}`),
    update: (id, body) => this.patch(`/tasks/${id}`, body),
    delete: (id) => this.delete(`/tasks/${id}`)
  };

  // --- 9. Files Module ---
  files = {
    upload: (formData) => this.post('/files/upload', formData),
    getByProject: (projectId) => this.get(`/files/project/${projectId}`),
    delete: (id) => this.delete(`/files/${id}`)
  };

  // --- 10. Messages Module ---
  messages = {
    send: (body) => this.post('/messages', body),
    getByProject: (projectId, query = '') => this.get(`/messages/project/${projectId}${query}`)
  };

  // --- 11. Payments Module ---
  payments = {
    initialize: (body) => this.post('/payments/initialize', body),
    initializePackage: (body) => this.post('/payments/initialize-package', body),
    verify: (reference) => this.get(`/payments/verify/${encodeURIComponent(reference)}`),
    verifyPost: (reference) => this.post('/payments/verify', { reference }),
    getMy: (query = '') => this.get(`/payments/my${query}`)
  };

  // --- 11b. Packages Module ---
  packages = {
    getAll: () => this.get('/packages'),
    getById: (id) => this.get(`/packages/${id}`),
    initializeCheckout: (body) => this.post('/payments/initialize-package', body)
  };

  // --- 12. Deployments Module ---
  deployments = {
    record: (body) => this.post('/deployments', body),
    getByProject: (projectId) => this.get(`/deployments/project/${projectId}`)
  };

  // --- 13. Handover Module ---
  handover = {
    initiate: (body) => this.post('/handover', body),
    getByProject: (projectId) => this.get(`/handover/project/${projectId}`),
    updateChecklist: (projectId, body) => this.patch(`/handover/project/${projectId}/checklist`, body),
    signoff: (projectId, roleType) => this.post(`/handover/project/${projectId}/signoff`, { roleType })
  };

  // --- 14. Validation Module ---
  validation = {
    record: (body) => this.post('/validation', body),
    getByProject: (projectId) => this.get(`/validation/project/${projectId}`)
  };

  // --- 15. Maintenance Module ---
  maintenance = {
    subscribe: (body) => this.post('/maintenance', body),
    getMy: () => this.get('/maintenance/my')
  };

  // --- 16. Reviews Module ---
  reviews = {
    getPublic: (query = '') => this.get(`/reviews${query}`),
    submit: (body) => this.post('/reviews', body),
    feature: (id, isFeatured) => this.patch(`/reviews/${id}/feature`, { isFeatured })
  };

  // --- 17. Notifications Module ---
  notifications = {
    getMy: () => this.get('/notifications'),
    markRead: (id) => this.patch(`/notifications/${id}/read`, {}),
    markAllRead: () => this.patch('/notifications/read-all', {})
  };

  // --- 18. Admin Module ---
  admin = {
    getMetrics: () => this.get('/admin/metrics'),
    getHealth: () => this.get('/admin/health'),
    getOrders: (query = '') => this.get(`/admin/orders${query}`),
    updateOrderFulfillment: (id, fulfillmentStatus) => this.patch(`/admin/orders/${id}/fulfillment`, { fulfillmentStatus }),
    listAuditLogs: (query = '') => this.get(`/audit-logs${query}`)
  };
}

export const api = new ApiClient();
