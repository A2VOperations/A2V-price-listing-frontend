import React, { useState, useEffect, useMemo } from "react";
import {
  FiPackage,
  FiLayers,
  FiCheck,
  FiTag,
  FiDownload,
  FiUser,
  FiPhone,
  FiPercent,
  FiFileText,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import { calculateProductPrice } from "@/lib/priceCalculator";
import { generateGeneralProductQuotationPdf } from "@/lib/generateQuotationPdf";
import FlexBoardOrderForm from "./FlexBoardOrderForm";
import StandieOrderForm from "./StandieOrderForm";
import RollUpStandieOrderForm from "./RollUpStandieOrderForm";
import StandieHutOrderForm from "./StandieHutOrderForm";
import StickerCalculator from "./StickerCalculator";

export default function ProductOrderForm({
  product,
  customBasePrice,
  onVariantSelect,
}) {
  if (
    product?.isRollUpStandie ||
    product?.slug?.includes("rollup") ||
    (product?.id === "STD-001" && !product?.isIronStandie)
  ) {
    return (
      <RollUpStandieOrderForm
        product={product}
        onVariantSelect={onVariantSelect}
      />
    );
  }

  if (
    product?.isHutStandie ||
    product?.id === "STD-003" ||
    product?.slug?.includes("hut") ||
    product?.name?.toLowerCase().includes("hut")
  ) {
    return (
      <StandieHutOrderForm
        product={product}
        onVariantSelect={onVariantSelect}
      />
    );
  }

  if (
    product?.id === "STD-002" ||
    product?.isStandie ||
    product?.subCategory?.toUpperCase().includes("STANDIE") ||
    product?.slug?.includes("standie")
  ) {
    return (
      <StandieOrderForm product={product} onVariantSelect={onVariantSelect} />
    );
  }
  if (product?.isFlexBoard || product?.categoryId === "flex-board") {
    return (
      <FlexBoardOrderForm product={product} onVariantSelect={onVariantSelect} />
    );
  }
  if (product?.categoryId === "stickers-labels" || product?.isSticker) {
    return <StickerCalculator product={product} />;
  }
  const { addToQuote, clientInfo, updateClientInfo } = useQuote();

  const [selectedVariant, setSelectedVariant] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountMode, setDiscountMode] = useState("amount"); // 'amount' | 'percent'
  const [clientName, setClientName] = useState(clientInfo?.clientName || "");
  const [clientPhone, setClientPhone] = useState(clientInfo?.phone || "");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    if (clientInfo?.clientName && !clientName) {
      setClientName(clientInfo.clientName);
    }
    if (clientInfo?.phone && !clientPhone) {
      setClientPhone(clientInfo.phone);
    }
  }, [clientInfo]);

  const activeVariantDetails =
    product?.variantDetails &&
    selectedVariant &&
    product.variantDetails[selectedVariant]
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
        quantityType:
          activeVariantDetails.quantityType ||
          product.quantityType ||
          "incremental",
        fixedQuantities:
          activeVariantDetails.fixedQuantities &&
          activeVariantDetails.fixedQuantities.length > 0
            ? activeVariantDetails.fixedQuantities
            : product.fixedQuantities || [],
        minQuantity: activeVariantDetails.minQuantity || product.minQuantity,
        quantityStep: activeVariantDetails.quantityStep || product.quantityStep,
        options: activeVariantDetails.options || product.options,
      }
    : product;

  const isSelectQty =
    currentProduct.quantityType === "select" &&
    Array.isArray(currentProduct.fixedQuantities) &&
    currentProduct.fixedQuantities.length > 0;

  const minQty = currentProduct.minQuantity || 500;
  const [quantity, setQuantity] = useState(isSelectQty ? "" : minQty);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [addedSuccess, setAddedSuccess] = useState(false);

  const productOptions = (currentProduct?.options || []).filter(Boolean);

  useEffect(() => {
    if (product) {
      const hasMultipleVariants = Boolean(
        product.variantCombinations && product.variantCombinations.length > 1,
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
      if (isSelectQty) {
        setQuantity((prev) => {
          const exists = currentProduct.fixedQuantities.some(
            (fq) => Number(fq.qty) === Number(prev),
          );
          return exists ? prev : "";
        });
      } else {
        setQuantity(currentProduct.minQuantity || 500);
      }

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

  // Form is valid if variant selected, quantity selected & all required product options have values
  const isQuantityValid = isSelectQty
    ? Boolean(quantity && Number(quantity) > 0)
    : Boolean(quantity && Number(quantity) >= minQty);

  const isFormValid = Boolean(
    selectedVariant &&
    isQuantityValid &&
    productOptions.every((group) => {
      const key = group.name || group.id;
      return group.required === false || Boolean(selectedOptions[key]);
    }),
  );

  const calculation = calculateProductPrice({
    product: currentProduct,
    selectedOptions,
    quantity,
    customBasePrice,
    gstRate: 0,
  });

  const applicableCost = isFormValid ? calculation?.totalAmount || 0 : 0;

  // Calculate last price for the current quantity & variant to reveal strictly on hover
  const currentLastPrice = useMemo(() => {
    if (!isFormValid) return null;
    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) return null;

    let baseLastPrice = 0;
    let hasBaseLastPrice = false;

    if (isSelectQty) {
      const matched = currentProduct.fixedQuantities?.find(
        (fq) => Number(fq.qty) === numQty,
      );
      if (
        matched &&
        matched.lastPrice !== undefined &&
        matched.lastPrice !== null &&
        matched.lastPrice !== "" &&
        !isNaN(Number(matched.lastPrice)) &&
        Number(matched.lastPrice) > 0
      ) {
        baseLastPrice = Number(matched.lastPrice);
        hasBaseLastPrice = true;
      }
    } else if (
      currentProduct.quantityPricingTiers &&
      currentProduct.quantityPricingTiers.length > 0
    ) {
      const effQty = Math.max(numQty, currentProduct.minQuantity || 1);
      const sortedTiers = [...currentProduct.quantityPricingTiers].sort(
        (a, b) => b.minQty - a.minQty,
      );
      const applicableTier = sortedTiers.find((t) => effQty >= t.minQty);
      if (
        applicableTier &&
        applicableTier.lastPrice !== undefined &&
        applicableTier.lastPrice !== null &&
        applicableTier.lastPrice !== "" &&
        !isNaN(Number(applicableTier.lastPrice)) &&
        Number(applicableTier.lastPrice) > 0
      ) {
        baseLastPrice = Number(applicableTier.lastPrice) * effQty;
        hasBaseLastPrice = true;
      }
    }

    const optLastTotal = calculation?.optionsLastPriceTotal || 0;
    const hasCustomOptionLastPrice = optLastTotal > 0;

    // If Last Price is set by Variation Custom Options, don't add Particular Quantity Last Price;
    // if not, put the Last Price of Particular Quantity Prices.
    if (hasCustomOptionLastPrice) {
      return Math.round(optLastTotal);
    } else if (hasBaseLastPrice) {
      return Math.round(baseLastPrice);
    }

    return null;
  }, [
    isFormValid,
    quantity,
    isSelectQty,
    currentProduct,
    calculation?.optionsTotal,
    calculation?.optionsLastPriceTotal,
    calculation?.baseUnitPrice,
  ]);

  // Specific discount calculation as per price
  const numDiscount = Math.max(0, parseFloat(discount) || 0);
  const calculatedDiscount =
    discountMode === "percent"
      ? Math.round((applicableCost * Math.min(100, numDiscount)) / 100)
      : numDiscount;
  const validDiscount = Math.min(applicableCost, calculatedDiscount);
  const amountPayable = Math.max(0, applicableCost - validDiscount);
  const discountPct =
    applicableCost > 0 ? Math.round((validDiscount / applicableCost) * 100) : 0;

  const handleAddOrder = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (clientName || clientPhone) {
      updateClientInfo({ clientName, phone: clientPhone });
    }

    const orderCalculation = {
      ...calculation,
      subtotal: applicableCost,
      discount: validDiscount,
      totalAmount: amountPayable,
    };

    addToQuote(currentProduct, selectedOptions, quantity, orderCalculation);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleDownloadPdf = () => {
    if (!isFormValid) return;
    setIsGeneratingPdf(true);
    try {
      if (clientName || clientPhone) {
        updateClientInfo({ clientName, phone: clientPhone });
      }

      generateGeneralProductQuotationPdf({
        productName: currentProduct.name,
        productCode: currentProduct.code,
        selectedVariant,
        selectedOptions,
        quantity,
        unitName: currentProduct.unitName || "Pieces",
        applicableCost,
        validDiscount,
        totalAmount: amountPayable,
        clientInfo: {
          clientName:
            clientName.trim() || clientInfo?.clientName || "Walk-in Client",
          phone: clientPhone.trim() || clientInfo?.phone || "",
        },
        specifications: currentProduct.specifications,
      });

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3000);
    } catch (err) {
      console.error("PDF quotation generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
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
          <p>
            Please select a product from the dropdown above to view options and
            order details.
          </p>
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
              <FiTag className="w-4 h-4 text-orange-600 flex-shrink-0" />
              <span>Qty.</span>
            </div>

            {isSelectQty ? (
              <div className="w-full sm:w-72">
                <select
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-orange-600 focus:outline-none cursor-pointer"
                >
                  <option value="">--Select--</option>
                  {currentProduct.fixedQuantities.map((item, idx) => (
                    <option key={idx} value={item.qty}>
                      {item.qty}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          minQty,
                          quantity - (currentProduct.quantityStep || 100),
                        ),
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
                        Math.max(
                          minQty,
                          parseInt(e.target.value, 10) || minQty,
                        ),
                      )
                    }
                    className="w-20 px-2 py-1.5 text-center font-extrabold text-slate-900 bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        quantity + (currentProduct.quantityStep || 100),
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
            )}
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

          {/* SPECIFIC DISCOUNT AS PER PRICE */}
          <div className="p-3.5 sm:px-4 bg-orange-50/40 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <FiTag className="w-3.5 h-3.5 text-orange-600" />
                  Special Discount as per Price
                </span>
                <span className="text-[10px] text-slate-500">
                  Apply flat rupee (₹) or percentage (%) discount on total price
                </span>
              </div>

              {/* Mode Toggle: ₹ / % */}
              <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setDiscountMode("amount")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    discountMode === "amount"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ₹ Rupees
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountMode("percent")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    discountMode === "percent"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  % Percent
                </button>
              </div>
            </div>

            {/* Discount Input & Steppers */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-orange-100">
              <div className="flex items-center space-x-2">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() =>
                      setDiscount((prev) =>
                        Math.max(
                          0,
                          (Number(prev) || 0) -
                            (discountMode === "percent" ? 5 : 50),
                        ),
                      )
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-r border-slate-300 select-none active:bg-slate-300"
                    aria-label="Decrease discount"
                  >
                    -
                  </button>
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-xs font-bold text-slate-400">
                      {discountMode === "percent" ? "%" : "₹"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      max={discountMode === "percent" ? 100 : applicableCost}
                      step={discountMode === "percent" ? 1 : 50}
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      placeholder="0"
                      className="w-20 pl-5 pr-1 py-1 text-xs text-center font-bold text-slate-900 bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDiscount((prev) =>
                        Math.min(
                          discountMode === "percent" ? 100 : applicableCost,
                          (Number(prev) || 0) +
                            (discountMode === "percent" ? 5 : 50),
                        ),
                      )
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-l border-slate-300 select-none active:bg-slate-300"
                    aria-label="Increase discount"
                  >
                    +
                  </button>
                </div>
                {validDiscount > 0 && (
                  <button
                    type="button"
                    onClick={() => setDiscount(0)}
                    className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap"
                    title="Clear discount"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PRICE BREAKDOWN TABLE */}
          <div className="divide-y divide-slate-200 text-xs">
            <div className="p-3.5 sm:px-4 flex justify-between items-center group relative hover:bg-amber-50/25 transition-colors cursor-default select-none">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">
                  Applicable Cost
                </span>
                {currentLastPrice !== null && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs">
                    <span className="font-normal text-amber-700">Last Price:</span>
                    <span>Rs. {currentLastPrice.toLocaleString()}/-</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentLastPrice !== null && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[11px] font-semibold text-slate-400 hidden sm:inline">
                    (Last: Rs. {currentLastPrice.toLocaleString()}/-)
                  </span>
                )}
                <span className="font-bold text-slate-900">
                  Rs. {applicableCost.toLocaleString()}/-
                </span>
              </div>

              {/* Floating Tooltip strictly on Hover */}
              {currentLastPrice !== null && (
                <div className="pointer-events-none absolute -top-8 left-4 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-semibold rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-30 flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-amber-400 font-bold">Last Price:</span>
                  <span className="font-bold text-white">
                    Rs. {currentLastPrice.toLocaleString()}/-
                  </span>
                  <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                </div>
              )}
            </div>

            {validDiscount > 0 && (
              <div className="p-3.5 sm:px-4 flex justify-between items-center bg-orange-50/30 text-orange-700">
                <span className="font-semibold flex items-center gap-1.5">
                  <FiTag className="w-3.5 h-3.5 text-orange-600" />
                  Special Discount ({discountPct}% Off)
                </span>
                <span className="font-bold text-orange-700">
                  - Rs. {validDiscount.toLocaleString()}/-
                </span>
              </div>
            )}

            <div className="p-3.5 sm:px-4 flex justify-between items-center bg-slate-50/60">
              <div>
                <span className="font-bold text-slate-900 block">
                  Amount Payable
                </span>
                {validDiscount > 0 && (
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    You save Rs. {validDiscount.toLocaleString()}/-
                  </span>
                )}
              </div>
              <span className="font-extrabold text-orange-600 text-base">
                Rs. {amountPayable.toLocaleString()}/-
              </span>
            </div>
          </div>

          {/* CLIENT INFORMATION FOR OFFICIAL QUOTATION */}
          <div className="p-3.5 sm:px-4 bg-slate-50/80 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FiUser className="w-3.5 h-3.5 text-orange-600" />
                Client Details (For Official Quotation PDF):
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Personalized Estimate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <FiUser className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Client / Company Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-600 focus:outline-none"
                />
              </div>

              <div className="relative">
                <FiPhone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  placeholder="Client Phone Number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS: DOWNLOAD QUOTATION & ADD ORDER */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. DOWNLOAD QUOTATION PDF BUTTON */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={!isFormValid || isGeneratingPdf}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 border cursor-pointer ${
              !isFormValid
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : pdfSuccess
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 active:scale-[0.99]"
            }`}
          >
            {pdfSuccess ? (
              <>
                <FiCheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-emerald-200">
                  Quotation Downloaded!
                </span>
              </>
            ) : isGeneratingPdf ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FiDownload className="w-4 h-4 text-orange-400" />
                <span>Download Quotation (PDF)</span>
              </>
            )}
          </button>

          {/* 2. SUBMIT / ADD ORDER BUTTON */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
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
            ) : isSelectQty && !quantity ? (
              <span>Select Quantity to Continue</span>
            ) : (
              <>
                <FiPackage className="w-4 h-4" />
                <span>Add Order (Pay From Wallet)</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-center text-slate-400">
          Official quotation PDF includes full option specifications, discount
          deduction, and client contact info.
        </p>
      </div>
    </form>
  );
}
