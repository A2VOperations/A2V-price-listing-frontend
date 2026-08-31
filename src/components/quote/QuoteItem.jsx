import React from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiEdit3, FiTag } from "react-icons/fi";
import ProductImage from "../common/ProductImage";

export default function QuoteItem({ item, index, onRemove }) {
  const calc = item.calculation;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row gap-4 items-start">
      {/* Product Image */}
      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
        <ProductImage src={item.productImage} alt={item.productName} />
      </div>

      {/* Main Item Information */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                #{item.productCode}
              </span>
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {item.productName}
              </h4>
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">
              Quantity: <strong className="text-slate-800">{item.quantity} {item.unitName}</strong>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-900">
              ₹{calc?.totalAmount?.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">
              (₹{calc?.perUnitFinal?.toFixed(2)} / unit)
            </div>
          </div>
        </div>

        {/* Selected Options Badges */}
        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(item.selectedOptions).map(([optKey, optVal]) => (
              <span
                key={optKey}
                className="inline-flex items-center text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md"
              >
                <FiTag className="w-3 h-3 text-slate-400 mr-1" />
                <span className="capitalize">{optKey.replace(/([A-Z])/g, " $1")}:</span>
                <strong className="ml-1 text-slate-800">{optVal}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center space-x-4 pt-1 text-xs">
          <Link
            to={`/product/${item.productSlug}`}
            className="flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            <FiEdit3 className="w-3.5 h-3.5 mr-1" />
            Edit Specs
          </Link>
          <button
            onClick={() => onRemove(index)}
            className="flex items-center text-rose-600 hover:text-rose-800 font-semibold"
          >
            <FiTrash2 className="w-3.5 h-3.5 mr-1" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
