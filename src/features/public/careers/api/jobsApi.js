import { authFetch } from '../../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.v1;

export const jobsApi = {
  async getPublishedJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'ALL') query.append('department', params.department);
    if (params.employmentType && params.employmentType !== 'ALL') query.append('employmentType', params.employmentType);
    if (params.workMode && params.workMode !== 'ALL') query.append('workMode', params.workMode);
    if (params.location && params.location !== 'ALL') query.append('location', params.location);
    if (params.availability && params.availability !== 'ALL') query.append('availability', params.availability);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/jobs${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch jobs');
    return json.data;
  },

  async getJobDetails(idOrCode) {
    const res = await fetch(`${API_BASE}/jobs/${idOrCode}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch job vacancy');
    return json.data.job;
  },

  async getAdminJobs(params = {}, accessToken) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.department && params.department !== 'ALL') query.append('department', params.department);
    if (params.availability && params.availability !== 'ALL') query.append('availability', params.availability);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/jobs${qs}`, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch admin jobs');
    return json.data;
  },

  async getAdminJobById(id, accessToken) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/jobs/${id}`, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch job');
    return json.data.job;
  },

  async createJob(data, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to create job');
    return json.data.job;
  },

  async updateJob(id, data, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/jobs/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update job');
    return json.data.job;
  },

  async updateJobStatus(id, status, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/jobs/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update job status');
    return json.data.job;
  },

  async deleteJob(id, accessToken) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/jobs/${id}`, {
      method: 'DELETE',
      headers,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to delete job');
    return json;
  },
};
