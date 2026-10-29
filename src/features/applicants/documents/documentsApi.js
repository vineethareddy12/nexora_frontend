import { authFetch } from '../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../config/apiConfig';

export const documentsApi = {
  /**
   * Fetches the authenticated applicant's active documents list.
   */
  async getDocuments(params = {}) {
    const query = new URLSearchParams();
    if (params.type && params.type !== 'ALL') query.append('type', params.type);
    if (params.includeArchived) query.append('includeArchived', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${API_ENDPOINTS.documents}${qs}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch documents (Error ${res.status})`);
    }

    return json.data?.documents || [];
  },

  /**
   * Fetches metadata for a single document.
   */
  async getDocument(id) {
    const res = await authFetch(`${API_ENDPOINTS.documents}/${id}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to fetch document metadata (Error ${res.status})`);
    }

    return json.data?.document;
  },

  /**
   * Uploads a document via multipart/form-data.
   */
  async uploadDocument({ file, type, description }) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (description) {
      formData.append('description', description);
    }

    const res = await authFetch(API_ENDPOINTS.documents, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to upload document (Error ${res.status})`);
    }

    return json.data?.document;
  },

  /**
   * Replaces an existing document with a new file.
   */
  async replaceDocument(id, { file, type }) {
    const formData = new FormData();
    formData.append('file', file);
    if (type) {
      formData.append('type', type);
    }

    const res = await authFetch(`${API_ENDPOINTS.documents}/${id}/replace`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to replace document (Error ${res.status})`);
    }

    return json.data?.document;
  },

  /**
   * Deletes (or archives if referenced by applications) a document.
   */
  async deleteDocument(id) {
    const res = await authFetch(`${API_ENDPOINTS.documents}/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to delete document (Error ${res.status})`);
    }

    return json.data;
  },

  /**
   * Downloads an authorized document file and triggers browser download.
   */
  async downloadDocument(id, originalFilename = 'document.pdf') {
    const res = await authFetch(`${API_ENDPOINTS.documents}/${id}/download`);

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      throw new Error(json?.error?.message || `Failed to download file (Error ${res.status})`);
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = originalFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  },
};

