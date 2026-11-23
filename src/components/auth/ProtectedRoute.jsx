import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FiShield, FiAlertTriangle, FiArrowLeft } from "react-icons/fi";

export default function ProtectedRoute({ children, requireAdmin = false, requireManagerOrAdmin = false }) {
  const { isAuthenticated, isAdmin, isManagerOrAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-10 h-10 border-3 border-orange-500/30 border-t-orange-600 rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-600">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl border border-red-100 text-center">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiAlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Administrator Access Required
        </h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Your account does not have administrator privileges to view or manage this area.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          <FiArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>
      </div>
    );
  }

  if (requireManagerOrAdmin && !isManagerOrAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl border border-amber-100 text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FiShield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">
          Manager or Admin Access Required
        </h2>
        <p className="text-xs text-slate-600 mb-6 leading-relaxed">
          Your account has the <strong>Sales Executive</strong> role. Master rate configuration and production calculations are restricted to Production Managers and Administrators.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          <FiArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>
      </div>
    );
  }

  return children;
}

