"use client";

import React, { useState } from "react";
import { FiImage } from "react-icons/fi";

export default function ProductImage({ src, alt, className = "w-full h-full object-cover", categoryName = "" }) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 p-4 select-none ${className}`}>
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 mb-2">
          <FiImage className="w-6 h-6" />
        </div>
        <span className="text-xs font-semibold text-slate-600 text-center line-clamp-1">{alt || categoryName || "A2V Product"}</span>
        <span className="text-[10px] text-slate-400 mt-0.5">Sample Reference</span>
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
