import React from "react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import AdminLayout from "./AdminLayout";
import {
  FiFolder,
  FiBox,
  FiLayers,
  FiPlus,
  FiSliders,
  FiCheckCircle,
  FiHelpCircle,
} from "react-icons/fi";

export default function AdminDashboard() {
  const { categories, products } = useData();

  // Compute unique sub-categories
  const subCategoriesSet = new Set();
  let totalVariantsCount = 0;

  products.forEach((p) => {
    if (p.subCategory) subCategoriesSet.add(p.subCategory);
    if (p.variantCombinations && Array.isArray(p.variantCombinations)) {
      totalVariantsCount += p.variantCombinations.length;
    }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Categories
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{categories.length}</h3>
              <Link
                to="/admin/categories"
                className="text-[11px] font-bold text-orange-600 hover:underline mt-2 inline-block"
              >
                Manage Categories &rarr;
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <FiFolder className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sub-Categories
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {subCategoriesSet.size}
              </h3>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Across all product lines
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <FiLayers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Products & Lines
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{products.length}</h3>
              <Link
                to="/admin/products"
                className="text-[11px] font-bold text-orange-600 hover:underline mt-2 inline-block"
              >
                Manage Products &rarr;
              </Link>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FiBox className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sub-Sub / Variants
              </p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">
                {totalVariantsCount}
              </h3>
              <span className="text-[11px] text-slate-400 mt-2 block">
                Die Cut, UV, Foil, GSM Specs
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FiSliders className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* System Hierarchy Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
            <FiHelpCircle className="w-5 h-5 text-orange-600" />
            <h2>Catalog Structure & Editing Guide</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                1. Category Level
              </span>
              <h3 className="font-bold text-xs text-slate-800">Main Categories</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                e.g. <em>Visiting Cards</em>, <em>Flex Board</em>, <em>ATM Pouches</em>. Appears on the home dashboard grid.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                2. Sub-Category Level
              </span>
              <h3 className="font-bold text-xs text-slate-800">Sub-Category Grouping</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                e.g. <em>500 GSM CARDS (QTY. 500 CARDS)</em>, <em>400 GSM CARDS</em>. Groups cards on category pages with custom color banners.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                3. Product & Sub-Sub Variations
              </span>
              <h3 className="font-bold text-xs text-slate-800">Variations & Options</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                e.g. <em>500 GSM + Velvet + Die Cut</em>. Includes dropdown choices, custom pricing tiers, specs, and production times.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/admin/categories"
            className="flex-1 p-5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-all flex items-center justify-between text-orange-950 group"
          >
            <div>
              <h3 className="font-bold text-sm">Manage Main Categories</h3>
              <p className="text-xs text-orange-700 mt-1">Add, edit category names, descriptions, and thumbnails.</p>
            </div>
            <FiPlus className="w-5 h-5 group-hover:scale-125 transition-transform" />
          </Link>

          <Link
            to="/admin/products"
            className="flex-1 p-5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center justify-between text-emerald-900 group"
          >
            <div>
              <h3 className="font-bold text-sm">Manage Products & Variations</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Edit sub-categories, sub-sub variation details, price tiers, specs, and options.
              </p>
            </div>
            <FiPlus className="w-5 h-5 group-hover:scale-125 transition-transform" />
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
