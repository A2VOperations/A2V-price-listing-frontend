import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFileText, FiMenu, FiPrinter } from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import SearchModal from "../common/SearchModal";

export default function Header({ onToggleMobileSidebar }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useQuote();

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className=" mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <FiMenu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-black text-lg tracking-wider group-hover:bg-blue-500 transition-colors">
                <FiPrinter className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  A2V PRINTS
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar Trigger */}
          <div className="flex-1 max-w-lg hidden md:block">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700/70 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800 transition-all text-xs text-left group shadow-inner"
            >
              <span className="flex items-center">
                <FiSearch className="w-4 h-4 text-slate-400 group-hover:text-blue-400 mr-2.5 transition-colors" />
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
              className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Quotes Link */}
            <Link
              to="/quotes"
              className="relative flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600 hover:text-white border border-blue-500/30 transition-all text-xs font-semibold"
            >
              <FiFileText className="w-4 h-4" />
              <span className="hidden sm:inline">Active Quote</span>
              {itemCount > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
