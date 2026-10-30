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

    const handleTokenRefreshed = (e) => {
      if (e.detail?.accessToken) {
        setAccessToken(e.detail.accessToken);
      }
      if (e.detail?.refreshToken) {
        setRefreshToken(e.detail.refreshToken);
      }
    };

    window.addEventListener('nexora:token-refreshed', handleTokenRefreshed);
    return () => window.removeEventListener('nexora:token-refreshed', handleTokenRefreshed);
  }, []);

  const login = (userData, tokens) => {
    setUser(userData);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    localStorage.setItem('nexora_access_token', tokens.accessToken);
    localStorage.setItem('nexora_refresh_token', tokens.refreshToken);
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
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
