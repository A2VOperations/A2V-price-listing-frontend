import React, { useState, useMemo } from "react";
import {
  FiGrid,
  FiMaximize,
  FiPlusCircle,
  FiCheck,
  FiInfo,
  FiSliders,
  FiPackage,
  FiLayers,
  FiCheckCircle,
  FiHelpCircle,
  FiRotateCw,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import StickerSheetPreview from "./StickerSheetPreview";

const SHEET_SIZES = [
  {
    id: "12x18",
    name: '12" × 18" Sheet',
    width: 18,
    height: 12,
    shortName: '12"×18"',
    desc: "Standard Digital Sheet (Printable ~11.5\" × 17.5\")",
  },
  {
    id: "13x19",
    name: '13" × 19" Sheet',
    width: 19,
    height: 13,
    shortName: '13"×19"',
    desc: "Large Digital Sheet (Printable ~12.5\" × 18.5\")",
  },
];

const PRESET_SIZES = [
  { label: '2" × 2"', w: 2, h: 2, popular: true },
  { label: '2.5" × 2.5"', w: 2.5, h: 2.5 },
  { label: '3" × 3"', w: 3, h: 3, popular: true },
  { label: '2" × 3"', w: 3, h: 2 },
  { label: '1.5" × 1.5"', w: 1.5, h: 1.5 },
  { label: '3" × 4"', w: 4, h: 3 },
  { label: '4" × 6"', w: 6, h: 4 },
];

const STICKER_MATERIALS = [
  {
    id: "chromo",
    name: "Chromo / Mirror Coat (Paper)",
    ratePerSheet: 35,
    desc: "Cost-effective, smooth glossy paper base, great for product packaging & boxes.",
  },
  {
    id: "vinyl-gloss",
    name: "Vinyl White Gloss (Waterproof)",
    ratePerSheet: 55,
    desc: "Tear-proof, weather & water resistant, vibrant gloss finish.",
  },
  {
    id: "vinyl-matte",
    name: "Vinyl White Matte (Waterproof)",
    ratePerSheet: 55,
    desc: "Premium non-reflective matte finish, water & scratch resistant.",
  },
  {
    id: "transparent",
    name: "Transparent / Clear Vinyl",
    ratePerSheet: 65,
    desc: "See-through clear adhesive background for bottles & jars.",
  },
  {
    id: "kraft",
    name: "Kraft Brown Paper Sticker",
    ratePerSheet: 45,
    desc: "Rustic eco-friendly organic vintage look.",
  },
];

const CUT_TYPES = [
  { id: "kiss-cut", name: "Half Cut / Kiss Cut (Sheet Form)", extraPerSheet: 10 },
  { id: "straight-cut", name: "Straight Guillotine Cut", extraPerSheet: 5 },
  { id: "die-cut", name: "Full Die Cut (Individual Pieces)", extraPerSheet: 15 },
  { id: "no-cut", name: "Without Cut (Full Sheet Print)", extraPerSheet: 0 },
];

const LAMINATIONS = [
  { id: "none", name: "No Lamination", price: 0 },
  { id: "gloss", name: "Gloss Lamination (+₹10/sheet)", price: 10 },
  { id: "matte", name: "Matte Lamination (+₹10/sheet)", price: 10 },
  { id: "velvet", name: "Velvet Soft-Touch (+₹18/sheet)", price: 18 },
];

export default function StickerCalculator({ product }) {
  const { addToQuote } = useQuote();

  // 1. Sheet Size State (12*18 or 13*19)
  const [selectedSheetId, setSelectedSheetId] = useState("12x18");
  const [orientation, setOrientation] = useState("landscape"); // 'landscape' | 'portrait'

  // 2. Sticker Dimensions (User sets only 1 sticker size)
  const [stickerWidth, setStickerWidth] = useState(2);
  const [stickerHeight, setStickerHeight] = useState(2);
  const [shape, setShape] = useState("rectangle"); // 'rectangle' | 'round' | 'rounded' | 'oval'

  // 3. Bleed Area & Margins (Preset standard defaults, easily customizable)
  const [sideMargin, setSideMargin] = useState(0.25); // default 0.25"
  const [gap, setGap] = useState(0.125); // default 0.125" (approx 3mm)
  const [showAdvancedMargins, setShowAdvancedMargins] = useState(false);

  // 4. Quantity & Cost Calculation
  const [calcMode, setCalcMode] = useState("stickers"); // 'stickers' | 'sheets'
  const [targetStickerCount, setTargetStickerCount] = useState(1000);
  const [targetSheetCount, setTargetSheetCount] = useState(25);

  // Material & Finishes
  const [selectedMaterialId, setSelectedMaterialId] = useState("chromo");
  const [selectedCutId, setSelectedCutId] = useState("kiss-cut");
  const [selectedLaminationId, setSelectedLaminationId] = useState("none");

  const [addedSuccess, setAddedSuccess] = useState(false);

  // Get active sheet dimensions
  const activeSheetDef = SHEET_SIZES.find((s) => s.id === selectedSheetId) || SHEET_SIZES[0];
  const sheetWidth = orientation === "landscape" ? activeSheetDef.width : activeSheetDef.height;
  const sheetHeight = orientation === "landscape" ? activeSheetDef.height : activeSheetDef.width;

  // Compute stickers per sheet in current orientation
  const currentYield = useMemo(() => {
    const sW = Number(sheetWidth) || 18;
    const sH = Number(sheetHeight) || 12;
    const stW = Math.max(0.1, Number(stickerWidth) || 2);
    const stH = Math.max(0.1, Number(stickerHeight) || 2);
    const m = Math.max(0, Number(sideMargin) || 0);
    const g = Math.max(0, Number(gap) || 0);

    const printableW = Math.max(0, sW - 2 * m);
    const printableH = Math.max(0, sH - 2 * m);

    const cols = Math.max(0, Math.floor((printableW + g) / (stW + g)));
    const rows = Math.max(0, Math.floor((printableH + g) / (stH + g)));
    const total = cols * rows;

    return { cols, rows, total, printableW, printableH };
  }, [sheetWidth, sheetHeight, stickerWidth, stickerHeight, sideMargin, gap]);

  // Compare orientations to show helpful recommendation
  const bestFitInfo = useMemo(() => {
    const stW = Math.max(0.1, Number(stickerWidth) || 2);
    const stH = Math.max(0.1, Number(stickerHeight) || 2);
    const m = Math.max(0, Number(sideMargin) || 0);
    const g = Math.max(0, Number(gap) || 0);

    // Option A: Landscape
    const lW = activeSheetDef.width;
    const lH = activeSheetDef.height;
    const lCols = Math.max(0, Math.floor((lW - 2 * m + g) / (stW + g)));
    const lRows = Math.max(0, Math.floor((lH - 2 * m + g) / (stH + g)));
    const lTotal = lCols * lRows;

    // Option B: Portrait
    const pW = activeSheetDef.height;
    const pH = activeSheetDef.width;
    const pCols = Math.max(0, Math.floor((pW - 2 * m + g) / (stW + g)));
    const pRows = Math.max(0, Math.floor((pH - 2 * m + g) / (stH + g)));
    const pTotal = pCols * pRows;

    return {
      landscapeTotal: lTotal,
      portraitTotal: pTotal,
      bestOrientation: lTotal >= pTotal ? "landscape" : "portrait",
      maxYield: Math.max(lTotal, pTotal),
    };
  }, [activeSheetDef, stickerWidth, stickerHeight, sideMargin, gap]);

  // Total calculation for orders
  const calculation = useMemo(() => {
    const stickersPerSheet = Math.max(1, currentYield.total);
    let sheetsNeeded = 0;
    let actualStickers = 0;

    if (calcMode === "stickers") {
      const target = Math.max(1, Number(targetStickerCount) || 1);
      sheetsNeeded = Math.ceil(target / stickersPerSheet);
      actualStickers = sheetsNeeded * stickersPerSheet;
    } else {
      sheetsNeeded = Math.max(1, Number(targetSheetCount) || 1);
      actualStickers = sheetsNeeded * stickersPerSheet;
    }

    const material = STICKER_MATERIALS.find((m) => m.id === selectedMaterialId) || STICKER_MATERIALS[0];
    const cut = CUT_TYPES.find((c) => c.id === selectedCutId) || CUT_TYPES[0];
    const lam = LAMINATIONS.find((l) => l.id === selectedLaminationId) || LAMINATIONS[0];

    // Sheet rate calculation
    let costPerSheet = material.ratePerSheet + cut.extraPerSheet + lam.price;
    if (selectedSheetId === "13x19") {
      costPerSheet += 8; // Slight bump for larger sheet size
    }

    // Tier discount on volume sheets
    let discountPct = 0;
    if (sheetsNeeded >= 100) discountPct = 0.20;
    else if (sheetsNeeded >= 50) discountPct = 0.15;
    else if (sheetsNeeded >= 25) discountPct = 0.10;
    else if (sheetsNeeded >= 10) discountPct = 0.05;

    const baseTotal = sheetsNeeded * costPerSheet;
    const discountAmount = Math.round(baseTotal * discountPct);
    const totalAmount = Math.round(baseTotal - discountAmount);
    const pricePerSticker = actualStickers > 0 ? (totalAmount / actualStickers).toFixed(2) : 0;
    const effectiveSheetCost = sheetsNeeded > 0 ? (totalAmount / sheetsNeeded).toFixed(2) : 0;

    return {
      sheetsNeeded,
      actualStickers,
      stickersPerSheet,
      costPerSheet,
      discountPct,
      discountAmount,
      totalAmount,
      pricePerSticker,
      effectiveSheetCost,
      material,
      cut,
      lam,
    };
  }, [
    currentYield,
    calcMode,
    targetStickerCount,
    targetSheetCount,
    selectedMaterialId,
    selectedCutId,
    selectedLaminationId,
    selectedSheetId,
  ]);

  // Handle Preset Size Selection
  const handleSelectPreset = (p) => {
    setStickerWidth(p.w);
    setStickerHeight(p.h);
  };

  // Stepper handlers
  const handleStepWidth = (delta) => {
    setStickerWidth((prev) => {
      const current = parseFloat(prev) || 0.5;
      return Math.max(0.5, Math.min(18, parseFloat((current + delta).toFixed(2))));
    });
  };

  const handleStepHeight = (delta) => {
    setStickerHeight((prev) => {
      const current = parseFloat(prev) || 0.5;
      return Math.max(0.5, Math.min(18, parseFloat((current + delta).toFixed(2))));
    });
  };

  const handleStepMargin = (delta) => {
    setSideMargin((prev) => {
      const current = parseFloat(prev) || 0;
      return Math.max(0, Math.min(1, parseFloat((current + delta).toFixed(3))));
    });
  };

  const handleStepGap = (delta) => {
    setGap((prev) => {
      const current = parseFloat(prev) || 0;
      return Math.max(0, Math.min(1, parseFloat((current + delta).toFixed(3))));
    });
  };

  const handleStepStickerCount = (delta) => {
    setTargetStickerCount((prev) => {
      const current = parseInt(prev, 10) || 50;
      return Math.max(50, current + delta);
    });
  };

  const handleStepSheetCount = (delta) => {
    setTargetSheetCount((prev) => {
      const current = parseInt(prev, 10) || 1;
      return Math.max(1, current + delta);
    });
  };

  // Add to Quote
  const handleAddToQuote = () => {
    const customProduct = {
      id: product?.id || `sticker-custom-${Date.now()}`,
      code: product?.code || "STK-CALC",
      name: `Custom Sticker (${stickerWidth}" × ${stickerHeight}" ${shape.toUpperCase()})`,
      slug: product?.slug || "custom-sticker-calculator",
      unitName: "Stickers",
      image: product?.image || "/src/assets/images/categories (9).webp",
    };

    const selectedOpts = {
      "Sticker Size": `${stickerWidth}" × ${stickerHeight}"`,
      "Sheet Size": `${activeSheetDef.name} (${orientation})`,
      "Shape": shape.toUpperCase(),
      "Stickers per Sheet": `${currentYield.total} pcs (${currentYield.cols} cols × ${currentYield.rows} rows)`,
      "Total Sheets": `${calculation.sheetsNeeded} Sheets`,
      "Material": calculation.material.name,
      "Cutting Type": calculation.cut.name,
      "Lamination": calculation.lam.name,
      "Bleed Gap": `${gap}"`,
      "Side Margin": `${sideMargin}"`,
      "Cost Per Sticker": `₹${calculation.pricePerSticker}`,
    };

    const calcData = {
      baseAmount: calculation.totalAmount,
      totalAmount: calculation.totalAmount,
      quantity: calculation.actualStickers,
      unitPrice: Number(calculation.pricePerSticker),
      optionsAdjustments: [],
      gstRate: 0,
      gstAmount: 0,
    };

    addToQuote(customProduct, selectedOpts, calculation.actualStickers, calcData);

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-orange-100 border border-white/20">
              <FiGrid className="w-3.5 h-3.5" /> Interactive Sticker Layout & Sheet Calculator
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Sticker Sheet Optimizer (12×18 &amp; 13×19)
            </h2>
            <p className="text-xs text-orange-100/80 max-w-2xl">
              Enter the size of your single sticker to automatically generate the optimal sheet layout, bleed boundaries, total stickers per sheet, and instant pricing.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 flex items-center gap-4 text-center">
            <div>
              <span className="text-[11px] text-orange-200 block">Stickers / Sheet</span>
              <span className="text-2xl font-black text-emerald-300">
                {currentYield.total} <span className="text-xs font-normal text-white">pcs</span>
              </span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <span className="text-[11px] text-orange-200 block">Grid Layout</span>
              <span className="text-base font-bold text-white">
                {currentYield.cols} × {currentYield.rows}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Live Sheet Diagram on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Easy Inputs for 1 Sticker Size & Options */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Sheet Size & 1 Sticker Size */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">
                  1
                </span>
                Select Sheet Size &amp; Sticker Dimensions
              </h3>
            </div>

            {/* Sheet Size Selection (Only 12*18 and 13*19) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Standard Sheet Size (Choose 12×18 or 13×19):
              </label>
              <div className="grid grid-cols-2 gap-3">
                {SHEET_SIZES.map((sheet) => {
                  const isSelected = selectedSheetId === sheet.id;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => setSelectedSheetId(sheet.id)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all relative ${
                        isSelected
                          ? "border-orange-600 bg-orange-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-base font-black ${isSelected ? "text-orange-950" : "text-slate-800"}`}>
                          {sheet.shortName}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                            <FiCheck />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-tight">{sheet.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orientation Switch */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Sheet Orientation:</span>
                <span className="text-[11px] text-slate-500">
                  ({sheetWidth}" Width × {sheetHeight}" Height)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setOrientation("landscape")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    orientation === "landscape"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Landscape ({activeSheetDef.width}×{activeSheetDef.height}")
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation("portrait")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    orientation === "portrait"
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Portrait ({activeSheetDef.height}×{activeSheetDef.width}")
                </button>
              </div>
            </div>

            {/* Sticker Size Inputs (Width & Height) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Set 1 Sticker Size (in Inches):
                </label>
                <span className="text-[11px] text-slate-500">Width × Height</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">Width</span>
                    <span className="text-[10px] text-slate-400 font-medium">Inches</span>
                  </div>
                  <div className="flex items-center bg-slate-50 border-2 border-slate-300 rounded-xl overflow-hidden focus-within:border-orange-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <button
                      type="button"
                      onClick={() => handleStepWidth(-0.25)}
                      disabled={stickerWidth <= 0.5}
                      className="p-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Decrease width by 0.25 inch"
                      aria-label="Decrease width"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="18"
                      value={stickerWidth}
                      onChange={(e) => setStickerWidth(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      onBlur={() => {
                        if (!stickerWidth || stickerWidth < 0.5) setStickerWidth(0.5);
                        else if (stickerWidth > 18) setStickerWidth(18);
                      }}
                      className="w-full text-center text-sm font-bold text-slate-900 bg-transparent py-2.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="2"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepWidth(0.25)}
                      disabled={stickerWidth >= 18}
                      className="p-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Increase width by 0.25 inch"
                      aria-label="Increase width"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-600">Height</span>
                    <span className="text-[10px] text-slate-400 font-medium">Inches</span>
                  </div>
                  <div className="flex items-center bg-slate-50 border-2 border-slate-300 rounded-xl overflow-hidden focus-within:border-orange-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <button
                      type="button"
                      onClick={() => handleStepHeight(-0.25)}
                      disabled={stickerHeight <= 0.5}
                      className="p-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Decrease height by 0.25 inch"
                      aria-label="Decrease height"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="18"
                      value={stickerHeight}
                      onChange={(e) => setStickerHeight(e.target.value === "" ? "" : parseFloat(e.target.value))}
                      onBlur={() => {
                        if (!stickerHeight || stickerHeight < 0.5) setStickerHeight(0.5);
                        else if (stickerHeight > 18) setStickerHeight(18);
                      }}
                      className="w-full text-center text-sm font-bold text-slate-900 bg-transparent py-2.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="2"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepHeight(0.25)}
                      disabled={stickerHeight >= 18}
                      className="p-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Increase height by 0.25 inch"
                      aria-label="Increase height"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 block">Popular Sizes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SIZES.map((preset, idx) => {
                    const isSelected = stickerWidth === preset.w && stickerHeight === preset.h;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                          isSelected
                            ? "bg-orange-600 text-white shadow-xs font-bold"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sticker Shape */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700 block">Sticker Cut Shape:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "rectangle", label: "Square / Rect" },
                  { id: "round", label: "Circle / Round" },
                  { id: "rounded", label: "Round Corner" },
                  { id: "oval", label: "Oval" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShape(s.id)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                      shape === s.id
                        ? "border-orange-600 bg-orange-50 text-orange-900"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Bleed & Margins Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAdvancedMargins(!showAdvancedMargins)}
                className="text-xs text-orange-600 hover:text-orange-800 font-bold flex items-center justify-between w-full"
              >
                <span className="flex items-center gap-1.5">
                  <FiSliders className="w-3.5 h-3.5" /> Bleed &amp; Margin Settings (Gaps)
                </span>
                <span className="text-[11px] text-slate-400 underline">
                  {showAdvancedMargins ? "Hide Settings" : "Customize Bleed / Gap"}
                </span>
              </button>

              {showAdvancedMargins && (
                <div className="mt-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-700">
                        Side Margin / Gripper (Inch)
                      </span>
                      <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-orange-500">
                        <button
                          type="button"
                          onClick={() => handleStepMargin(-0.05)}
                          disabled={sideMargin <= 0}
                          className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Decrease margin"
                        >
                          <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          max="1"
                          value={sideMargin}
                          onChange={(e) => setSideMargin(parseFloat(e.target.value) || 0)}
                          className="w-full text-center text-xs font-semibold py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepMargin(0.05)}
                          disabled={sideMargin >= 1}
                          className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Increase margin"
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Default: 0.25" (~6mm)</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-700">
                        Gap between Stickers (Inch)
                      </span>
                      <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-orange-500">
                        <button
                          type="button"
                          onClick={() => handleStepGap(-0.025)}
                          disabled={gap <= 0}
                          className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Decrease gap"
                        >
                          <FiMinus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          step="0.025"
                          min="0"
                          max="1"
                          value={gap}
                          onChange={(e) => setGap(parseFloat(e.target.value) || 0)}
                          className="w-full text-center text-xs font-semibold py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepGap(0.025)}
                          disabled={gap >= 1}
                          className="px-2 py-1.5 text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                          title="Increase gap"
                        >
                          <FiPlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Default: 0.125" (~3mm)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Materials, Finishes & Quantity Pricing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs">
                  2
                </span>
                Material, Cutting &amp; Quantity
              </h3>
            </div>

            {/* Material Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Sticker Material:</label>
              <div className="space-y-2">
                {STICKER_MATERIALS.map((mat) => {
                  const isSelected = selectedMaterialId === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setSelectedMaterialId(mat.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-orange-600 bg-orange-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                      }`}
                    >
                      <div>
                        <span className={`text-xs font-bold block ${isSelected ? "text-orange-950" : "text-slate-800"}`}>
                          {mat.name}
                        </span>
                        <span className="text-[11px] text-slate-500 leading-tight block">
                          {mat.desc}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-orange-700 whitespace-nowrap ml-2">
                        ₹{mat.ratePerSheet}/sheet
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cut Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Cutting Style:</label>
              <div className="grid grid-cols-2 gap-2">
                {CUT_TYPES.map((cut) => {
                  const isSelected = selectedCutId === cut.id;
                  return (
                    <button
                      key={cut.id}
                      type="button"
                      onClick={() => setSelectedCutId(cut.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-orange-600 bg-orange-50 text-orange-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs"
                      }`}
                    >
                      <span className="text-xs block leading-tight">{cut.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lamination */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Lamination Finish:</label>
              <div className="grid grid-cols-2 gap-2">
                {LAMINATIONS.map((lam) => {
                  const isSelected = selectedLaminationId === lam.id;
                  return (
                    <button
                      key={lam.id}
                      type="button"
                      onClick={() => setSelectedLaminationId(lam.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-orange-600 bg-orange-50 text-orange-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs"
                      }`}
                    >
                      <span className="text-xs block leading-tight">{lam.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Calculator (Enter Stickers OR Sheets) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Order Quantity Calculation:</span>
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCalcMode("stickers")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      calcMode === "stickers" ? "bg-white text-orange-700 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    By Sticker Qty
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMode("sheets")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                      calcMode === "sheets" ? "bg-white text-orange-700 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    By Sheet Qty
                  </button>
                </div>
              </div>

              {calcMode === "stickers" ? (
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-600">Enter Required Number of Stickers:</span>
                  <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl overflow-hidden focus-within:border-orange-600 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <button
                      type="button"
                      onClick={() => handleStepStickerCount(-100)}
                      disabled={targetStickerCount <= 50}
                      className="px-3.5 py-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Decrease by 100 stickers"
                      aria-label="Decrease stickers"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      step="100"
                      min="50"
                      value={targetStickerCount}
                      onChange={(e) => setTargetStickerCount(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      onBlur={() => {
                        if (!targetStickerCount || targetStickerCount < 50) setTargetStickerCount(50);
                      }}
                      className="w-full text-center text-base font-bold text-slate-900 bg-transparent py-2.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-semibold text-slate-400 pr-1 select-none pointer-events-none">
                      pcs
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepStickerCount(100)}
                      className="px-3.5 py-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                      title="Increase by 100 stickers"
                      aria-label="Increase stickers"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    &bull; Requires <strong>{calculation.sheetsNeeded} Sheets</strong> producing{" "}
                    <strong>{calculation.actualStickers} total stickers</strong> ({currentYield.total} / sheet).
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-600">Enter Number of Sheets to Print:</span>
                  <div className="flex items-center bg-white border-2 border-slate-300 rounded-xl overflow-hidden focus-within:border-orange-600 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <button
                      type="button"
                      onClick={() => handleStepSheetCount(-5)}
                      disabled={targetSheetCount <= 1}
                      className="px-3.5 py-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="Decrease by 5 sheets"
                      aria-label="Decrease sheets"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      value={targetSheetCount}
                      onChange={(e) => setTargetSheetCount(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                      onBlur={() => {
                        if (!targetSheetCount || targetSheetCount < 1) setTargetSheetCount(1);
                      }}
                      className="w-full text-center text-base font-bold text-slate-900 bg-transparent py-2.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-semibold text-slate-400 pr-1 select-none pointer-events-none">
                      Sheets
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepSheetCount(5)}
                      className="px-3.5 py-2.5 text-slate-600 hover:text-orange-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                      title="Increase by 5 sheets"
                      aria-label="Increase sheets"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    &bull; Yields <strong>{calculation.actualStickers} total stickers</strong> (
                    {calculation.sheetsNeeded} sheets × {currentYield.total} per sheet).
                  </p>
                </div>
              )}
            </div>

            {/* Cost Summary & Add to Quote */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-slate-400 block">Total Estimated Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                      ₹{calculation.totalAmount.toLocaleString()}
                    </span>
                    {calculation.discountAmount > 0 && (
                      <span className="text-xs line-through text-slate-500">
                        ₹{(calculation.totalAmount + calculation.discountAmount).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Rate per Sticker</span>
                  <span className="text-base font-bold text-amber-300">
                    ₹{calculation.pricePerSticker} <span className="text-xs text-slate-400 font-normal">/ pc</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  Sheets: <strong>{calculation.sheetsNeeded} ({activeSheetDef.shortName})</strong>
                </div>
                <div>
                  Total Pcs: <strong>{calculation.actualStickers} Stickers</strong>
                </div>
                <div>
                  Rate / Sheet: <strong>₹{calculation.effectiveSheetCost}</strong>
                </div>
                <div>
                  Material: <strong>{calculation.material.name.split("(")[0]}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToQuote}
                className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {addedSuccess ? (
                  <>
                    <FiCheckCircle className="w-5 h-5 text-emerald-300" />
                    <span>Added to Quote Successfully!</span>
                  </>
                ) : (
                  <>
                    <FiPlusCircle className="w-5 h-5" />
                    <span>Add {calculation.actualStickers} Stickers to Quote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Visual Sheet Diagram (Exact Visual Matching Image) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-6">
          <StickerSheetPreview
            sheetWidth={sheetWidth}
            sheetHeight={sheetHeight}
            stickerWidth={stickerWidth}
            stickerHeight={stickerHeight}
            sideMargin={sideMargin}
            gap={gap}
            shape={shape}
          />

          {/* Quick Specifications Guide */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2 text-slate-600">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <FiInfo className="text-orange-600" /> Sheet &amp; Bleed Guidelines
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-500 leading-relaxed">
              <li>
                <strong>12" × 18" Sheet:</strong> Best for standard digital press runs with ~11.5" × 17.5" safe printable area.
              </li>
              <li>
                <strong>13" × 19" Sheet:</strong> Extra large sheet size allowing higher sticker count for larger batches.
              </li>
              <li>
                <strong>Bleed Area:</strong> Standard 0.125" (3mm) inter-sticker gap ensures razor-sharp kiss cutting without overlapping graphic cuts.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
