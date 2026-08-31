import React from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center text-xs text-slate-500 mb-4 overflow-x-auto py-1">
      <Link
        to="/"
        className="flex items-center hover:text-blue-600 transition-colors font-medium"
      >
        <FiHome className="w-3.5 h-3.5 mr-1 text-slate-400" />
        Dashboard
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FiChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300 flex-shrink-0" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-blue-600 transition-colors font-medium truncate max-w-[150px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 font-semibold truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
