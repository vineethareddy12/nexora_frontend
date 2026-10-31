import { authFetch } from '../auth/api/authFetch';
import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = `${API_BASE_URL}/api/v1`;

export const auditApi = {
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.action && params.action !== 'ALL') query.append('action', params.action);
    if (params.entityType && params.entityType !== 'ALL') query.append('entityType', params.entityType);
    if (params.actorRole && params.actorRole !== 'ALL') query.append('actorRole', params.actorRole);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${BASE_URL}/admin/audit-logs${qs}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'Failed to fetch audit logs');
    return json;
  },
};

