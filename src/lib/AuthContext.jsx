import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { authService } from '@/lib/services/authService';

// RidePicker authentication is phone-based and self-contained. This context no
// longer depends on Base44 at runtime: no base44.auth.me(), no public-settings
// request, no platform token. The mock session (authService) is the single
// source of identity. The `base44` import is retained only because this file
// is platform-managed; it is not called. Replace authService with a Supabase
// auth adapter later without touching this file or the auth screens.

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  // Kept for compatibility with the app shell (which reads these), but mock
  // mode needs no public settings and produces no auth errors.
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
        // ignore — no session means unauthenticated
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

  const applyPhoneSession = (mockUser) => {
    setUser(mockUser);
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