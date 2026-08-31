import React from "react";
import { Link } from "react-router-dom";
import { FiInbox, FiArrowLeft } from "react-icons/fi";

export default function EmptyState({
  title = "No products found",
  message = "Try searching with a different product name, product code, or filter.",
  actionText = "Back to Dashboard",
  actionHref = "/"
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center my-6 max-w-md mx-auto shadow-sm">
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
        <FiInbox className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-5 leading-relaxed">{message}</p>
      {actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
        >
          <FiArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          {actionText}
        </Link>
      )}
    </div>
  );
}
