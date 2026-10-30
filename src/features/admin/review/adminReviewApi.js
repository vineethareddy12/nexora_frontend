import { authFetch } from '../../auth/api/authFetch';
import { API_BASE_URL } from '../../../config/apiConfig';

const ADMIN_API = `${API_BASE_URL}/api/v1/admin`;

export const adminReviewApi = {
  /**
   * Retrieves aggregated live dashboard statistics and recent applications.
   */
  async getDashboard() {
    const res = await authFetch(`${ADMIN_API}/dashboard`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch admin dashboard (${res.status})`);
    }
    return json.data;
  },

  /**
   * Retrieves paginated registered applicants with search, profile status and sorting.
   */
  async getApplicants(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.hasProfile && params.hasProfile !== 'ALL') query.append('hasProfile', params.hasProfile);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${ADMIN_API}/applicants${qs}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch applicants (${res.status})`);
    }
    return json.data;
  },

  /**
   * Retrieves complete applicant credentials, profile and submitted application history.
   */
  async getApplicantDetails(id) {
    const res = await authFetch(`${ADMIN_API}/applicants/${id}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch applicant details (${res.status})`);
    }
    return json.data?.applicant;
  },

  /**
   * Retrieves paginated applications with search, status, job, and date range filters.
   */
  async getApplications(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.jobId && params.jobId !== 'ALL') query.append('jobId', params.jobId);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${ADMIN_API}/applications${qs}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch applications (${res.status})`);
    }
    return json.data;
  },

  /**
   * Retrieves full application review details, document snapshots, history and internal notes.
   */
  async getApplicationDetails(id) {
    const res = await authFetch(`${ADMIN_API}/applications/${id}`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch application review (${res.status})`);
    }
    return json.data?.application;
  },

  /**
   * Updates application status according to state-machine transition rules.
   */
  async updateStatus(id, { status, remarks, internalRemarks }) {
    const res = await authFetch(`${ADMIN_API}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks, internalRemarks }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to update status (${res.status})`);
    }
    return json.data;
  },

  /**
   * Adds an internal review note visible exclusively to administrators.
   */
  async addNote(id, { note }) {
    const res = await authFetch(`${ADMIN_API}/applications/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to add review note (${res.status})`);
    }
    return json.data?.note;
  },

  /**
   * Retrieves internal notes for an application.
   */
  async getNotes(id) {
    const res = await authFetch(`${ADMIN_API}/applications/${id}/notes`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch review notes (${res.status})`);
    }
    return json.data?.notes || [];
  },

  /**
   * Retrieves chronological status transition history.
   */
  async getStatusHistory(id) {
    const res = await authFetch(`${ADMIN_API}/applications/${id}/status-history`);
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch status history (${res.status})`);
    }
    return json.data?.history || [];
  },

  /**
   * Formats the secure download / preview URL for an application document snapshot.
   */
  getDocumentDownloadUrl(applicationId, documentId, inline = false) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : '';
    const qs = new URLSearchParams();
    if (inline) qs.append('inline', 'true');
    if (token) qs.append('token', token);
    const queryString = qs.toString() ? `?${qs.toString()}` : '';
    return `${ADMIN_API}/applications/${applicationId}/documents/${documentId}/download${queryString}`;
  },

  /**
   * Securely previews or downloads an application document using authenticated blob retrieval.
   */
  async downloadOrPreviewDocument(applicationId, documentId, inline = false, fileName = 'document.pdf') {
    const url = this.getDocumentDownloadUrl(applicationId, documentId, inline);
    const res = await authFetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Unable to access document (${res.status})`);
    }
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    if (inline) {
      window.open(objectUrl, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
  },
};

