import { authFetch } from '../../auth/api/authFetch';

const API_BASE = '/api/v1';

export const companyApi = {
  async getPublicProfile() {
    const res = await fetch(`${API_BASE}/company`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch company profile');
    return json.data.company;
  },

  async getAdminProfile(accessToken) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/company`, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch company admin profile');
    return json.data.company;
  },

  async updateProfile(data, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/admin/company`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update company profile');
    return json.data.company;
  },
};
