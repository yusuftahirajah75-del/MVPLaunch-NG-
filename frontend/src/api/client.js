/**
 * MVPLaunch NG - Production API Client
 * Wraps native fetch with credential cookies, Bearer token fallback, and standardized error parsing.
 */

const API_BASE = '/api/v1';

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
        const error = new Error(data.message || `Request failed with status ${res.status}`);
        error.statusCode = res.status;
        error.errors = data.errors || null;
        throw error;
      }

      return data;
    } catch (err) {
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
    list: (query = '') => this.get(`/projects${query}`),
    getById: (id) => this.get(`/projects/${id}`),
    updateStatus: (id, body) => this.patch(`/projects/${id}/status`, body),
    assignDeveloper: (id, developerId) => this.post(`/projects/${id}/assign`, { developerId })
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
    verify: (reference) => this.post('/payments/verify', { reference }),
    getMy: (query = '') => this.get(`/payments/my${query}`)
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
    listAuditLogs: (query = '') => this.get(`/audit-logs${query}`)
  };
}

export const api = new ApiClient();
