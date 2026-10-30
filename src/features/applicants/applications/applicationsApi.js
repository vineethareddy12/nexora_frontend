import { authFetch } from '../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../config/apiConfig';

export const applicationsApi = {
  /**
   * Submits an application for a published job.
   */
  async submitApplication(jobId, payload) {
    const res = await authFetch(`${API_ENDPOINTS.jobs}/${jobId}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Application submission failed (Error ${res.status})`);
    }

    return json.data?.application;
  },

  /**
   * Retrieves applications submitted by the logged-in candidate with search, filters, pagination.
   */
  async getMyApplications(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search && params.search.trim() !== '') query.append('search', params.search.trim());
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${API_ENDPOINTS.applications}${qs}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch applications (Error ${res.status})`);
    }

    return json.data;
  },

  /**
   * Retrieves aggregated dashboard summary metrics and 5 latest applications.
   */
  async getApplicantDashboard() {
    const res = await authFetch(API_ENDPOINTS.dashboard);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch dashboard metrics (Error ${res.status})`);
    }

    return json.data;
  },

  /**
   * Retrieves full details for a specific application.
   */
  async getApplicationDetails(id) {
    const res = await authFetch(`${API_ENDPOINTS.applications}/${id}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch application details (Error ${res.status})`);
    }

    return json.data?.application;
  },

  /**
   * Retrieves document snapshots associated with a specific application.
   */
  async getApplicationDocuments(id) {
    const res = await authFetch(`${API_ENDPOINTS.applications}/${id}/documents`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch application documents (Error ${res.status})`);
    }

    return json.data?.documents || [];
  },

  /**
   * Withdraws a candidate's submitted application.
   */
  async withdrawApplication(id, reason) {
    const res = await authFetch(`${API_ENDPOINTS.applications}/${id}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to withdraw application (Error ${res.status})`);
    }

    return json.data;
  },
};

