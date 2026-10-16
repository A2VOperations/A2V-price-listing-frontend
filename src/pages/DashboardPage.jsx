import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiGrid, FiLayers, FiCheckCircle, FiSearch } from "react-icons/fi";
import CategoryGrid from "@/components/category/CategoryGrid";
import ProductGrid from "@/components/product/ProductGrid";
import { useQuote } from "@/context/QuoteContext";
import { useData } from "@/context/DataContext";

export default function DashboardPage() {
  const { categories, products } = useData();
  const { itemCount, totalQuoteAmount } = useQuote();
  const [searchTerm, setSearchTerm] = useState("");

  const featuredProducts = products
    .filter((p) => p.categoryId === "visiting-cards")
    .slice(0, 3);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      {/* Categories Header & Quick Filter Search Bar */}
      <div className="space-y-4" id="categories">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiGrid className="w-5 h-5 text-orange-600" />
              Product Categories
            </h2>
            <p className="text-xs text-slate-500">
              Browse through all printing product lines offered by A2V PRINTS.
            </p>
          </div>

          {/* Search Category Filter */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Filter categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Category Grid Display */}
        <CategoryGrid categories={filteredCategories} />
      </div>
    </div>
  );
}
