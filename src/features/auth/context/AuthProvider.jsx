import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('nexora_access_token'));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('nexora_refresh_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (accessToken) {
        try {
          const currentUser = await authApi.getCurrentUser(accessToken);
          setUser(currentUser);
        } catch (err) {
          // Access token might be expired, attempt refresh
          if (refreshToken) {
            try {
              const res = await authApi.refresh(refreshToken);
              setAccessToken(res.accessToken);
              setRefreshToken(res.refreshToken);
              localStorage.setItem('nexora_access_token', res.accessToken);
              localStorage.setItem('nexora_refresh_token', res.refreshToken);
              setUser(res.user);
            } catch (refreshErr) {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    }

    initAuth();

    function isTokenExpired(token) {
      if (!token) return true;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Expired if current time is within 60 seconds of exp
        return !payload.exp || Date.now() >= payload.exp * 1000 - 60000;
      } catch {
        return true;
      }
    }

    // Proactive background silent refresh every 10 minutes, ONLY if token is close to expiring
    const refreshInterval = setInterval(async () => {
      const storedAccess = localStorage.getItem('nexora_access_token');
      const storedRefresh = localStorage.getItem('nexora_refresh_token');
      if (storedRefresh && isTokenExpired(storedAccess)) {
        try {
          const res = await authApi.refresh(storedRefresh);
          if (res?.accessToken) {
            setAccessToken(res.accessToken);
            if (res.refreshToken) setRefreshToken(res.refreshToken);
            localStorage.setItem('nexora_access_token', res.accessToken);
            if (res.refreshToken) localStorage.setItem('nexora_refresh_token', res.refreshToken);
          }
        } catch (e) {
          // If refresh token is expired or revoked on server, clear session
          if (e.message?.toLowerCase().includes('revoked') || e.message?.toLowerCase().includes('expired') || e.message?.toLowerCase().includes('401')) {
            logout();
          }
        }
      }
    }, 5 * 60 * 1000);

    // Refresh when user returns to the tab after sleep or switching apps, ONLY if access token is expired
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const storedAccess = localStorage.getItem('nexora_access_token');
        const storedRefresh = localStorage.getItem('nexora_refresh_token');
        if (storedRefresh && isTokenExpired(storedAccess)) {
          try {
            const res = await authApi.refresh(storedRefresh);
            if (res?.accessToken) {
              setAccessToken(res.accessToken);
              if (res.refreshToken) setRefreshToken(res.refreshToken);
              localStorage.setItem('nexora_access_token', res.accessToken);
              if (res.refreshToken) localStorage.setItem('nexora_refresh_token', res.refreshToken);
            }
          } catch (e) {
            if (e.message?.toLowerCase().includes('revoked') || e.message?.toLowerCase().includes('expired') || e.message?.toLowerCase().includes('401')) {
              logout();
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleTokenRefreshed = (e) => {
      if (e.detail?.accessToken) {
        setAccessToken(e.detail.accessToken);
      }
      if (e.detail?.refreshToken) {
        setRefreshToken(e.detail.refreshToken);
      }
    };

    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('nexora:token-refreshed', handleTokenRefreshed);
    window.addEventListener('nexora:auth-expired', handleAuthExpired);
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('nexora:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('nexora:auth-expired', handleAuthExpired);
    };
  }, []);

  const login = (userData, tokens) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    localStorage.setItem('nexora_access_token', tokens.accessToken);
    localStorage.setItem('nexora_refresh_token', tokens.refreshToken);
    if (userData?.id) {
      localStorage.setItem('nexora_user_id', userData.id);
    }
  };

  const logout = async () => {
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (e) {
        // ignore logout errors
      }
    }
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('nexora_access_token');
    localStorage.removeItem('nexora_refresh_token');
    localStorage.removeItem('nexora_user_id');
    import('../../../core/cache/clientCache.js').then(({ clientCache }) => clientCache.clear());
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
