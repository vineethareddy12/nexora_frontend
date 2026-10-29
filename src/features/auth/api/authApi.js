import { API_ENDPOINTS } from '../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.auth;

async function parseResponse(res, fallbackMessage) {
  const contentType = res.headers.get('content-type');
  let json = null;
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('API endpoint not found. Please ensure backend is running and connected.');
    }
    if (res.status === 502 || res.status === 503) {
      throw new Error('Backend server is currently waking up or unavailable. Please wait a few seconds and try again.');
    }
    throw new Error(json?.error?.message || fallbackMessage || `Server responded with status ${res.status}`);
  }

  return json?.data !== undefined ? json.data : json;
}

export const authApi = {
  async register(data) {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return parseResponse(res, 'Registration failed');
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return parseResponse(res, 'Invalid email or password');
  },

  async refresh(refreshToken) {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    return parseResponse(res, 'Session refresh failed');
  },

  async logout(refreshToken) {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Ignore logout errors
    }
  },

  async getCurrentUser(accessToken) {
    const res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await parseResponse(res, 'Failed to fetch user session');
    return data?.user || data;
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return parseResponse(res, 'Password reset request failed');
  },

  async resetPassword(token, newPassword) {
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    return parseResponse(res, 'Password reset failed');
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
    return parseResponse(res, 'Password update failed');
  },
};
