import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiSearch,
  FiArrowRight,
  FiMaximize2,
  FiTv,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";
import { TbCalculator } from "react-icons/tb";
import CategoryGrid from "@/components/category/CategoryGrid";
import { useQuote } from "@/context/QuoteContext";
import { useData } from "@/context/DataContext";

export default function DashboardPage() {
  const { categories, products, loading, error, refreshData } = useData();
  const { itemCount, totalQuoteAmount } = useQuote();
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">
          Loading catalog from MongoDB database...
        </p>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center space-y-3 max-w-lg mx-auto my-12">
        <h3 className="text-base font-bold">MongoDB Connection Error</h3>
        <p className="text-xs text-red-600">{error}</p>
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Filter categories for search
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description &&
        c.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const calculatorCards = [
    {
      id: "flex-board",
      title: "Flex Board Calculator",
      subtitle: "Custom Size Printing & Iron/Wooden Framing",
      description:
        "Calculate square feet rates, Star & Normal flex materials, welded iron / wooden batten framing, support rods, and on-site fitting.",
      link: "/calculators/flex-board",
      icon: FiMaximize2,
      badge: "Frame / Sq.Ft",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      accentBg: "bg-orange-50 border-orange-200 hover:border-orange-500",
      iconBg: "bg-orange-600 text-white",
      features: [
        "Normal, Star & Blackout Flex",
        "Iron & Wooden Frame Options",
        "Support Rods & On-site Fitting",
      ],
    },
    {
      id: "standee",
      title: "Standee Calculator",
      subtitle: "Roll-Up Aluminium, Welded Iron & A-Frame Huts",
      description:
        "Instant pricing for portable roll-up standees (2.5 & 3 ft width with carry bag), heavy-duty welded MS iron standees, and triangular tent huts.",
      link: "/calculators/standee",
      icon: FiTv,
      badge: "3 Display Models",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      accentBg: "bg-blue-50/70 border-blue-200 hover:border-blue-500",
      iconBg: "bg-blue-600 text-white",
      features: [
        "Aluminium Roll-Up (Standard & Luxury)",
        "Heavy-Duty MS Iron Frame Standee",
        "A-Frame Hut Tent (Iron 3kg/5kg/Wood)",
      ],
    },
    {
      id: "stickers",
      title: "Sticker Sheet Calculator",
      subtitle: "Digital 12×18 & 13×19 Sheet Nesting",
      description:
        "Automatic sheet nesting calculation for custom sticker dimensions, Chromo paper, waterproof Vinyl (Gloss/Matte), and die-cutting.",
      link: "/calculators/stickers",
      icon: FiTag,
      badge: "12×18 & 13×19 Sheets",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      accentBg: "bg-emerald-50/70 border-emerald-200 hover:border-emerald-500",
      iconBg: "bg-emerald-600 text-white",
      features: [
        "12×18 & 13×19 Sheet Sizes",
        "Waterproof Vinyl & Chromo Paper",
        "Half Cut & Full Die-Cut Options",
      ],
    },
  ];

  return (
    <div className="space-y-10">
      {/* SECTION 2: STANDARD PRODUCT CATALOG CATEGORIES */}
      <section className="space-y-4" id="categories">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold">
                <FiGrid className="w-5 h-5 text-slate-700" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Product Categories Catalog
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Browse standard quantity-based printing products (Visiting Cards, Envelopes, Pamphlets, Bill Books &amp; more).
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
      </section>
    </div>
  );
}