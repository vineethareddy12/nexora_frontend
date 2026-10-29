import { authFetch } from '../../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.v1;

export const servicesApi = {
  async getPublishedServices(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/services${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch services');
    return json.data;
  },

  async getServiceBySlug(slug) {
    const res = await fetch(`${API_BASE}/services/${slug}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch service details');
    return json.data.service;
  },

  async getAdminServices(params = {}, accessToken) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'ALL') query.append('category', params.category);
    if (params.isPublished !== undefined && params.isPublished !== 'ALL') {
      query.append('isPublished', params.isPublished);
    }
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/services${qs}`, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch admin services');
    return json.data;
  },

  async createService(data, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/services`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to create service');
    return json.data.service;
  },

  async updateService(id, data, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/services/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update service');
    return json.data.service;
  },

  async updateServiceStatus(id, isPublished, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/services/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ isPublished }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update publication status');
    return json.data.service;
  },

  async reorderServices(orders, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/services/reorder`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ orders }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to reorder services');
    return json;
  },

  async deleteService(id, accessToken) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/services/${id}`, {
      method: 'DELETE',
      headers,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to delete service');
    return json;
  },
};
