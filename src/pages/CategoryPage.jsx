import React, { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import EmptyState from "@/components/common/EmptyState";
import StickerCalculator from "@/components/product/StickerCalculator";
import {
  FiSearch,
  FiLayers,
  FiGrid,
  FiList,
  FiMaximize2,
  FiTv,
} from "react-icons/fi";
import { TbCalculator } from "react-icons/tb";

export default function CategoryPage() {
  const { slug } = useParams();

  // Standee and Flex Board are custom calculator categories: redirect directly to their dedicated calculator systems
  if (slug === "standie" || slug === "standee") {
    return <Navigate to="/calculators/standee" replace />;
  }
  if (slug === "flex-board") {
    return <Navigate to="/calculators/flex-board" replace />;
  }
  if (slug === "stickers" || slug === "stickers-labels") {
    return <Navigate to="/calculators/stickers" replace />;
  }

  const { getCategoryBySlug, getProductsByCategory, loading } = useData();
  const category = getCategoryBySlug(slug);

  // Redirect singular visiting-card to plural visiting-cards
  if (slug === "visiting-card") {
    return <Navigate to="/category/visiting-cards" replace />;
  }

  // Retrieve products
  let allProducts = [];
  if (category) {
    allProducts = getProductsByCategory(category.id) || [];
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");

  const isStickerCategory =
    category?.id === "stickers-labels" ||
    category?.slug === "stickers-labels" ||
    category?.id === "stickers" ||
    category?.slug === "stickers";

  const [activeTab, setActiveTab] = useState("products"); // 'calculator' | 'products'

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
    let subCat = product.subCategory || "General Products";

    // For Standee products, separate into distinct model subcategories (Roll-Up Standees, Iron Frame, Huts)
    if (
      product.isRollUpStandie ||
      product.slug?.includes("rollup") ||
      product.id === "STD-001"
    ) {
      subCat = "ROLL-UP STANDEES";
    } else if (
      product.isStandie ||
      product.slug?.includes("iron-frame") ||
      product.id === "STD-002"
    ) {
      subCat = "IRON FRAME STANDEES";
    } else if (
      product.isHutStandie ||
      product.slug?.includes("hut") ||
      product.id === "STD-003"
    ) {
      subCat = "STANDEE HUTS (A-FRAME)";
    }

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

      {/* Category Header */}
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
              "Browse all available specifications, sheet layouts, GSM grades, and custom finishing options."}
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
            onClick={() => setActiveTab("products")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "products"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FiList className="w-4 h-4" />
            Standard Products Catalog ({filteredProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "calculator"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FiGrid className="w-4 h-4" />
            Sticker Sheet Calculator (12×18 &amp; 13×19)
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
        // Grouped Subcategories Layout matching Image 2 reference design
        <div className="space-y-10">
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
              "ROLL-UP STANDEES",
              "IRON FRAME STANDEES",
              "STANDEE HUTS (A-FRAME)",
              "FLEX BOARD PRINTING",
              "PVC FILES",
              "SBS FILES",
              "PVC CLIP",
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
              return (
                <div key={subCategoryName} className="space-y-5">
                  {/* Subcategory Header matching Image 2 */}
                  <div className="border-b-2 border-[#C2410C] pb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#C2410C] uppercase flex items-center gap-2">
                        {subCategoryName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                        {prods.length} {prods.length === 1 ? "Product" : "Products"}
                      </span>
                    </div>
                  </div>

                  {/* Products Grid matching Image 2 card sizing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-1">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
