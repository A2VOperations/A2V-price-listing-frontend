import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, verifyOtpApi, resendOtpApi, fetchCurrentUserApi } from "@/services/api";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "a2v_portal_auth_session";

export const SESSION_DURATION_HOURS = 8;
export const SESSION_DURATION_MS = SESSION_DURATION_HOURS * 60 * 60 * 1000; // 8 hours (28,800,000 ms)

const getSessionExpiry = (sess) => {
  if (!sess) return 0;
  if (sess.expiresAt) return Number(sess.expiresAt);
  if (sess.loginTime) return new Date(sess.loginTime).getTime() + SESSION_DURATION_MS;
  return 0;
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const expiry = getSessionExpiry(parsed);
      // Auto-clear if already past 8 hours
      if (expiry && Date.now() >= expiry) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Validate session with backend MongoDB on app launch
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (session?.token) {
        // First check client-side 8-hour expiry
        const expiry = getSessionExpiry(session);
        if (expiry && Date.now() >= expiry) {
          logout("Your 8-hour session has expired. Please sign in again.");
          if (isMounted) setLoading(false);
          return;
        }

        try {
          const user = await fetchCurrentUserApi(session.token);
          if (isMounted) {
            setSession((prev) => ({ ...prev, user }));
          }
        } catch (err) {
          console.warn("Session check with backend database failed:", err.message);
          // If token was rejected or expired by backend, clear session
          if (isMounted) {
            logout("Your 8-hour session has expired. Please sign in again.");
          }
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Automatic timer & active watchdog for 8-hour session auto-logout
  useEffect(() => {
    if (!session?.token) return;

    const expiryTime = getSessionExpiry(session);
    const now = Date.now();
    const timeLeft = expiryTime - now;

    if (timeLeft <= 0) {
      logout("Your 8-hour session has expired. Please sign in again.");
      return;
    }

    // Timer that triggers exactly when 8 hours have elapsed
    const timer = setTimeout(() => {
      logout("Your 8-hour session has expired. Please sign in again.");
    }, timeLeft);

    // Watchdog checking every 15 seconds (detects computer sleep/wake or background tab resumption)
    const watchdog = setInterval(() => {
      if (Date.now() >= expiryTime) {
        logout("Your 8-hour session has expired. Please sign in again.");
      }
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(watchdog);
    };
  }, [session]);

  /**
   * Step 1: Submit credentials (ID + Password)
   * If OTP is required, returns { requireOtp: true, tempToken, email }
   */
  const login = async (username, password) => {
    const cleanUser = String(username || "").trim();
    const cleanPass = String(password || "").trim();

    if (!cleanUser || !cleanPass) {
      throw new Error("Please enter both User ID and Password.");
    }

    const res = await loginApi(cleanUser, cleanPass);

    if (res && res.requireOtp) {
      return {
        requireOtp: true,
        tempToken: res.tempToken,
        email: res.email,
        message: res.message,
      };
    }

    // Direct login fallback if OTP was disabled on server
    if (res && res.success && res.token) {
      const now = Date.now();
      const expiresAt = res.expiresAt || (now + SESSION_DURATION_MS);
      const sessionData = {
        token: res.token,
        user: res.user,
        loginTime: new Date(now).toISOString(),
        expiresAt,
      };
      setSession(sessionData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      return res.user;
    }

    throw new Error(res?.message || "Invalid credentials.");
  };

  /**
   * Step 2: Verify the OTP code sent via Supabase to user's email
   */
  const verifyOtp = async (tempToken, otp) => {
    const cleanOtp = String(otp || "").trim();
    if (!cleanOtp) {
      throw new Error("Please enter the verification code.");
    }

    const res = await verifyOtpApi(tempToken, cleanOtp);

    if (res && res.success && res.token) {
      const now = Date.now();
      const expiresAt = res.expiresAt || (now + SESSION_DURATION_MS);
      const sessionData = {
        token: res.token,
        user: res.user,
        loginTime: new Date(now).toISOString(),
        expiresAt,
      };
      setSession(sessionData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
      return res.user;
    }

    throw new Error(res?.message || "Failed to verify OTP.");
  };

  /**
   * Resend OTP code to the email
   */
  const resendOtp = async (tempToken) => {
    return await resendOtpApi(tempToken);
  };

  const logout = (reason = null) => {
    setSession(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (reason && typeof reason === "string") {
      sessionStorage.setItem("a2v_logout_reason", reason);
    }
  };

  const user = session?.user || null;
  const token = session?.token || null;
  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isUser,
        login,
        verifyOtp,
        resendOtp,
        logout,
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
