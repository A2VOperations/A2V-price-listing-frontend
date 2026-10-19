import React, { useState, useMemo } from "react";
import {
  FiMaximize2,
  FiSliders,
  FiShoppingBag,
  FiDownload,
  FiCheckCircle,
  FiLayers,
  FiShield,
  FiInfo,
  FiGrid,
  FiPackage,
  FiZap,
  FiCheck,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import StandieHutPreview from "./StandieHutPreview";
import { generateStandieHutQuotationPdf } from "@/lib/generateQuotationPdf";

const FIXED_SIZE_PRESETS = [
  { width: 2.5, height: 4, label: "2.5 × 4 Ft", tag: "Popular Compact" },
  { width: 3, height: 4, label: "3 × 4 Ft", tag: "Standard Display" },
  { width: 2, height: 3, label: "2 × 3 Ft", tag: "Countertop / Small" },
  { width: 3, height: 5, label: "3 × 5 Ft", tag: "Tall / High Visibility" },
];

const FRAME_OPTIONS = {
  "iron-3kg": {
    id: "iron-3kg",
    name: "Iron Frame - Light (3 kg)",
    weightLabel: "3 kg Iron Pipe",
    defaultRate: 35,
    tag: "Economy / Light Duty",
    description: "Lightweight 3 kg square MS iron pipe frame welded in A-frame tent geometry with top hinges.",
    allowedMedia: ["star-flex"],
  },
  "iron-5kg": {
    id: "iron-5kg",
    name: "Iron Frame - Heavy (5 kg)",
    weightLabel: "5 kg Heavy Iron",
    defaultRate: 50,
    tag: "Heavy-Duty / High Stability",
    description: "Heavyweight 5 kg solid MS iron pipe frame designed for windy outdoor shopfronts and exhibitions.",
    allowedMedia: ["star-flex"],
  },
  "wooden": {
    id: "wooden",
    name: "Wooden Timber Frame",
    weightLabel: "Natural Wood",
    defaultRate: 20,
    tag: "Classic Wooden Finish",
    description: "Natural polished wooden battens assembled into traditional A-board easel tent standee.",
    allowedMedia: ["normal-flex", "star-flex"],
  },
};

const MEDIA_CATALOG = {
  "normal-flex": {
    id: "normal-flex",
    name: "Normal Frontlit Flex",
    defaultRate: 15,
    tag: "Standard Matte",
    description: "Standard weather-resistant frontlit flex media with vibrant outdoor visibility.",
  },
  "star-flex": {
    id: "star-flex",
    name: "Star Flex - High Gloss Finish",
    defaultRate: 25,
    tag: "Premium Gloss",
    description: "High durability glossy flex with vivid contrast, deep blacks, and rich ink saturation.",
  },
};

export default function StandieHutOrderForm({ product, onVariantSelect }) {
  const { addToQuote } = useQuote();

  // Dimensions
  const [standeeWidth, setStandeeWidth] = useState(2.5);
  const [standeeHeight, setStandeeHeight] = useState(4);
  const [legClearance, setLegClearance] = useState(0.5); // 0.5 ft fixed bottom legs

  // Frame Material & Rates
  const [frameType, setFrameType] = useState("iron-3kg"); // "iron-3kg" | "iron-5kg" | "wooden"
  const [customFrameRate, setCustomFrameRate] = useState(35);
  const [manualRunningFt, setManualRunningFt] = useState("");

  // Flex Media Selection & Rate
  const [selectedMediaId, setSelectedMediaId] = useState("star-flex");
  const [customFlexRate, setCustomFlexRate] = useState(25);
  const [isDoubleSided, setIsDoubleSided] = useState(true);

  // Top Apex Hinges (Default 2 hinges @ ₹15 each, customizable quantity & price)
  const [hingesCount, setHingesCount] = useState(2);
  const [customHingeRate, setCustomHingeRate] = useState(15);

  // Quantity & Discount
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // Client info for PDF
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Safe Dimension Parsing
  const validWidth = Math.max(1, parseFloat(standeeWidth) || 2.5);
  const validHeight = Math.max(1.5, parseFloat(standeeHeight) || 4);
  const validLeg = Math.max(0, Math.min(validHeight - 0.5, parseFloat(legClearance) || 0.5));

  // Flex Display Area
  const flexHeight = parseFloat(Math.max(0.5, validHeight - validLeg).toFixed(2));
  const flexWidth = validWidth;
  const singleSideFlexArea = parseFloat((flexWidth * flexHeight).toFixed(2));
  const sidesMultiplier = isDoubleSided ? 2 : 1;
  const totalFlexArea = parseFloat((singleSideFlexArea * sidesMultiplier).toFixed(2));

  // Running feet calculation: A-frame has 2 rectangular faces (Front + Back)
  // Perimeter of 1 face = 2H + 2W. For 2 faces = (2H + 2W) * 2 = 4H + 4W
  const autoRunningFt = parseFloat((validHeight * 4 + validWidth * 4).toFixed(2));
  const actualRunningFt = manualRunningFt !== "" && !isNaN(parseFloat(manualRunningFt))
    ? Math.max(1, parseFloat(manualRunningFt))
    : autoRunningFt;

  // Frame cost
  const validFrameRate = Math.max(0, parseFloat(customFrameRate) || 0);
  const frameCostTotal = Math.round(actualRunningFt * validFrameRate);

  // Flex cost
  const validFlexRate = Math.max(0, parseFloat(customFlexRate) || 0);
  const singleSideFlexCost = Math.round(singleSideFlexArea * validFlexRate);
  const flexCostTotal = Math.round(singleSideFlexCost * sidesMultiplier);

  // Top Apex Hinges cost
  const validHingesCount = Math.max(0, parseInt(hingesCount) || 0);
  const validHingeRate = Math.max(0, parseFloat(customHingeRate) || 0);
  const hingesCostTotal = Math.round(validHingesCount * validHingeRate);

  // Unit subtotal (Frame + Flex + Hinges)
  const unitTotal = frameCostTotal + flexCostTotal + hingesCostTotal;
  const grossSubtotal = Math.round(unitTotal * quantity);
  const validDiscount = Math.max(0, Math.min(grossSubtotal, parseFloat(discount) || 0));
  const netAmountPayable = Math.max(0, grossSubtotal - validDiscount);

  // Active configs
  const activeFrameConfig = FRAME_OPTIONS[frameType] || FRAME_OPTIONS["iron-3kg"];
  const activeMedia = MEDIA_CATALOG[selectedMediaId] || MEDIA_CATALOG["star-flex"];

  // Handle Preset selection
  const handlePresetSelect = (preset) => {
    setStandeeWidth(preset.width);
    setStandeeHeight(preset.height);
    setManualRunningFt(""); // reset to auto-calculated for new dimensions
  };

  // Handle Frame Change
  const handleFrameChange = (type) => {
    setFrameType(type);
    const config = FRAME_OPTIONS[type] || FRAME_OPTIONS["iron-3kg"];
    setCustomFrameRate(config.defaultRate);

    // If switching to Iron, enforce Star Flex only
    if (type === "iron-3kg" || type === "iron-5kg") {
      setSelectedMediaId("star-flex");
      setCustomFlexRate(25);
    }
  };

  // Handle Media Change
  const handleMediaChange = (mediaId) => {
    setSelectedMediaId(mediaId);
    const mediaObj = MEDIA_CATALOG[mediaId];
    if (mediaObj) {
      setCustomFlexRate(mediaObj.defaultRate);
    }
  };

  // Add to Quote
  const handleAddToQuote = () => {
    const quoteItem = {
      productId: product?.id || "STD-003",
      code: product?.code || "STD-003",
      name: `Standee Hut A-Frame (${validWidth}×${validHeight} Ft, ${activeFrameConfig.name})`,
      categoryId: "flex-board",
      subCategory: "STANDIE",
      unitPrice: unitTotal,
      quantity: quantity,
      subtotal: grossSubtotal,
      discount: validDiscount,
      total: netAmountPayable,
      specifications: {
        "Total Hut Size": `${validWidth} ft (W) × ${validHeight} ft (H)`,
        "Flex Banner Display Size": `${flexWidth} ft (W) × ${flexHeight} ft (H) (${singleSideFlexArea} sq.ft. ${isDoubleSided ? "Both Sides × 2" : "Single Side"})`,
        "Ground Leg Clearance": `${validLeg} ft (6 Inches)`,
        "Hut Frame Structure": `${activeFrameConfig.name} (${actualRunningFt} Running Ft @ ₹${validFrameRate}/ft = ₹${frameCostTotal})`,
        "Top Apex Hinges": `${validHingesCount} Pcs @ ₹${validHingeRate}/pc = ₹${hingesCostTotal}`,
        "Flex Printing Substrate": `${activeMedia.name} (${totalFlexArea} sq.ft. @ ₹${validFlexRate}/sqft = ₹${flexCostTotal})`,
        "Display Geometry": "Double-sided A-Frame Tent / Hut with top hinge connection",
      },
    };

    addToQuote(quoteItem);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      generateStandieHutQuotationPdf({
        standeeWidth: validWidth,
        standeeHeight: validHeight,
        legClearance: validLeg,
        flexWidth,
        flexHeight,
        singleSideFlexArea,
        totalFlexArea,
        isDoubleSided,
        frameType,
        frameName: activeFrameConfig.name,
        runningFt: actualRunningFt,
        frameRate: validFrameRate,
        frameCost: frameCostTotal,
        hingesCount: validHingesCount,
        hingeRate: validHingeRate,
        hingesCost: hingesCostTotal,
        mediaId: selectedMediaId,
        mediaName: activeMedia.name,
        flexRate: validFlexRate,
        flexCost: flexCostTotal,
        unitPrice: unitTotal,
        quantity,
        grossSubtotal,
        validDiscount,
        totalAmount: netAmountPayable,
        clientInfo: {
          clientName: clientName.trim(),
          phone: clientPhone.trim(),
        },
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left Column: Configurator Controls */}
      <div className="xl:col-span-7 space-y-6">
        {/* Header Title Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold uppercase tracking-wider font-mono">
                Code: #{product?.code || "STD-003"}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold">
                SUBCATEGORY: STANDIE
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Heavy-Duty Fabricated / Ready in 24h
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Standee Hut (A-Frame Tent Standee)
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Free-standing A-frame double-sided tent standee with sturdy apex hinges. Available with <strong>Iron Frame (3 kg / 5 kg)</strong> using <strong>Star Flex @ ₹25/sqft</strong> or <strong>Wooden Frame</strong> using <strong>Normal Flex @ ₹15/sqft</strong> or <strong>Star Flex @ ₹25/sqft</strong>. Includes 0.5 ft ground legs and fully editable rates.
          </p>
        </div>

        {/* STEP 1: DIMENSIONS & STANDARD SIZE PRESETS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Hut Size &amp; Dimensions
              </h2>
            </div>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Standard Sizes &amp; Custom Dimensions
            </span>
          </div>

          {/* Fixed Size Quick Presets */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Select Standard Hut Size Presets:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {FIXED_SIZE_PRESETS.map((preset) => {
                const isSelected =
                  validWidth === preset.width && validHeight === preset.height;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? "border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="text-sm font-black text-slate-900 block font-mono">
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                      Flex: {preset.width}×{(preset.height - 0.5).toFixed(1)}'
                    </span>
                    <span className="inline-block mt-1.5 text-[8.5px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Width & Height Inputs */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Width (in Feet):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={standeeWidth}
                  onChange={(e) => {
                    setStandeeWidth(e.target.value);
                    setManualRunningFt("");
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-black text-slate-900 font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  Ft
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Total Height (in Feet):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1.5"
                  max="12"
                  value={standeeHeight}
                  onChange={(e) => {
                    setStandeeHeight(e.target.value);
                    setManualRunningFt("");
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-black text-slate-900 font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  Ft
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Leg Clearance (from bottom):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={legClearance}
                  onChange={(e) => setLegClearance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-black text-slate-900 font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  Ft (6")
                </span>
              </div>
            </div>
          </div>

          {/* Computed Flex Display Size Banner */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <FiMaximize2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-slate-700 font-medium">Inside Flex Size:</span>
              <span className="font-extrabold text-slate-900 font-mono">
                {flexWidth} ft (W) × {flexHeight} ft (H) = {singleSideFlexArea} Sq.Ft. per side
              </span>
            </div>
            <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
              Total Height ({validHeight}') - Legs ({validLeg}') = {flexHeight} Ft
            </span>
          </div>
        </div>

        {/* STEP 2: FRAME STRUCTURE (IRON 3KG / 5KG OR WOODEN) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Select Frame Material &amp; Weight
              </h2>
            </div>
            <span className="text-xs font-black text-amber-700">
              ₹{frameCostTotal.toLocaleString()}
            </span>
          </div>

          {/* 3 Frame Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(FRAME_OPTIONS).map((opt) => {
              const isSelected = frameType === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleFrameChange(opt.id)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {opt.weightLabel}
                      </span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                          <FiCheck className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 mt-2">
                      {opt.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold">Default Rate:</span>
                    <span className="text-xs font-black text-amber-700 font-mono">
                      ₹{opt.defaultRate} / Ru.Ft
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running Feet & Frame Rate Customizable Inputs */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Total Running Feet (2 Faces):
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Auto: {autoRunningFt} ft
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={actualRunningFt}
                  onChange={(e) => setManualRunningFt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 bg-white font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  Ru.Ft
                </span>
              </div>
              <span className="text-[9.5px] text-slate-500 block mt-1">
                Formula: 2 Faces × (2×{validHeight} + 2×{validWidth}) = {autoRunningFt} ft
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Editable Rate per Running Foot:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={customFrameRate}
                  onChange={(e) => setCustomFrameRate(e.target.value)}
                  className="w-full pl-6 pr-12 py-2 rounded-lg border border-slate-300 text-xs font-black text-slate-900 bg-white font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <span className="absolute right-3 top-2 text-[10px] font-bold text-slate-400">
                  / Ru.Ft
                </span>
              </div>
              <span className="text-[9.5px] text-slate-500 block mt-1">
                Cost: {actualRunningFt} ft × ₹{validFrameRate} = <strong>₹{frameCostTotal}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* STEP 3: FLEX BANNER PRINTING MEDIA & RATE */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Flex Banner Printing &amp; Media Rate
              </h2>
            </div>
            <span className="text-xs font-black text-amber-700">
              ₹{flexCostTotal.toLocaleString()}
            </span>
          </div>

          {/* Sides Toggle (Double-Sided Tent vs Single-Sided) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setIsDoubleSided(true)}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isDoubleSided
                  ? "bg-white text-amber-800 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>★ Double-Sided Tent Display</span>
              <span className="text-[10px] opacity-90 font-mono">(Both Sides × 2)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDoubleSided(false)}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                !isDoubleSided
                  ? "bg-white text-amber-800 shadow-sm border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Single-Sided Banner</span>
              <span className="text-[10px] opacity-90 font-mono">(Front Only × 1)</span>
            </button>
          </div>

          {/* Media Selection (Conditional per Frame Material) */}
          {frameType === "wooden" ? (
            /* Wooden Frame allows Normal Flex (@ ₹15) and Star Flex (@ ₹25) */
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                Select Flex Substrate for Wooden Frame:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["normal-flex", "star-flex"].map((mId) => {
                  const media = MEDIA_CATALOG[mId];
                  const isSelected = selectedMediaId === mId;
                  return (
                    <div
                      key={mId}
                      onClick={() => handleMediaChange(mId)}
                      className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">
                            {media.name}
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {media.tag}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-1">
                          {media.description}
                        </p>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Default:</span>
                        <span className="font-extrabold text-amber-700 font-mono">
                          ₹{media.defaultRate} / sqft
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Iron Frames (3kg & 5kg) strictly use Star Flex @ ₹25 */
            <div className="p-4 rounded-xl border-2 border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      Star Flex - High Gloss Finish
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      Iron Frame Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Iron frame standees exclusively use anti-curl glossy Star Flex for superior rigidity and color vibrancy.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-800 font-mono block">
                    Default ₹25 / sqft
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Direct Editable Flex Price per sq ft Input */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                Change Flex Media Rate:
              </span>
              <span className="text-[10px] text-slate-500">
                Current selection: {activeMedia.name} (applies per sq.ft.)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Rate:</span>
              <div className="relative w-32">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  value={customFlexRate}
                  onChange={(e) => setCustomFlexRate(e.target.value)}
                  className="w-full pl-6 pr-10 py-1.5 text-xs font-black bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
                <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">
                  /sqft
                </span>
              </div>
            </div>
          </div>

          {/* Flex Calculation Breakdown Display */}
          <div className="text-right text-[11px] text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200">
            Flex Area: {flexWidth} × {flexHeight} = {singleSideFlexArea} sq.ft.
            <br />
            {isDoubleSided ? (
              <>
                = {singleSideFlexArea} sq.ft. × ₹{validFlexRate} = ₹{singleSideFlexCost}
                <br />
                = 2 Sides × ₹{singleSideFlexCost} ={" "}
                <strong className="text-slate-900">₹{flexCostTotal}</strong>
              </>
            ) : (
              <>
                = 1 Side × {singleSideFlexArea} sq.ft. × ₹{validFlexRate} ={" "}
                <strong className="text-slate-900">₹{flexCostTotal}</strong>
              </>
            )}
          </div>
        </div>

        {/* STEP 4: TOP APEX HINGES HARDWARE (DEFAULT 2 HINGES @ ₹15 EACH, OPTION TO ADD MORE & CHANGE PRICE) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                4
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Top Apex Hinges Hardware
              </h2>
            </div>
            <span className="text-xs font-black text-amber-700 font-mono">
              ₹{hingesCostTotal.toLocaleString()}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Standard Standee Hut uses <strong>2 apex hinges</strong> to securely fasten the front and rear folding frames together. You can add more hinges for larger widths or heavier setups, and adjust the price per hinge.
          </p>

          {/* Quick Hinge Count Selector Chips */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Number of Hinges:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { count: 2, label: "2 Hinges", tag: "Standard" },
                { count: 3, label: "3 Hinges", tag: "Medium" },
                { count: 4, label: "4 Hinges", tag: "Heavy / Wide" },
                { count: 6, label: "6 Hinges", tag: "Extra Heavy" },
              ].map((item) => {
                const isSelected = validHingesCount === item.count;
                return (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setHingesCount(item.count)}
                    className={`py-2 px-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 font-bold"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>{item.label}</span>
                      {isSelected && <FiCheck className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Quantity Counter & Price Per Hinge Editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Hinges Quantity (Add / Adjust):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHingesCount((prev) => Math.max(1, (parseInt(prev) || 2) - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition-colors"
                  title="Remove 1 Hinge"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={hingesCount}
                  onChange={(e) => setHingesCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center py-2 rounded-xl border border-slate-300 font-black text-slate-900 font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                />
                <button
                  type="button"
                  onClick={() => setHingesCount((prev) => (parseInt(prev) || 0) + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition-colors"
                  title="Add 1 Hinge"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Price per Hinge (Editable):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={customHingeRate}
                  onChange={(e) => setCustomHingeRate(e.target.value)}
                  className="w-full pl-7 pr-12 py-2 rounded-xl border border-slate-300 text-sm font-black text-slate-900 font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="15"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  /pc
                </span>
              </div>
            </div>
          </div>

          {/* Hinges Cost Summary Banner */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-medium">
              {validHingesCount} Hinges × ₹{validHingeRate} per piece:
            </span>
            <span className="font-extrabold text-amber-900 font-mono text-sm">
              = ₹{hingesCostTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* STEP 5: QUANTITY, DISCOUNT & CLIENT DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
              5
            </span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Quantity, Discount &amp; PDF Quotation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Order Quantity:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full text-center py-2 rounded-xl border border-slate-300 font-black text-slate-900 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Special Discount (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full pl-6 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-black text-slate-900 font-mono outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Client Details for PDF */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Client / Company Name:
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Walk-in Client / Company"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Client Phone Number:
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons: Add to Quote Cart & Download PDF */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddToQuote}
              className={`py-3.5 px-6 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                addedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white active:scale-[0.99]"
              }`}
            >
              {addedSuccess ? (
                <>
                  <FiCheckCircle className="w-5 h-5 animate-bounce" />
                  <span>Added to Quotation Cart!</span>
                </>
              ) : (
                <>
                  <FiShoppingBag className="w-5 h-5" />
                  <span>Add to Quote Cart (₹{netAmountPayable.toLocaleString()})</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="py-3.5 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <FiDownload className="w-4 h-4" />
              <span>{isGeneratingPdf ? "Generating PDF..." : "Download PDF Quotation"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Sticky Live Visualizer & Price Summary */}
      <div className="xl:col-span-5 sticky top-6 space-y-6">
        <StandieHutPreview
          totalWidth={validWidth}
          totalHeight={validHeight}
          legClearance={validLeg}
          frameType={frameType}
          mediaType={selectedMediaId}
          flexRate={validFlexRate}
          frameRate={validFrameRate}
          runningFt={actualRunningFt}
          hingesCount={validHingesCount}
          hingeRate={validHingeRate}
          isDoubleSided={isDoubleSided}
          unitTotal={unitTotal}
        />

        {/* Live Calculation Bill Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>Price Breakdown</span>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold">
              #{product?.code || "STD-003"}
            </span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Frame: {activeFrameConfig.name} ({actualRunningFt} ft × ₹{validFrameRate}):
              </span>
              <span className="font-bold text-slate-900 font-mono">
                ₹{frameCostTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Flex: {activeMedia.name} ({totalFlexArea} sqft × ₹{validFlexRate}):
              </span>
              <span className="font-bold text-slate-900 font-mono">
                ₹{flexCostTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                Top Apex Hinges: {validHingesCount} pcs × ₹{validHingeRate}:
              </span>
              <span className="font-bold text-amber-800 font-mono">
                ₹{hingesCostTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold">
              <span className="text-slate-800">Unit Total:</span>
              <span className="text-slate-900 font-mono">
                ₹{unitTotal.toLocaleString()}
              </span>
            </div>

            {quantity > 1 && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Quantity Multiplier ({quantity} units):</span>
                <span className="font-mono">₹{grossSubtotal.toLocaleString()}</span>
              </div>
            )}

            {validDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Special Discount:</span>
                <span className="font-mono">-₹{validDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-black text-slate-900">Total Amount:</span>
              <span className="text-xl font-black text-amber-600 font-mono">
                ₹{netAmountPayable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
