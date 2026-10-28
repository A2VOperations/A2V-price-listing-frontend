import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFileText,
  FiMenu,
  FiUser,
  FiShield,
  FiLogOut,
  FiLogIn,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import { useAuth } from "@/context/AuthContext";
import SearchModal from "../common/SearchModal";
import Logo from "../../../public/logo/A2V  Groups Logo.png";

export default function Header({ onToggleMobileSidebar }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useQuote();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center group">
              <img src={Logo} alt="logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
              <div>
                <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5 ml-2">
                  A2V PRINTS
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar Trigger */}
          <div className="flex-1 max-w-lg hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all text-xs text-left group shadow-inner cursor-pointer"
            >
              <span className="flex items-center">
                <FiSearch className="w-4 h-4 text-slate-400 group-hover:text-orange-400 mr-2.5 transition-colors" />
                Search product name, code (e.g. VC-001), or category...
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-900 rounded border border-slate-700">
                Ctrl + K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Quotes Link */}
            <Link
              to="/quotes"
              className="relative flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-orange-600/20 text-orange-300 hover:bg-orange-600 hover:text-white border border-orange-500/30 transition-all text-xs font-semibold"
            >
              <FiFileText className="w-4 h-4" />
              <span className="hidden sm:inline">Active Quote</span>
              {itemCount > 0 && (
                <span className="ml-1 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Session Profile & Logout */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
                <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 px-2.5 py-1.5 rounded-xl border border-slate-700/80">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white ${
                      isAdmin
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600"
                        : "bg-gradient-to-tr from-orange-600 to-amber-600"
                    }`}
                  >
                    {isAdmin ? <FiShield className="w-3.5 h-3.5" /> : <FiUser className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-none text-slate-200">
                      {user?.name || user?.username}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-extrabold text-orange-400 mt-0.5">
                      {user?.role}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all text-xs font-semibold"
              >
                <FiLogIn className="w-4 h-4 text-orange-400" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
