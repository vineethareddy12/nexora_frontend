import { authFetch } from '../../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.v1;

export const enquiryApi = {
  async submitEnquiry(data, retryCount = 1) {
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      const json = isJson ? await res.json() : null;

      if (!res.ok) {
        if (res.status === 502 || res.status === 503 || res.status === 504) {
          throw new Error('The server is currently waking up or updating. Please wait a moment and try again.');
        }
        throw new Error(json?.error?.message || `Unable to submit enquiry (Error ${res.status}).`);
      }

      return json;
    } catch (err) {
      // If server was sleeping or network dropped, auto-retry once after a short delay
      if (retryCount > 0 && (err.name === 'TypeError' || err.message?.includes('fetch') || err.message?.includes('waking up'))) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        return this.submitEnquiry(data, retryCount - 1);
      }

      if (err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'))) {
        throw new Error(
          'The server is waking up from idle mode (free hosting takes ~30-45 seconds to spin up). Please wait a moment and click Send again.'
        );
      }
      throw err;
    }
  },

  async getAdminEnquiries(params = {}, accessToken) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/enquiries${qs}`, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch enquiries');
    return json.data;
  },

  async getAdminEnquiryById(id, accessToken) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/enquiries/${id}`, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch enquiry');
    return json.data.enquiry;
  },

  async updateEnquiryStatus(id, status, adminNotes, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/enquiries/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, adminNotes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update enquiry status');
    return json.data.enquiry;
  },

  async updateEnquiryNotes(id, adminNotes, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/enquiries/${id}/notes`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ adminNotes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update internal notes');
    return json.data.enquiry;
  },

  async deleteEnquiry(id, accessToken) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/enquiries/${id}`, {
      method: 'DELETE',
      headers,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to delete enquiry');
    return json;
  },
};
