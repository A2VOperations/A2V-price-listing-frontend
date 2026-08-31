import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiFolder,
  FiBox,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiLogOut,
  FiUser,
} from "react-icons/fi";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { isBackendConnected, refreshData, loading } = useData();
  const { adminUsername, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out from the Admin Portal?")) {
      logout();
      navigate("/admin/login");
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: FiGrid },
    { label: "Categories", href: "/admin/categories", icon: FiFolder },
    { label: "Products & Subcategories", href: "/admin/products", icon: FiBox },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-600 rounded-lg text-white font-bold">
            <FiGrid className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight">Admin & Backend Manager</h1>
              {isBackendConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <FiCheckCircle className="w-3 h-3" /> Live Backend API
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <FiAlertCircle className="w-3 h-3" /> Offline / Static Storage
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                <FiUser className="w-3 h-3 text-blue-400" /> Logged in: <strong className="text-white">{adminUsername}</strong>
              </span>
              <p className="text-xs text-slate-400 hidden sm:inline">
                • Manage categories, products, variants, prices, and images.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => refreshData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Store View
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition-colors shadow-xs"
            title="Sign out from Admin Panel"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  );
}
