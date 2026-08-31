import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiLayers,
  FiFileText,
  FiSliders,
  FiX,
  FiChevronRight
} from "react-icons/fi";

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { label: "Dashboard", href: "/", icon: FiGrid },
    { label: "Visiting Cards", href: "/category/visiting-cards", icon: FiLayers },
    { label: "Quote Builder", href: "/quotes", icon: FiFileText },
    { label: "Admin Panel", href: "/admin", icon: FiSliders }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 w-64 select-none">
      {/* Mobile Drawer Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
        <span className="text-sm font-bold text-white uppercase tracking-wider">Navigation</span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-md"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Navigation */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
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

      <div className="my-2 border-t border-slate-800/80" />

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
