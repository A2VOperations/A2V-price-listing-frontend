import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiShield,
  FiArrowRight,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiKey,
} from "react-icons/fi";

export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to admin dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please provide both Login ID and Password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid Login ID or Password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDefaultCredentials = () => {
    setUsername("admin");
    setPassword("admin@a2v");
    setError("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Top Card Box */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-slate-900 px-6 py-8 text-white text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-600/30 rounded-full blur-2xl pointer-events-none" />

            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white shadow-lg mb-3">
              <FiShield className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-black tracking-tight">Admin Portal Access</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Please enter your authorized credentials to manage products, categories, pricing, and system data.
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 animate-shake">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login ID Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Login ID / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Admin Login ID"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FiLock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Fill Default Credentials Helper Chip */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={fillDefaultCredentials}
                  className="w-full flex items-center justify-between p-2.5 bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 rounded-xl text-[11px] text-orange-800 transition-colors group cursor-pointer"
                  title="Click to auto-fill default admin credentials"
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    <FiKey className="w-3.5 h-3.5 text-orange-600" />
                    <span>Default Login ID: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-orange-900">admin</code></span>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 group-hover:underline">
                    Auto Fill
                  </span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to store */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors"
              >
                <FiArrowLeft className="w-3.5 h-3.5" /> Back to Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
