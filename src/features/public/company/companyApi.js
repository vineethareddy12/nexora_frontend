import { authFetch } from '../../auth/api/authFetch';
import { API_ENDPOINTS } from '../../../config/apiConfig';

const API_BASE = API_ENDPOINTS.v1;

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

  /**
   * Step 1: Request signed upload URL and authorization token
   */
  async getLogoUploadUrl({ filename, contentType, size }, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/company/logo/upload-url`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ filename, contentType, size }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to request logo upload authorization');
    return json.data;
  },

  /**
   * Step 3: Confirm direct upload and update company profile
   */
  async confirmLogoUpload(uploadId, accessToken) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await authFetch(`${API_BASE}/company/logo/confirm-upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ uploadId }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to confirm logo upload');
    return json.data;
  },

  /**
   * Coordinated Direct Frontend-to-Storage Upload:
   * 1. Request upload URL
   * 2. Direct upload image bytes to target URL (Supabase or restricted local endpoint)
   * 3. Confirm upload and retrieve persistent display URL
   */
  async uploadLogoDirectly(file, accessToken) {
    // 1. Request URL
    const uploadMeta = await this.getLogoUploadUrl(
      {
        filename: file.name,
        contentType: file.type,
        size: file.size,
      },
      accessToken
    );

    // 2. Direct upload of image bytes
    let targetUrl = uploadMeta.uploadUrl;
    // If local relative path and an API base URL is configured, resolve target
    if (targetUrl.startsWith('/') && API_BASE.startsWith('http')) {
      const origin = new URL(API_BASE).origin;
      targetUrl = `${origin}${targetUrl}`;
    }

    const uploadRes = await fetch(targetUrl, {
      method: uploadMeta.method || 'PUT',
      headers: {
        ...uploadMeta.headers,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error(`Direct image upload failed with status ${uploadRes.status}`);
    }

    // 3. Confirm upload
    const confirmed = await this.confirmLogoUpload(uploadMeta.uploadId, accessToken);
    return confirmed;
  },
};
