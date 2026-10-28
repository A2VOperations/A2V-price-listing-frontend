import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, verifyOtpApi, resendOtpApi, fetchCurrentUserApi } from "@/services/api";

const AuthContext = createContext();

const AUTH_STORAGE_KEY = "a2v_portal_auth_session";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
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
        try {
          const user = await fetchCurrentUserApi(session.token);
          if (isMounted) {
            setSession((prev) => ({ ...prev, user }));
          }
        } catch (err) {
          console.warn("Session check with backend database failed:", err.message);
          // If token was rejected or expired by backend, clear session
          if (isMounted) {
            setSession(null);
            localStorage.removeItem(AUTH_STORAGE_KEY);
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
      const sessionData = {
        token: res.token,
        user: res.user,
        loginTime: new Date().toISOString(),
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
      const sessionData = {
        token: res.token,
        user: res.user,
        loginTime: new Date().toISOString(),
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

  const logout = () => {
    setSession(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
