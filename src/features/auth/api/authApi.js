import { API_ENDPOINTS } from '../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.auth;

export const authApi = {
  async register(data) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Registration failed');
    return json.data;
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Login failed');
    return json.data;
  },

  async refresh(refreshToken) {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Refresh failed');
    return json.data;
  },

  async logout(refreshToken) {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
  },

  async getCurrentUser(accessToken) {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch user');
    return json.data.user;
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    return json;
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Reset failed');
    return json;
  },

  async changePassword(currentPassword, newPassword, accessToken) {
    const res = await fetch(`${API_BASE}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Password update failed');
    return json;
  },
};
