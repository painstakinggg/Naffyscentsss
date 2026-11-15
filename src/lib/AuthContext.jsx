import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState(null);

  const checkUserAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include", headers: { accept: "application/json" } });
      if (!response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
      const data = await response.json();
      setUser(data.user || null);
      setIsAuthenticated(Boolean(data.user));
      return data.user || null;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const checkAppState = useCallback(async () => {
    setIsLoadingPublicSettings(false);
    setAuthError(null);
    await checkUserAuth();
  }, [checkUserAuth]);

  useEffect(() => { checkAppState(); }, [checkAppState]);

  const logout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.assign("/");
    }
  };

  const navigateToLogin = () => {
    if (window.location.pathname !== "/login") window.location.assign("/login");
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings,
      authError, appPublicSettings, authChecked, logout, navigateToLogin,
      checkUserAuth, checkAppState, setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
