import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { TbCalculator } from "react-icons/tb";
import ProductImage from "../common/ProductImage";

export default function CategoryCard({ category }) {
  const isCalculatorCategory =
    category.slug === "flex-board" ||
    category.id === "flex-board" ||
    category.slug === "stickers-labels" ||
    category.slug === "stickers" ||
    category.id === "stickers-labels";

  let destination = `/category/${category.slug}`;
  let actionText = "View Products";
  let badgeText = null;

  if (category.slug === "flex-board" || category.id === "flex-board") {
    destination = "/calculators/flex-board";
    actionText = "Open Calculator";
    badgeText = "Flex & Standee Tool";
  } else if (category.slug === "stickers-labels" || category.slug === "stickers" || category.id === "stickers-labels") {
    destination = "/calculators/stickers";
    actionText = "Open Calculator";
    badgeText = "Sheet Nesting Tool";
  }

  return (
    <Link
      to={destination}
      className={`group bg-white rounded-xl border shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden ${
        isCalculatorCategory
          ? "border-orange-300 hover:border-orange-500 ring-1 ring-orange-500/10"
          : "border-slate-200/80 hover:border-orange-400"
      }`}
    >
      {/* Category Image Preview Container */}
      <div className="h-40 w-full bg-slate-100 relative overflow-hidden">
        <ProductImage
          src={category.image}
          alt={category.name}
          categoryName={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badgeText && (
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-600 text-white shadow-xs">
            <TbCalculator className="w-3 h-3" />
            {badgeText}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="pb-2 text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {category.name}
          </h3>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
          <span className="flex items-center gap-1.5">
            {isCalculatorCategory && <TbCalculator className="w-3.5 h-3.5" />}
            {actionText}
          </span>
          <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
