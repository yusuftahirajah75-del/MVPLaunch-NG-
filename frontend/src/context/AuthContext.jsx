import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);

  // Restore authenticated session on page reload
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await api.auth.me();
        if (res?.data?.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        // Not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res?.data?.token) {
      api.setToken(res.data.token);
    }
    setUser(res.data.user);
    setAuthModalOpen(false);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    if (res?.data?.token) {
      api.setToken(res.data.token);
    }
    setUser(res.data.user);
    setAuthModalOpen(false);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore
    } finally {
      api.setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      if (res?.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      // ignore
    }
  };

  const openLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        ideaModalOpen,
        setIdeaModalOpen,
        openLogin,
        openRegister
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
