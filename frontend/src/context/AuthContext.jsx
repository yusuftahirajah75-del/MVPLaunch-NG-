import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [authOrigin, setAuthOrigin] = useState(null); // null | 'start-mvp' | 'navbar'

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

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (authModalOpen || ideaModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [authModalOpen, ideaModalOpen]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res?.data?.token) {
      api.setToken(res.data.token);
    }
    setUser(res.data.user);
    setAuthModalOpen(false);
    const origin = authOrigin;
    if (origin === 'start-mvp') {
      setIdeaModalOpen(true);
    }
    setAuthOrigin(null);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    if (res?.data?.token) {
      api.setToken(res.data.token);
    }
    setUser(res.data.user);
    setAuthModalOpen(false);
    const origin = authOrigin;
    if (origin === 'start-mvp') {
      setIdeaModalOpen(true);
    }
    setAuthOrigin(null);
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

  const openLogin = (origin = null) => {
    const originStr = typeof origin === 'string' ? origin : null;
    setAuthModalMode('login');
    setAuthOrigin(originStr);
    if (originStr === 'start-mvp') {
      setIdeaModalOpen(false);
    }
    setAuthModalOpen(true);
  };

  const openRegister = (origin = null) => {
    const originStr = typeof origin === 'string' ? origin : null;
    setAuthModalMode('register');
    setAuthOrigin(originStr);
    if (originStr === 'start-mvp') {
      setIdeaModalOpen(false);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    if (authOrigin === 'start-mvp') {
      setIdeaModalOpen(true);
    }
    setAuthOrigin(null);
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
        selectedPackage,
        setSelectedPackage,
        authOrigin,
        setAuthOrigin,
        openLogin,
        openRegister,
        closeAuthModal
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
