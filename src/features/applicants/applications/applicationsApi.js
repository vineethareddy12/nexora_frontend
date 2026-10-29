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
   * Retrieves all applications submitted by the logged-in candidate.
   */
  async getMyApplications() {
    const res = await authFetch(API_ENDPOINTS.applications);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch applications (Error ${res.status})`);
    }

    return json.data?.applications || [];
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

