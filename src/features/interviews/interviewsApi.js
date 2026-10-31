import { authFetch } from '../auth/api/authFetch';
import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/api/v1`;

export const interviewsApi = {
  // Admin Methods
  async getAdminDashboardMetrics() {
    const res = await authFetch(`${BASE_URL}/admin/interviews/dashboard`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to load interview metrics');
    return json.data;
  },

  async getAdminInterviews(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.jobId) query.append('jobId', params.jobId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${BASE_URL}/admin/interviews${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch interviews');
    return json.data;
  },

  async scheduleInterview(payload) {
    const res = await authFetch(`${BASE_URL}/admin/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      let msg = json?.error?.message || 'Failed to schedule interview';
      if (Array.isArray(json?.error?.details) && json.error.details.length > 0) {
        msg = json.error.details.map((d) => `${d.field ? `${d.field}: ` : ''}${d.message}`).join(' | ');
      }
      throw new Error(msg);
    }
    return json.data;
  },

  async getInterviewDetails(id) {
    const res = await authFetch(`${BASE_URL}/admin/interviews/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch interview details');
    return json.data;
  },

  async rescheduleInterview(id, payload) {
    const res = await authFetch(`${BASE_URL}/admin/interviews/${id}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      let msg = json?.error?.message || 'Failed to reschedule interview';
      if (Array.isArray(json?.error?.details) && json.error.details.length > 0) {
        msg = json.error.details.map((d) => `${d.field ? `${d.field}: ` : ''}${d.message}`).join(' | ');
      }
      throw new Error(msg);
    }
    return json.data;
  },

  async cancelInterview(id, payload) {
    const res = await authFetch(`${BASE_URL}/admin/interviews/${id}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      let msg = json?.error?.message || 'Failed to cancel interview';
      if (Array.isArray(json?.error?.details) && json.error.details.length > 0) {
        msg = json.error.details.map((d) => `${d.field ? `${d.field}: ` : ''}${d.message}`).join(' | ');
      }
      throw new Error(msg);
    }
    return json.data;
  },

  async addFeedback(id, payload) {
    const res = await authFetch(`${BASE_URL}/admin/interviews/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to record feedback');
    return json.data;
  },

  // Applicant Methods
  async getApplicantInterviews(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${BASE_URL}/me/interviews${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch candidate interviews');
    return json.data;
  },

  async getApplicantInterviewDetails(id) {
    const res = await authFetch(`${BASE_URL}/me/interviews/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch interview details');
    return json.data;
  },
};

