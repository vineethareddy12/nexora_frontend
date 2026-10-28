/**
 * AuthFetch Utility
 * Intercepts 401 Unauthorized / Expired Token responses and automatically
 * attempts to refresh the access token via /api/v1/auth/refresh using the
 * stored refresh token, seamlessly retrying the original request.
 *
 * For admin operations, if the session is absent or expired, it automatically
 * provisions / re-authenticates the admin session transparently without
 * disturbing the user with modal popups.
 */

export async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const existingAuth = headers.get('Authorization');

  // Ensure clean Bearer token from localStorage
  if (
    !existingAuth ||
    existingAuth === 'Bearer undefined' ||
    existingAuth === 'Bearer null' ||
    existingAuth.trim() === 'Bearer'
  ) {
    const storedToken = localStorage.getItem('nexora_access_token');
    if (storedToken) {
      headers.set('Authorization', `Bearer ${storedToken}`);
    } else {
      headers.delete('Authorization');
    }
  }

  let response = await fetch(url, { ...options, headers });

  // If unauthorized / token expired, attempt silent token refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('nexora_refresh_token');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newAccessToken = refreshData.data?.accessToken;
          const newRefreshToken = refreshData.data?.refreshToken;

          if (newAccessToken) {
            localStorage.setItem('nexora_access_token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('nexora_refresh_token', newRefreshToken);
            }

            // Retry original request with fresh access token
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            response = await fetch(url, { ...options, headers });
            return response;
          }
        }
      } catch (err) {
        // Refresh token failed
      }
    }

    handleSessionExpired();
  }

  return response;
}

function handleSessionExpired() {
  localStorage.removeItem('nexora_access_token');
  localStorage.removeItem('nexora_refresh_token');
}
