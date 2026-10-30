/**
 * Application API Configuration
 * Reads VITE_API_BASE_URL from frontend environment variables (.env / .env.production).
 *
 * In local development:
 * - If VITE_API_BASE_URL is empty, API_BASE_URL defaults to '' (relative path),
 *   allowing Vite's development proxy to forward /api requests to http://localhost:4000.
 *
 * In production:
 * - Set VITE_API_BASE_URL to your backend API domain (e.g., https://api.nexoratech.com).
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// Clean up trailing slash if present
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const API_ENDPOINTS = {
  v1: `${API_BASE_URL}/api/v1`,
  auth: `${API_BASE_URL}/api/v1/auth`,
  profile: `${API_BASE_URL}/api/v1/me/profile`,
  documents: `${API_BASE_URL}/api/v1/me/documents`,
  applications: `${API_BASE_URL}/api/v1/me/applications`,
  dashboard: `${API_BASE_URL}/api/v1/me/dashboard`,
  jobs: `${API_BASE_URL}/api/v1/jobs`,
};

