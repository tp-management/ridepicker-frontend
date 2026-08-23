import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { authService } from '@/lib/services/authService';

// RidePicker authentication is phone-based and self-contained. In API mode,
// authService restores a verified Supabase phone-OTP session and asks the
// RidePicker backend for the profile owned by that authenticated subject. The
// Base44 import is retained only because this file is platform-managed; it is
// not called.

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  // Kept for compatibility with the app shell, which still reads these props.
  const [isLoadingPublicSettings] = useState(false);
  const [authError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await authService.getSession();
        if (active && session) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (e) {
        // No valid/restorable session means unauthenticated.
      }
      if (active) {
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const applyPhoneSession = (authenticatedUser) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    setAuthChecked(true);
  };

  const logout = (shouldRedirect = true) => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    const r = window.location.pathname + window.location.search;
    window.location.href = '/login?returnTo=' + encodeURIComponent(r);
  };

  // No-ops retained so the app shell's existing props stay valid.
  const checkUserAuth = async () => {};
  const checkAppState = async () => {};

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      authChecked,
      logout,
      applyPhoneSession,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
