import React, { useState } from "react";
import { FiGrid, FiSearch } from "react-icons/fi";
import { TbCalculator } from "react-icons/tb";
import CategoryGrid from "@/components/category/CategoryGrid";
import CategoryCard from "@/components/category/CategoryCard";
import { useData } from "@/context/DataContext";

import flexImg from "@/assets/images/categories (14).webp";
import stickersImg from "@/assets/images/categories (9).webp";
import standieImg from "@/assets/images/luxury-standie.jpg";

export default function DashboardPage() {
  const { categories, loading, error, refreshData } = useData();
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

  // Custom Price Categories (Flex Board, Stickers, Standee) rendered as Category Cards
  const customPriceCategories = [
    {
      id: "flex-board",
      slug: "flex-board",
      destination: "/calculators/flex-board",
      name: "Flex Board",
      image: flexImg,
      badge: "Frame / Sq.Ft",
      description:
        "Custom Flex Board printing & framing calculator with Iron/Wooden structure options, support rods, and fitting.",
    },
    {
      id: "stickers-labels",
      slug: "stickers-labels",
      destination: "/calculators/stickers",
      name: "Stickers & Labels",
      image: stickersImg,
      badge: "12×18 & 13×19",
      description:
        "Custom die-cut paper, waterproof vinyl, and transparent sticker sheet nesting calculator.",
    },
    {
      id: "standie",
      slug: "standie",
      destination: "/calculators/standee",
      name: "Standee Displays",
      image: standieImg,
      badge: "3 Models",
      description:
        "Portable Roll-Up Standees, Heavy-Duty MS Iron Frame Standees, and A-Frame Tent Easel Huts.",
    },
  ];

  // Exact standard category ordering shown in Image 1:
  // Row 1: Files & Folders, Envelopes, ATM Pouches, Pens, Visiting Cards
  // Row 2: Bill Books, Pamphlet / Posters, Tags, Letter Heads, Digital Paper Printing
  const image1Order = [
    "files",
    "envelopes",
    "atm-pouches",
    "pens",
    "visiting-cards",
    "bill-books",
    "pamphlets-posters",
    "tags",
    "letter-heads",
    "digital-paper-printing",
    "card-holders",
  ];

  // Standard Product Catalog (exclude flex-board, standee, and stickers which are in the top price category display)
  const standardCategories = categories
    .filter(
      (c) =>
        c.slug !== "flex-board" &&
        c.id !== "flex-board" &&
        c.slug !== "stickers-labels" &&
        c.id !== "stickers-labels" &&
        c.slug !== "stickers" &&
        c.slug !== "standie" &&
        c.id !== "standie" &&
        c.slug !== "standee" &&
        c.id !== "standee" &&
        !c.name.toLowerCase().includes("stand") &&
        !c.name.toLowerCase().includes("flex") &&
        !c.name.toLowerCase().includes("sticker"),
    )
    .sort((a, b) => {
      const indexA = image1Order.indexOf(a.id || a.slug);
      const indexB = image1Order.indexOf(b.id || b.slug);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

  // Filter categories for search
  const filteredCategories = standardCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description &&
        c.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-10">
      {/* SECTION 1: PRICE CATEGORY CUSTOMIZED DISPLAY (LOOKS LIKE PRODUCT CATEGORIES CATALOG) */}
      <section className="space-y-4" id="custom-calculators">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-orange-600 text-white font-bold shadow-xs">
              <TbCalculator className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Custom Price Calculators &amp; Displays
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Custom size calculators and display hardware for Flex Boards, Sticker Sheets, and Standees.
          </p>
        </div>

        {/* 3 Category Cards in Category Catalog Grid Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {customPriceCategories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* SECTION 2: STANDARD PRODUCT CATEGORIES CATALOG (MATCHING IMAGE 1 DESIGN) */}
      <section className="space-y-4 pt-4 border-t border-slate-200" id="categories">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        {/* Category Grid Display (Matching Image 1: 5 columns on desktop) */}
        <CategoryGrid categories={filteredCategories} />
      </section>
    </div>
  );
}
