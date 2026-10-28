import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiFileText,
  FiSliders,
  FiX,
  FiChevronRight,
  FiMaximize2,
  FiTv,
  FiTag,
  FiUser,
  FiShield,
  FiLogOut,
  FiLogIn,
} from "react-icons/fi";
import { TbCalculator } from "react-icons/tb";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate("/login");
    }
  };

  const mainNavItems = [
    { label: "Dashboard", href: "/", icon: FiGrid },
    { label: "Visiting Cards", href: "/category/visiting-cards", icon: FiLayers },
    { label: "Quote Builder", href: "/quotes", icon: FiFileText },
    // Only show Admin Panel if user has admin privileges
    ...(isAdmin ? [{ label: "Admin Panel", href: "/admin", icon: FiSliders }] : []),
  ];

  const calculatorNavItems = [
    {
      label: "All Calculators",
      href: "/calculators",
      icon: TbCalculator,
      badge: "Hub",
      isActive: pathname === "/calculators",
    },
    {
      label: "Flex Board Calculator",
      href: "/calculators/flex-board",
      icon: FiMaximize2,
      badge: "Frame / Sq.Ft",
      isActive:
        pathname === "/calculators/flex-board" ||
        pathname === "/calculator/flex-board" ||
        pathname === "/product/flex-board-printing",
    },
    {
      label: "Standee Calculator",
      href: "/calculators/standee",
      icon: FiTv,
      badge: "3 Models",
      isActive:
        pathname === "/calculators/standee" ||
        pathname === "/calculator/standee" ||
        pathname.includes("rollup") ||
        pathname.includes("standie") ||
        pathname.includes("standee"),
    },
    {
      label: "Sticker Sheet Calculator",
      href: "/calculators/stickers",
      icon: FiTag,
      badge: "12×18 & 13×19",
      isActive:
        pathname === "/calculators/stickers" ||
        pathname === "/calculator/stickers" ||
        pathname.includes("sticker"),
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 w-64 select-none overflow-y-auto">
      {/* Mobile Drawer Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <span className="text-sm font-bold text-white uppercase tracking-wider">Navigation</span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Navigation: Main Menu */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Menu
        </div>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-orange-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </div>
              <FiChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-white opacity-80" : "text-slate-600"}`} />
            </Link>
          );
        })}
      </div>

      <div className="my-1 border-t border-slate-800/80" />

      {/* Dedicated Section: Price Calculators */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <TbCalculator className="w-3.5 h-3.5 text-orange-400" />
            Price Calculators
          </span>
          <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono font-bold">
            3 Tools
          </span>
        </div>

        {calculatorNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-orange-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white group"
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? "text-white" : "text-orange-400 group-hover:text-orange-300"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300"
                }`}
              >
                {item.badge}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer with User Profile */}
      <div className="mt-auto p-3 border-t border-slate-800/80 bg-slate-950/40">
        {isAuthenticated ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${
                  isAdmin
                    ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                    : "bg-gradient-to-tr from-orange-600 to-amber-600 text-white"
                }`}
              >
                {isAdmin ? <FiShield className="w-4 h-4" /> : <FiUser className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || user?.username}
                </p>
                <p className="text-[10px] uppercase font-bold text-orange-400">
                  {user?.role === "admin" ? "Admin" : "User"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <FiLogIn className="w-4 h-4" />
            Sign In to Portal
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative z-50 flex-1 max-w-xs w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
