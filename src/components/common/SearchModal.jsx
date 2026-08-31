import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiX, FiArrowRight, FiTag, FiBox } from "react-icons/fi";
import { searchProducts } from "@/data/products";
import ProductImage from "./ProductImage";

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim()) {
      setResults(searchProducts(query));
    } else {
      setResults([]);
    }
  }, [query]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <FiSearch className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search products by name, code (e.g. VC-001), category, or spec..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-2"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-200/60 rounded font-medium"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 flex-1">
          {query.trim() === "" ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <FiBox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Start typing to search products across all 14 categories...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No products matching &quot;
              <span className="font-semibold text-slate-800">{query}</span>
              &quot;
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Search Results ({results.length})
              </div>
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center p-3 rounded-lg hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all group"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-3 border border-slate-200">
                    <ProductImage src={product.image} alt={product.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {product.code}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center mt-1 space-x-3">
                      <span>
                        Min: {product.minQuantity} {product.unitName || "Units"}
                      </span>
                      <span>•</span>
                      <span>Time: {product.productionTime}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-xs text-slate-400">Starting</div>
                    <div className="text-sm font-bold text-slate-900">
                      ₹{product.basePrice.toLocaleString()}
                    </div>
                  </div>
                  <FiArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 ml-3 transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
