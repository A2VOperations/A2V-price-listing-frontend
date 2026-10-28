import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import EmptyState from "@/components/common/EmptyState";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductOrderForm from "@/components/product/ProductOrderForm";
import StandieOrderForm from "@/components/product/StandieOrderForm";
import RollUpStandieOrderForm from "@/components/product/RollUpStandieOrderForm";
import StandieHutOrderForm from "@/components/product/StandieHutOrderForm";
import StickerCalculator from "@/components/product/StickerCalculator";
import StandieTypeTabs from "@/components/product/StandieTypeTabs";
import { TbCalculator } from "react-icons/tb";
import { FiArrowRight } from "react-icons/fi";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getProductBySlug, getCategoryBySlug, loading } = useData();
  const rawProduct = getProductBySlug(slug);
  const category = rawProduct ? getCategoryBySlug(rawProduct.categoryId) : null;

  const [selectedVariantName, setSelectedVariantName] = useState("");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">
          Loading product from MongoDB...
        </p>
      </div>
    );
  }

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
        quantityType:
          activeVariantDetails.quantityType ||
          rawProduct.quantityType ||
          "incremental",
        fixedQuantities:
          activeVariantDetails.fixedQuantities &&
          activeVariantDetails.fixedQuantities.length > 0
            ? activeVariantDetails.fixedQuantities
            : rawProduct.fixedQuantities || [],
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumb items={breadcrumbItems} />
          <Link
            to="/calculators/stickers"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors self-start sm:self-auto"
          >
            <TbCalculator className="w-3.5 h-3.5" />
            <span>Open in Dedicated Calculators Section</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <StickerCalculator product={product} />
        <ProductInfo product={product} />
      </div>
    );
  }

  const isRollUpStandie =
    product.isRollUpStandie ||
    product.slug?.includes("rollup") ||
    (product.id === "STD-001" && !product.isIronStandie);

  const isHutStandie =
    product.isHutStandie ||
    product.id === "STD-003" ||
    product.slug?.includes("hut") ||
    product.name?.toLowerCase().includes("hut");

  const isIronStandie =
    product.isStandie ||
    product.id === "STD-002" ||
    product.subCategory?.toUpperCase().includes("STANDIE") ||
    product.slug?.includes("standie");

  const isAnyStandie = isRollUpStandie || isHutStandie || isIronStandie;

  if (isAnyStandie) {
    let currentStandeeType = "rollup";
    if (isHutStandie) currentStandeeType = "hut";
    else if (isIronStandie && !isRollUpStandie) currentStandeeType = "iron-frame";

    const handleSelectStandeeType = (typeId) => {
      if (typeId === "rollup") navigate("/product/rollup-standie");
      else if (typeId === "iron-frame") navigate("/product/iron-frame-standie");
      else if (typeId === "hut") navigate("/product/standee-hut");
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumb items={breadcrumbItems} />
          <Link
            to="/calculators/standee"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors self-start sm:self-auto"
          >
            <TbCalculator className="w-3.5 h-3.5" />
            <span>View in Standee Calculators Hub</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Standee Model Switcher Tabs */}
        <StandieTypeTabs
          activeType={currentStandeeType}
          onSelectType={handleSelectStandeeType}
        />

        {currentStandeeType === "rollup" && (
          <RollUpStandieOrderForm product={product} />
        )}
        {currentStandeeType === "iron-frame" && (
          <StandieOrderForm product={product} />
        )}
        {currentStandeeType === "hut" && (
          <StandieHutOrderForm product={product} />
        )}

        <ProductInfo product={product} />
      </div>
    );
  }

  const isFlexBoard =
    product.isFlexBoard ||
    product.categoryId === "flex-board" ||
    product.slug?.includes("flex");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Breadcrumb items={breadcrumbItems} />
        {isFlexBoard && (
          <Link
            to="/calculators/flex-board"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors self-start sm:self-auto"
          >
            <TbCalculator className="w-3.5 h-3.5" />
            <span>Open in Price Calculators Section</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Interactive Form */}
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
