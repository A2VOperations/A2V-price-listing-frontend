"use client";

import React, { useState, useEffect } from "react";
import ProductImage from "../common/ProductImage";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ProductGallery({ product }) {
  const [activeImage, setActiveImage] = useState(product?.image || "");

  // Sync activeImage whenever the parent product or selected variant changes
  useEffect(() => {
    if (product?.image) {
      setActiveImage(product.image);
    }
  }, [product?.image, product?.slug]);

  const allImages = [
    product?.image,
    ...(Array.isArray(product?.images) ? product.images : []),
  ].filter(Boolean);

  const thumbnails = Array.from(new Set(allImages));
  const currentImage = activeImage || product?.image || thumbnails[0] || "";
  const currentIndex = thumbnails.indexOf(currentImage);

  const handlePrev = () => {
    if (thumbnails.length <= 1) return;
    const prevIdx = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    setActiveImage(thumbnails[prevIdx]);
  };

  const handleNext = () => {
    if (thumbnails.length <= 1) return;
    const nextIdx = (currentIndex + 1) % thumbnails.length;
    setActiveImage(thumbnails[nextIdx]);
  };

  return (
    <div className="space-y-3">
      {/* Main Image Display */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs h-72 sm:h-96 w-full flex items-center justify-center p-3 relative group">
        <ProductImage
          src={currentImage}
          alt={product?.name || "Product Image"}
          categoryName={product?.categoryId}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Product Code Badge */}
        {product?.code && (
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-1 rounded">
            Product Code: {product.code}
          </div>
        )}

        {/* Prev / Next Navigation buttons on hover when multiple images exist */}
        {thumbnails.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-slate-700 hover:text-orange-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              title="Previous image"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md text-slate-700 hover:text-orange-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              title="Next image"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Multiple Images Thumbnail Gallery */}
      {thumbnails.length > 1 && (
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1.5 pt-0.5">
          {thumbnails.map((thumbSrc, idx) => {
            const isSelected =
              activeImage === thumbSrc || (!activeImage && currentImage === thumbSrc);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(thumbSrc)}
                className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-slate-50 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "border-orange-600 ring-2 ring-orange-600/30 scale-105 shadow-xs"
                    : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
                }`}
              >
                <ProductImage
                  src={thumbSrc}
                  alt={`${product?.name || "Product"} view ${idx + 1}`}
                  categoryName={product?.categoryId}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
