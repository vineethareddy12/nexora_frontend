import { authFetch } from '../auth/api/authFetch';
import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/api/v1`;

export const notificationsApi = {
  async getNotifications(role = 'APPLICANT', params = {}) {
    const endpoint = role === 'ADMIN' ? `${BASE_URL}/admin/notifications` : `${BASE_URL}/me/notifications`;
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.unreadOnly) query.append('unreadOnly', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${endpoint}${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch notifications');
    return json;
  },

  async getUnreadCount(role = 'APPLICANT') {
    const endpoint = role === 'ADMIN' ? `${BASE_URL}/admin/notifications/unread-count` : `${BASE_URL}/me/notifications/unread-count`;
    const res = await authFetch(endpoint);
    const json = await res.json();
    if (!res.ok) return 0;
    return json.data?.unreadCount || 0;
  },

  async markAsRead(id, role = 'APPLICANT') {
    const endpoint = role === 'ADMIN' ? `${BASE_URL}/admin/notifications/${id}/read` : `${BASE_URL}/me/notifications/${id}/read`;
    const res = await authFetch(endpoint, { method: 'PATCH' });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to mark notification as read');
    return json;
  },

  async markAllAsRead(role = 'APPLICANT') {
    const endpoint = role === 'ADMIN' ? `${BASE_URL}/admin/notifications/read-all` : `${BASE_URL}/me/notifications/read-all`;
    const res = await authFetch(endpoint, { method: 'PATCH' });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to mark all as read');
    return json;
  },

  async getEmailLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.status) query.append('status', params.status);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${BASE_URL}/admin/notifications/email-logs${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch email logs');
    return json;
  },
};

