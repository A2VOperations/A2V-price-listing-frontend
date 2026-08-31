import React from "react";
import { Link } from "react-router-dom";
import { useQuote } from "@/context/QuoteContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import QuoteItem from "@/components/quote/QuoteItem";
import QuoteSummary from "@/components/quote/QuoteSummary";
import EmptyState from "@/components/common/EmptyState";
import { FiFileText, FiPlus } from "react-icons/fi";

export default function QuotesPage() {
  const { quoteItems, removeFromQuote, itemCount, clientInfo } = useQuote();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Client Quotation Manager" }]} />

      {/* Printable Invoice Header (Visible when printing) */}
      <div className="hidden print:block mb-8 border-b border-slate-300 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900">A2V PRINTS</h1>
            <p className="text-xs text-slate-600">Official Product Quotation & Sales Reference</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            <div><strong>Quote Ref:</strong> Q-A2V-{Math.floor(1000 + Math.random() * 9000)}</div>
          </div>
        </div>

        {clientInfo && (clientInfo.clientName || clientInfo.companyName) && (
          <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 text-xs">
            <div><strong>Client:</strong> {clientInfo.clientName || "N/A"}</div>
            <div><strong>Company:</strong> {clientInfo.companyName || "N/A"}</div>
            <div><strong>Contact:</strong> {clientInfo.phone || "N/A"} | {clientInfo.email || "N/A"}</div>
          </div>
        )}
      </div>

      {/* Standard Web Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiFileText className="w-5 h-5 text-blue-600" />
            Client Quotation Cart ({itemCount} {itemCount === 1 ? "Item" : "Items"})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compile configured printing products, review itemized option breakdown, and generate client estimate.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-1.5" />
          Add More Products
        </Link>
      </div>

      {/* Main Quote Content Grid */}
      {itemCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Configured Quote Items List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider no-print">
              Configured Line Items
            </h3>
            {quoteItems.map((item, idx) => (
              <QuoteItem
                key={item.id || idx}
                item={item}
                index={idx}
                onRemove={removeFromQuote}
              />
            ))}
          </div>

          {/* Client Info & Financial Totals Sidebar (5 Cols) */}
          <div className="lg:col-span-5">
            <QuoteSummary />
          </div>
        </div>
      ) : (
        <EmptyState
          title="Your Quote Cart is Empty"
          message="You haven't added any configured products to the active client quote yet. Browse categories or search products to begin."
          actionText="Browse Categories"
          actionHref="/"
        />
      )}
    </div>
  );
}
