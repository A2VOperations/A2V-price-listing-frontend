"use client";

import React, { useState } from "react";
import { FiImage } from "react-icons/fi";

export default function ProductImage({ src, alt, className = "w-full h-full object-cover", categoryName = "" }) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className={`bg-gradient-to-b from-blue-50/60 via-slate-50 to-blue-50/40 flex flex-col items-center justify-center text-slate-400 p-4 select-none ${className}`}>
        <div className="w-14 h-14 rounded-full bg-white shadow-xs flex items-center justify-center text-orange-600 mb-2">
          <FiImage className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-slate-800 text-center line-clamp-1 uppercase tracking-tight">
          {alt || categoryName || "A2V Product"}
        </span>
        <span className="text-[10px] text-slate-400 font-medium mt-0.5">Sample Reference</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || "Product image"}
      className={className}
      onError={() => setImgError(true)}
    />
  );
}
