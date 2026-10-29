import { authFetch } from '../../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.profile;

export const profileApi = {
  async getProfile(accessToken) {
    const headers = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(API_BASE, { headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load profile');
    return json.data;
  },

  async updateProfile(profileData, accessToken) {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(API_BASE, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ ...profileData }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to update profile');
    return json.data;
  },
};
