import React, { createContext, useContext, useState, useEffect } from "react";
import { adminLoginApi } from "@/services/api";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "a2v_admin_auth_session";

// Default credentials if offline or static mode
const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASS = "admin@a2v";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    const cleanUser = (username || "").trim();
    const cleanPass = (password || "").trim();

    if (!cleanUser || !cleanPass) {
      setLoading(false);
      throw new Error("Please enter both Login ID and Password.");
    }

    try {
      // Try backend authentication
      const res = await adminLoginApi(cleanUser, cleanPass);
      if (res && res.success) {
        const sessionData = {
          token: res.token,
          username: res.user?.username || cleanUser,
          role: res.user?.role || "admin",
          loginTime: new Date().toISOString(),
        };
        setAuth(sessionData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        setLoading(false);
        return sessionData;
      }
    } catch (err) {
      // If backend error was invalid credentials from live server, throw error
      if (err.message && err.message.toLowerCase().includes("invalid")) {
        setLoading(false);
        throw err;
      }

      // Offline / fallback check if backend is unreachable
      if (cleanUser === DEFAULT_ADMIN_USER && cleanPass === DEFAULT_ADMIN_PASS) {
        const sessionData = {
          token: `local_token_${Date.now()}`,
          username: cleanUser,
          role: "admin",
          loginTime: new Date().toISOString(),
          isOfflineSession: true,
        };
        setAuth(sessionData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        setLoading(false);
        return sessionData;
      }

      setLoading(false);
      throw new Error(err.message || "Authentication failed. Please verify credentials.");
    }
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isAuthenticated = Boolean(auth && auth.token);

  return (
    <AuthContext.Provider
      value={{
        auth,
        isAuthenticated,
        loading,
        login,
        logout,
        adminUsername: auth?.username || "Admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
