import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import EmptyState from "@/components/common/EmptyState";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductOrderForm from "@/components/product/ProductOrderForm";
import StandieOrderForm from "@/components/product/StandieOrderForm";
import RollUpStandieOrderForm from "@/components/product/RollUpStandieOrderForm";
import StickerCalculator from "@/components/product/StickerCalculator";

export default function ProductPage() {
  const { slug } = useParams();
  const { getProductBySlug, getCategoryBySlug } = useData();
  const rawProduct = getProductBySlug(slug);
  const category = rawProduct ? getCategoryBySlug(rawProduct.categoryId) : null;

  const [selectedVariantName, setSelectedVariantName] = useState("");

  if (!rawProduct) {
    return (
      <EmptyState
        title="Product Not Found"
        message={`No product exists with slug "${slug}".`}
        actionText="Back to Dashboard"
        actionHref="/"
      />
    );
  }

  // If a variant is selected and has variant-specific details, merge them dynamically!
  const activeVariantDetails =
    rawProduct.variantDetails && rawProduct.variantDetails[selectedVariantName]
      ? rawProduct.variantDetails[selectedVariantName]
      : null;

  const product = activeVariantDetails
    ? {
        ...rawProduct,
        ...activeVariantDetails,
        image: activeVariantDetails.image || rawProduct.image,
        images:
          activeVariantDetails.images && activeVariantDetails.images.length > 0
            ? activeVariantDetails.images
            : rawProduct.images && rawProduct.images.length > 0
              ? rawProduct.images
              : rawProduct.image
                ? [rawProduct.image]
                : [],
        code: activeVariantDetails.code || rawProduct.code,
        basePrice:
          activeVariantDetails.basePrice !== undefined
            ? activeVariantDetails.basePrice
            : rawProduct.basePrice,
        quantityPricingTiers:
          activeVariantDetails.quantityPricingTiers &&
          activeVariantDetails.quantityPricingTiers.length > 0
            ? activeVariantDetails.quantityPricingTiers
            : rawProduct.quantityPricingTiers,
        minQuantity: activeVariantDetails.minQuantity || rawProduct.minQuantity,
        quantityStep:
          activeVariantDetails.quantityStep || rawProduct.quantityStep,
        options: activeVariantDetails.options || rawProduct.options,
        specifications:
          activeVariantDetails.specifications || rawProduct.specifications,
        ourSpecialization:
          activeVariantDetails.ourSpecialization ||
          rawProduct.ourSpecialization,
        productSpecialization:
          activeVariantDetails.productSpecialization ||
          rawProduct.productSpecialization,
        importantNotes:
          activeVariantDetails.importantNotes || rawProduct.importantNotes,
        fileRequirements:
          activeVariantDetails.fileRequirements || rawProduct.fileRequirements,
      }
    : {
        ...rawProduct,
        images:
          rawProduct.images && rawProduct.images.length > 0
            ? rawProduct.images
            : rawProduct.image
              ? [rawProduct.image]
              : [],
      };

  const breadcrumbItems = [
    {
      label: category ? category.name : "Category",
      href: category ? `/category/${category.slug}` : "/",
    },
    { label: product.name },
  ];

  const isSticker =
    product.categoryId === "stickers-labels" ||
    product.isSticker ||
    product.slug?.includes("sticker");

  if (isSticker) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <StickerCalculator product={product} />
        <ProductInfo product={product} />
      </div>
    );
  }

  const isRollUpStandie =
    product.isRollUpStandie ||
    product.slug?.includes("rollup") ||
    (product.id === "STD-001" && !product.isIronStandie);

  if (isRollUpStandie) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <RollUpStandieOrderForm product={product} />
        <ProductInfo product={product} />
      </div>
    );
  }

  const isStandie =
    product.isStandie ||
    product.subCategory?.toUpperCase().includes("STANDIE") ||
    product.slug?.includes("standie");

  if (isStandie) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <StandieOrderForm product={product} />
        <ProductInfo product={product} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Gallery & Info */}
         <div className="xl:col-span-7 space-y-6 min-w-0">
          <ProductOrderForm
            product={product}
            onVariantSelect={(variantName) =>
              setSelectedVariantName(variantName)
            }
          />
        </div>

        {/* Right Column: Complete Screenshot-Matching Order Form */}
        <div className="xl:col-span-5 space-y-6 min-w-0">
          <ProductGallery product={product} />

          {/* Product Code & Basic Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-wide">
                Code: #{product.code}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs text-slate-500 leading-relaxed">
              {product.description}
            </p>
          </div>

          <ProductInfo product={product} />
        </div>
      </div>
    </div>
  );
}
