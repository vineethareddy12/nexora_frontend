import { API_ENDPOINTS } from '../../../config/apiConfig';

/**
 * Global Token Refresh Mutex
 * When multiple requests fail with 401 simultaneously (e.g. on dashboard initial load),
 * only ONE refresh request is issued to the server. All other requests await the exact same
 * promise, preventing refresh token rotation race conditions and duplicate logouts.
 */
let activeRefreshPromise = null;

let lastAuthExpiredDispatch = 0;

function handleSessionExpired() {
  const now = Date.now();
  // Debounce session expired event to at most once every 8 seconds
  if (now - lastAuthExpiredDispatch < 8000) {
    return;
  }
  lastAuthExpiredDispatch = now;

  localStorage.removeItem('nexora_access_token');
  localStorage.removeItem('nexora_refresh_token');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nexora:auth-expired'));
  }
}

async function performSilentRefresh(refreshToken) {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const refreshResponse = await fetch(`${API_ENDPOINTS.auth}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Refresh token invalid or revoked');
      }

      const refreshData = await refreshResponse.json();
      const newAccessToken = refreshData.data?.accessToken;
      const newRefreshToken = refreshData.data?.refreshToken;

      if (newAccessToken) {
        localStorage.setItem('nexora_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('nexora_refresh_token', newRefreshToken);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('nexora:token-refreshed', {
              detail: { accessToken: newAccessToken, refreshToken: newRefreshToken },
            })
          );
        }
        return newAccessToken;
      }

      throw new Error('No access token in refresh payload');
    } finally {
      // Clear mutex after a short microtask delay
      setTimeout(() => {
        activeRefreshPromise = null;
      }, 200);
    }
  })();

  return activeRefreshPromise;
}

export async function authFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  let existingAuth = headers.get('Authorization');

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

  // If unauthorized / token expired, attempt synchronized silent token refresh
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('nexora_refresh_token');
    if (refreshToken) {
      try {
        const freshAccessToken = await performSilentRefresh(refreshToken);
        if (freshAccessToken) {
          headers.set('Authorization', `Bearer ${freshAccessToken}`);
          // Retry the original request seamlessly with the newly refreshed token
          return await fetch(url, { ...options, headers });
        }
      } catch (err) {
        // Refresh token actually failed or expired
        handleSessionExpired();
      }
    } else {
      handleSessionExpired();
    }
  }

  return response;
}
