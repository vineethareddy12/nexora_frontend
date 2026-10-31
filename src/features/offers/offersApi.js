import { authFetch } from '../auth/api/authFetch';
import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/api/v1`;

export const offersApi = {
  // Admin Endpoints
  async getAdminMetrics() {
    const res = await authFetch(`${BASE_URL}/admin/offers/metrics`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch offer metrics');
    return json.data;
  },

  async getAdminOffers(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${BASE_URL}/admin/offers${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch offers');
    return json;
  },

  async createOffer(payload) {
    const res = await authFetch(`${BASE_URL}/admin/offers`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to create offer');
    return json.data;
  },

  async getOfferDetails(id) {
    const res = await authFetch(`${BASE_URL}/admin/offers/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch offer details');
    return json.data;
  },

  async updateOffer(id, payload) {
    const res = await authFetch(`${BASE_URL}/admin/offers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to update offer');
    return json.data;
  },

  async issueOffer(id) {
    const res = await authFetch(`${BASE_URL}/admin/offers/${id}/issue`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to issue offer');
    return json.data;
  },

  async withdrawOffer(id, reason) {
    const res = await authFetch(`${BASE_URL}/admin/offers/${id}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to withdraw offer');
    return json.data;
  },

  async getOfferHtml(id, role = 'admin') {
    const res = await authFetch(`${BASE_URL}/${role === 'admin' ? 'admin' : 'me'}/offers/${id}/preview`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || 'Failed to load offer preview');
    }
    return await res.text();
  },

  getOfferPreviewUrl(id, role = 'admin') {
    const token = typeof window !== 'undefined' ? localStorage.getItem('nexora_access_token') : null;
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${BASE_URL}/${role === 'admin' ? 'admin' : 'me'}/offers/${id}/preview${tokenParam}`;
  },

  // Applicant Endpoints
  async getApplicantOffers(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${BASE_URL}/me/offers${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch offers');
    return json;
  },

  async getApplicantOfferDetails(id) {
    const res = await authFetch(`${BASE_URL}/me/offers/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch offer');
    return json.data;
  },

  async respondToOffer(id, decision, notes = '') {
    const res = await authFetch(`${BASE_URL}/me/offers/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to respond to offer');
    return json.data;
  },
};

