import React, { useState, useEffect } from "react";
import { FiPackage, FiLayers, FiCheck } from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import { calculateProductPrice } from "@/lib/priceCalculator";
import FlexBoardOrderForm from "./FlexBoardOrderForm";
import StandieOrderForm from "./StandieOrderForm";
import RollUpStandieOrderForm from "./RollUpStandieOrderForm";
import StickerCalculator from "./StickerCalculator";

export default function ProductOrderForm({
  product,
  customBasePrice,
  onVariantSelect,
}) {
  if (
    product?.id === "STD-002" ||
    product?.id === "STD-001" ||
    product?.isRollUpStandie ||
    product?.slug?.includes("rollup")
  ) {
    return <RollUpStandieOrderForm product={product} onVariantSelect={onVariantSelect} />;
  }

  if (
    product?.isStandie ||
    product?.subCategory?.toUpperCase().includes("STANDIE") ||
    product?.slug?.includes("standie")
  ) {
    return <StandieOrderForm product={product} onVariantSelect={onVariantSelect} />;
  }
  if (product?.isFlexBoard || product?.categoryId === "flex-board") {
    return <FlexBoardOrderForm product={product} onVariantSelect={onVariantSelect} />;
  }
  if (product?.categoryId === "stickers-labels" || product?.isSticker) {
    return <StickerCalculator product={product} />;
  }
  const { addToQuote } = useQuote();

  const [selectedVariant, setSelectedVariant] = useState("");

  const activeVariantDetails =
    product?.variantDetails && selectedVariant && product.variantDetails[selectedVariant]
      ? product.variantDetails[selectedVariant]
      : null;

  const currentProduct = activeVariantDetails
    ? {
        ...product,
        ...activeVariantDetails,
        basePrice:
          activeVariantDetails.basePrice !== undefined
            ? activeVariantDetails.basePrice
            : product.basePrice,
        quantityPricingTiers:
          activeVariantDetails.quantityPricingTiers &&
          activeVariantDetails.quantityPricingTiers.length > 0
            ? activeVariantDetails.quantityPricingTiers
            : product.quantityPricingTiers,
        minQuantity: activeVariantDetails.minQuantity || product.minQuantity,
        quantityStep: activeVariantDetails.quantityStep || product.quantityStep,
        options: activeVariantDetails.options || product.options,
      }
    : product;

  const minQty = currentProduct.minQuantity || 500;
  const [quantity, setQuantity] = useState(minQty);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [addedSuccess, setAddedSuccess] = useState(false);

  const productOptions = (currentProduct?.options || []).filter(Boolean);

  useEffect(() => {
    if (product) {
      const hasMultipleVariants = Boolean(
        product.variantCombinations && product.variantCombinations.length > 1
      );
      if (!selectedVariant) {
        if (!hasMultipleVariants && product.variantCombinations?.[0]) {
          setSelectedVariant(product.variantCombinations[0]);
        } else if (!hasMultipleVariants) {
          setSelectedVariant(product.name || "");
        }
      }
    }
  }, [product]);

  useEffect(() => {
    if (currentProduct) {
      setQuantity(currentProduct.minQuantity || 500);

      const initialOptions = {};
      (currentProduct.options || []).filter(Boolean).forEach((group) => {
        const key = group.name || group.id;
        initialOptions[key] = group.values?.[0]?.label || "";
      });
      setSelectedOptions(initialOptions);
    }
  }, [selectedVariant, product]);

  const handleOptionChange = (optionKey, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionKey]: value,
    }));
  };

  // Form is valid if variant selected & all required product options have values
  const isFormValid = Boolean(
    selectedVariant &&
      productOptions.every((group) => {
        const key = group.name || group.id;
        return group.required === false || Boolean(selectedOptions[key]);
      })
  );

  const calculation = calculateProductPrice({
    product: currentProduct,
    selectedOptions,
    quantity,
    customBasePrice,
    gstRate: 0,
  });

  const applicableCost = isFormValid ? calculation?.totalAmount || 0 : 0;

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    addToQuote(currentProduct, selectedOptions, quantity, calculation);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const variantsList = product.variantCombinations || [product.name];

  const formatLabel = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <form onSubmit={handleAddOrder} className="space-y-6 text-slate-800">
      {/* 1. SELECT PRODUCT DROPDOWN */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
          SELECT PRODUCT
        </label>
        <select
          value={selectedVariant}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedVariant(val);
            if (onVariantSelect) onVariantSelect(val);
          }}
          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-orange-600 focus:outline-none cursor-pointer"
        >
          <option value="">--Select Product--</option>
          {variantsList.map((v, idx) => (
            <option key={idx} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* 2. MAIN FORM CONTAINER TABLE (OPENS ACCORDING TO SELECTED PRODUCT) */}
      {!selectedVariant ? (
        <div className="bg-white rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500 font-medium space-y-1">
          <p className="font-bold text-slate-700">No Product Selected</p>
          <p>Please select a product from the dropdown above to view options and order details.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-300 overflow-hidden shadow-xs divide-y divide-slate-200">
          {/* SELECT DETAIL Header */}
          <div className="px-4 py-3 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-900">
            SELECT DETAIL
          </div>

          {/* Quantity Row */}
          <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2 font-bold text-orange-950">
              <FiPackage className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>Quantity</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      Math.max(
                        minQty,
                        quantity - (currentProduct.quantityStep || 100)
                      )
                    )
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm border-r border-slate-300 select-none active:bg-slate-300 transition-colors"
                  aria-label="Decrease Quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  min={minQty}
                  step={currentProduct.quantityStep || 100}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(minQty, parseInt(e.target.value, 10) || minQty)
                    )
                  }
                  className="w-20 px-2 py-1.5 text-center font-extrabold text-slate-900 bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(
                      quantity + (currentProduct.quantityStep || 100)
                    )
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm border-l border-slate-300 select-none active:bg-slate-300 transition-colors"
                  aria-label="Increase Quantity"
                >
                  +
                </button>
              </div>
              <span className="text-xs font-semibold text-orange-600">
                (Min Qty. : {minQty})
              </span>
            </div>
          </div>

          {/* Dynamic Product Options Row (ONLY shown if present in product.options) */}
          {productOptions.map((group) => {
            const key = group.name || group.id;
            const currentVal = selectedOptions[key] || "";
            return (
              <div
                key={key}
                className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-2 font-bold text-orange-950">
                  <FiLayers className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span>{group.name || group.id}</span>
                </div>
                <select
                  value={currentVal}
                  onChange={(e) => handleOptionChange(key, e.target.value)}
                  className="w-full sm:w-72 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded text-slate-800 focus:ring-2 focus:ring-orange-600 focus:outline-none font-medium cursor-pointer"
                >
                  {(group.required === false || !currentVal) && (
                    <option value="">--Select--</option>
                  )}
                  {(group.values || []).map((v, idx) => (
                    <option key={idx} value={v.label}>
                      {formatLabel(v.label)}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}

          {/* CONGRATULATIONS FREE DELIVERY BANNER */}
          <div className="px-4 py-3 bg-slate-50 font-black text-xs text-center text-slate-900 uppercase tracking-wide">
            CONGRATULATIONS! ORDER&apos;S ELIGIBLE FOR FREE DELIVERY
          </div>

          {/* PRICE BREAKDOWN TABLE */}
          <div className="divide-y divide-slate-200 text-xs">
            <div className="p-3.5 sm:px-4 flex justify-between items-center">
              <span className="font-semibold text-slate-700">
                Applicable Cost
              </span>
              <span className="font-bold text-slate-900">
                Rs. {applicableCost.toLocaleString()}/-
              </span>
            </div>

            <div className="p-3.5 sm:px-4 flex justify-between items-center bg-slate-50/60">
              <span className="font-bold text-slate-900">Amount Payable</span>
              <span className="font-extrabold text-orange-600 text-sm">
                Rs. {applicableCost.toLocaleString()}/-
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={!isFormValid}
        className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
          !isFormValid
            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
            : addedSuccess
              ? "bg-emerald-600 text-white"
              : "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.99]"
        }`}
      >
        {addedSuccess ? (
          <>
            <FiCheck className="w-5 h-5" />
            <span>Order Added to Cart!</span>
          </>
        ) : (
          <span>Add Order (Pay From Wallet)</span>
        )}
      </button>
    </form>
  );
}
