'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('otg_token');
      const storedUser = localStorage.getItem('otg_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify in background
        api.auth
          .getMe()
          .then((res) => {
            if (res.success && res.data.user) {
              setUser(res.data.user);
              localStorage.setItem('otg_user', JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            // Token might be expired
            // logout();
          });
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('otg_token', authToken);
      localStorage.setItem('otg_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.data) {
      const { user: newUser, token: authToken } = res.data;
      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('otg_token', authToken);
      localStorage.setItem('otg_user', JSON.stringify(newUser));
      return newUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('otg_token');
    localStorage.removeItem('otg_user');
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('otg_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
