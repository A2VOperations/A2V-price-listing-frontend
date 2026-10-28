import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import EmptyState from "@/components/common/EmptyState";
import StickerCalculator from "@/components/product/StickerCalculator";
import { FiSearch, FiLayers, FiGrid, FiList } from "react-icons/fi";

export default function CategoryPage() {
  const { slug } = useParams();
  const { getCategoryBySlug, getProductsByCategory, loading } = useData();
  const category =
    getCategoryBySlug(slug) ||
    (slug === "standie" || slug === "standee"
      ? getCategoryBySlug("flex-board")
      : null);
  const allProducts = category ? getProductsByCategory(category.id) : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    slug === "standie" || slug === "standee" ? "STANDIE" : "all",
  );
  const isStickerCategory =
    category?.id === "stickers-labels" ||
    category?.slug === "stickers-labels" ||
    category?.id === "stickers" ||
    category?.slug === "stickers";

  const [activeTab, setActiveTab] = useState("calculator"); // 'calculator' | 'products'

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">
          Loading category from MongoDB...
        </p>
      </div>
    );
  }

  if (!category) {
    return (
      <EmptyState
        title="Category Not Found"
        message={`No category exists with slug "${slug}".`}
        actionText="Return to Dashboard"
        actionHref="/"
      />
    );
  }

  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.subCategory &&
        product.subCategory
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group products by subCategory if any exist
  const groupedProducts = {};
  filteredProducts.forEach((product) => {
    const subCat = product.subCategory || "General Products";
    if (!groupedProducts[subCat]) {
      groupedProducts[subCat] = [];
    }
    groupedProducts[subCat].push(product);
  });

  const subCategoryKeys = Object.keys(groupedProducts);
  const hasSubCategories = subCategoryKeys.some(
    (key) => key !== "General Products",
  );

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: category.name }]} />

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-lg bg-orange-50 text-orange-600 font-bold">
              <FiLayers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              {category.name}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {category.description ||
              "Browse all available sticker and label specifications, sheet layouts, GSM grades, and custom finishing options."}
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder={`Search in ${category.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none"
          />
          <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* If Sticker Category: Render Tabs for Interactive Calculator & Catalog */}
      {isStickerCategory && (
        <div className="flex border-b border-slate-200 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "calculator"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FiGrid className="w-4 h-4" />
            Sticker Sheet Calculator (12×18 &amp; 13×19)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "products"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FiList className="w-4 h-4" />
            Standard Products Catalog ({filteredProducts.length})
          </button>
        </div>
      )}

      {isStickerCategory && activeTab === "calculator" ? (
        <StickerCalculator product={allProducts[0]} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No Products Found in Category"
          message={`No product matches "${searchQuery}" under ${category.name}.`}
          actionText="Clear Filter"
          actionHref={`/category/${slug}`}
        />
      ) : hasSubCategories ? (
        // Grouped Layout (Sample Board Style with Color-Coded Sub-Headings)
        <div className="space-y-8">
          {/* Subcategory Pills Navigation Filter */}
          {subCategoryKeys.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedSubCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedSubCategory === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Displays &amp; Products ({filteredProducts.length})
              </button>
              {subCategoryKeys.map((subName) => (
                <button
                  key={subName}
                  type="button"
                  onClick={() => setSelectedSubCategory(subName)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedSubCategory === subName
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{subName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedSubCategory === subName
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {groupedProducts[subName].length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {(() => {
            const preferredOrder = [
              "FLEX BOARD PRINTING",
              "STANDIE",
              "STANDIE (ROLL-UP STANDEES)",
              "500 GSM CARDS (QTY. 500 CARDS)",
              "400 GSM CARDS (QTY. 1000 CARDS)",
              "350 GSM CARDS (QTY. 1000 CARDS)",
              "REGULAR VISITING CARDS (QTY. 1000 CARDS)",
              "NT / PVC VISITING CARDS (QTY. 100, 500 & 1000 CARDS)",
              "METAL VISITING CARDS (QTY. 10 CARDS)",
            ];

            const entries = Object.entries(groupedProducts).filter(
              ([subName]) =>
                selectedSubCategory === "all" ||
                subName === selectedSubCategory,
            );

            entries.sort((a, b) => {
              const indexA = preferredOrder.indexOf(a[0]);
              const indexB = preferredOrder.indexOf(b[0]);
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a[0].localeCompare(b[0]);
            });

            return entries.map(([subCategoryName, prods]) => {
              let titleColor = "text-orange-800";
              let borderColor = "border-orange-600";
              let subtitle = "";
              let badgeColor = "bg-orange-100 text-orange-800";
              let gridCols =
                "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5";

              if (subCategoryName.toUpperCase().includes("STANDIE")) {
                titleColor = "text-[#1D4ED8]";
                borderColor = "border-[#2563EB]";
                subtitle =
                  "Portable aluminium roll-up standees with carry bags for exhibitions, retail counters, events & promotions.";
                badgeColor = "bg-blue-100 text-blue-800";
              } else if (subCategoryName.toUpperCase().includes("FLEX BOARD")) {
                titleColor = "text-[#C2410C]";
                borderColor = "border-[#EA580C]";
                subtitle =
                  "Custom outdoor flex board printing with iron/wooden structure framing, support rods & on-site fitting.";
                badgeColor = "bg-orange-100 text-orange-800";
              } else if (subCategoryName.includes("500 GSM")) {
                titleColor = "text-[#D97706]";
                borderColor = "border-[#D97706]";
              } else if (subCategoryName.includes("400 GSM")) {
                titleColor = "text-[#1E40AF]";
                borderColor = "border-[#1E40AF]";
              } else if (subCategoryName.includes("350 GSM")) {
                titleColor = "text-[#0284C7]";
                borderColor = "border-[#0284C7]";
              } else if (subCategoryName.includes("REGULAR")) {
                titleColor = "text-[#BE185D]";
                borderColor = "border-[#BE185D]";
              } else if (subCategoryName.includes("NT / PVC")) {
                titleColor = "text-[#15803D]";
                borderColor = "border-[#15803D]";
              } else if (subCategoryName.includes("METAL")) {
                titleColor = "text-[#DC2626]";
                borderColor = "border-[#DC2626]";
              }

              return (
                <div key={subCategoryName} className="space-y-4">
                  <div
                    className={`border-b-2 ${borderColor} pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h2
                          className={`text-base sm:text-lg font-black tracking-tight ${titleColor} uppercase flex items-center gap-2`}
                        >
                          {subCategoryName}
                        </h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${badgeColor}`}
                        >
                          {prods.length}{" "}
                          {prods.length === 1 ? "Product" : "Products"}
                        </span>
                      </div>
                      {subtitle && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={`grid ${gridCols} gap-4`}>
                    {prods.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        // Standard Grid Layout
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
