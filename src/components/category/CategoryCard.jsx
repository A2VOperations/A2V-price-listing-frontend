import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import ProductImage from "../common/ProductImage";

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Category Image Preview Container */}
      <div className="h-40 w-full bg-slate-100 relative overflow-hidden">
        <ProductImage
          src={category.image}
          alt={category.name}
          categoryName={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className=" pb-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {category.name}
          </h3>
        </div>

        <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
          <span>View Products</span>
          <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
