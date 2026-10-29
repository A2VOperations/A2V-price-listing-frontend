import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiArrowLeft,
  FiAlertCircle,
  FiMail,
  FiCheckCircle,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const Logo = "/logo/A2V  Groups Logo.png";

export default function LoginPage() {
  const { login, verifyOtp, resendOtp, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (isAdmin ? "/admin" : "/");

  // Step state: "credentials" or "otp"
  const [step, setStep] = useState("credentials");

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [error, setError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Resend cooldown countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both User ID and Password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(username, password);

      if (res && res.requireOtp) {
        setTempToken(res.tempToken);
        setMaskedEmail(res.email);
        setStep("otp");
        setInfoMsg(res.message || `OTP code has been sent to ${res.email} via Supabase.`);
        setResendCooldown(45); // 45 seconds cooldown for resend
      } else {
        // Direct login if OTP was bypassed
        const target = location.state?.from?.pathname || (res?.role === "admin" ? "/admin" : "/");
        navigate(target, { replace: true });
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your User ID and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMsg("");

    const cleanOtp = otp.trim();
    if (!cleanOtp) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await verifyOtp(tempToken, cleanOtp);
      const target = location.state?.from?.pathname || (user?.role === "admin" ? "/admin" : "/");
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid or expired OTP code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setError("");
    setInfoMsg("");

    try {
      setIsSubmitting(true);
      const res = await resendOtp(tempToken);
      setInfoMsg(res?.message || "A fresh OTP code has been sent to your email.");
      setResendCooldown(45);
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-8 text-white text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-orange-600/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-600/25 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-center mb-3">
              <img
                src={Logo}
                alt="A2V Logo"
                className="w-16 h-16 object-contain drop-shadow-md"
              />
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {step === "otp" ? "Two-Factor Verification" : "A2V Portal Sign In"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {step === "otp"
                ? `Enter the verification code sent to Administrator (${maskedEmail || "Admin"})`
                : "Sign in with your authorized ID and password."}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {/* Feedback Alerts */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{error}</span>
              </div>
            )}

            {infoMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <FiCheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="font-medium leading-relaxed">{infoMsg}</span>
              </div>
            )}

            {/* STEP 1: CREDENTIALS (USER ID & PASSWORD) */}
            {step === "credentials" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    User ID / Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiUser className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoFocus
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin or your username"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <FiLock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to OTP Verification</span>
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {step === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="p-4 bg-orange-50/80 border border-orange-200/80 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">OTP Sent to Administrator</p>
                    <p className="text-[11px] text-slate-600">
                      Security verification code was sent to the Administrator email: <strong className="text-slate-900">{maskedEmail}</strong>.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={10}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\s+/g, ""))}
                    placeholder="e.g. 123456"
                    className="w-full text-center tracking-[0.3em] font-mono text-xl py-3 px-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-bold transition-all"
                  />
                </div>

                {/* Submit OTP Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !otp.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying with Supabase...</span>
                    </>
                  ) : (
                    <>
                      <FiShield className="w-4 h-4" />
                      <span>Verify OTP & Sign In</span>
                    </>
                  )}
                </button>

                {/* Resend & Back controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setOtp("");
                      setError("");
                      setInfoMsg("");
                    }}
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" /> Back to ID Login
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSubmitting}
                    onClick={handleResendOtp}
                    className={`inline-flex items-center gap-1 font-bold ${
                      resendCooldown > 0
                        ? "text-slate-400 cursor-not-allowed"
                        : "text-orange-600 hover:text-orange-700 cursor-pointer"
                    }`}
                  >
                    <FiRefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
