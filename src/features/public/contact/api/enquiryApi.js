import { authFetch } from '../../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.v1;

export const enquiryApi = {
  async submitEnquiry(data) {
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
        if (res.status === 502 || res.status === 503) {
          throw new Error('Server is currently updating or waking up. Please try sending again in a few seconds.');
        }
        throw new Error(json?.error?.message || `Failed to send message (Status ${res.status})`);
      }

      return json;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your internet connection or try again in a moment.');
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
