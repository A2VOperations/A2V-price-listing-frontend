"use client";

import React from "react";
import { FiPrinter, FiTrash2, FiUser, FiBriefcase, FiPhone, FiMail } from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";

export default function QuoteSummary() {
  const {
    clientInfo,
    updateClientInfo,
    subtotalQuoteAmount,
    totalGstAmount,
    totalQuoteAmount,
    clearQuote,
    itemCount
  } = useQuote();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Client Information Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FiUser className="w-4 h-4 text-blue-600" />
            Client & Quotation Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Client / Contact Person
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Rajesh Kumar"
                value={clientInfo.clientName}
                onChange={(e) => updateClientInfo({ clientName: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <FiUser className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Company Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Apex Enterprises"
                value={clientInfo.companyName}
                onChange={(e) => updateClientInfo({ companyName: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <FiBriefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={clientInfo.phone}
                onChange={(e) => updateClientInfo({ phone: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <FiPhone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="e.g. client@company.com"
                value={clientInfo.email}
                onChange={(e) => updateClientInfo({ email: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <FiMail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Salesperson Notes / Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Client requested 50% advance before production."
              value={clientInfo.notes}
              onChange={(e) => updateClientInfo({ notes: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Quote Financial Totals */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
          Overall Quotation Summary
        </h3>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between items-center">
            <span>Configured Line Items</span>
            <span className="font-bold text-slate-800">{itemCount} Items</span>
          </div>

          <div className="flex justify-between items-center">
            <span>Subtotal / Total</span>
            <span className="font-semibold text-slate-800">
              ₹{subtotalQuoteAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 text-white rounded-lg flex justify-between items-baseline">
          <div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Total Quotation Payable
            </div>
            <div className="text-[11px] text-slate-400">Net price including all option fees</div>
          </div>
          <div className="text-2xl font-black text-blue-400">
            ₹{totalQuoteAmount.toLocaleString()}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handlePrint}
            disabled={itemCount === 0}
            className="py-2.5 px-3 rounded-lg font-bold text-xs bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <FiPrinter className="w-4 h-4" />
            <span>Print Quote</span>
          </button>

          <button
            onClick={clearQuote}
            disabled={itemCount === 0}
            className="py-2.5 px-3 rounded-lg font-bold text-xs bg-slate-100 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 transition-colors flex items-center justify-center space-x-1.5 border border-slate-200"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Clear Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
}
