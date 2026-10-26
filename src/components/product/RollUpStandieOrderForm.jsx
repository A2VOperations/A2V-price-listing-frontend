import React, { useState, useMemo } from "react";
import {
  FiMaximize2,
  FiSliders,
  FiShoppingBag,
  FiDownload,
  FiCheckCircle,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import RollUpStandiePreview from "./RollUpStandiePreview";
import { generateRollUpStandieQuotationPdf } from "@/lib/generateQuotationPdf";

const ROLLUP_MEDIA_TYPES = [
  {
    id: "star-flex",
    name: "Star Flex",
    defaultRate: 30,
    tag: "High Gloss",
    description: "High durability glossy flex with vivid color contrast and rich ink saturation.",
  },
];

const MACHINE_OPTIONS = {
  standard: {
    id: "standard",
    name: "Standard Aluminium Roll-Up Machine Base",
    tag: "Standard Base",
    description: "Lightweight anodized aluminium cassette with twin rotating swivel stabilizer feet, 3-section support pole, and padded shoulder carry bag.",
    defaultRates: {
      2.5: 1250,
      3: 1350,
    },
  },
  luxury: {
    id: "luxury",
    name: "Luxury Broad Base Teardrop Roll-Up Machine",
    tag: "Luxury Broad Base",
    description: "Heavy-duty teardrop wide-footprint cassette with chrome mirror endcaps, superior stability without swivel feet, and deluxe padded travel bag.",
    defaultRates: {
      2.5: 1200,
      3: 1500,
    },
  },
};

export default function RollUpStandieOrderForm({ product, onVariantSelect }) {
  const { addToQuote } = useQuote();

  // Order mode: "complete" | "machine-only" | "banner-only"
  const [orderMode, setOrderMode] = useState("complete");

  // Core Requirement: Fixed Machine & Flex Width: 2.5 ft or 3 ft
  const [fixedWidth, setFixedWidth] = useState(2.5);

  // Core Requirement: Customizable Height in Feet (default: standard 6 ft)
  const [customHeight, setCustomHeight] = useState(6);

  // Machine Hardware Configuration
  const [machineType, setMachineType] = useState("standard");
  const [customMachineRate, setCustomMachineRate] = useState(1250);

  // Flex Banner Media Configuration (Star Flex @ ₹30/sqft)
  const [selectedMediaId, setSelectedMediaId] = useState("star-flex");
  const [customFlexRate, setCustomFlexRate] = useState(30);

  // Quantity & Discount
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // Client Details for PDF Quotation
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Mode helpers
  const includeMachine = orderMode === "complete" || orderMode === "machine-only";
  const includeBanner = orderMode === "complete" || orderMode === "banner-only";

  // Calculations
  const validWidth = fixedWidth === 3 ? 3 : 2.5;
  const validHeight = Math.min(6, Math.max(1, parseFloat(customHeight) || 6));

  // Display Area in Square Feet = Fixed Width × Customizable Height
  const totalAreaSqFt = parseFloat((validWidth * validHeight).toFixed(2));

  // Machine cost
  const activeMachineConfig = MACHINE_OPTIONS[machineType] || MACHINE_OPTIONS.standard;
  const machineUnitCost = includeMachine ? Math.max(0, parseFloat(customMachineRate) || 0) : 0;

  // Flex cost
  const validFlexRate = Math.max(0, parseFloat(customFlexRate) || 0);
  const bannerUnitCost = includeBanner ? Math.round(totalAreaSqFt * validFlexRate) : 0;

  // Unit Total
  const unitTotal = machineUnitCost + bannerUnitCost;
  const grossSubtotal = Math.round(unitTotal * quantity);
  const validDiscount = Math.max(0, Math.min(grossSubtotal, parseFloat(discount) || 0));
  const netAmountPayable = Math.max(0, grossSubtotal - validDiscount);

  // Active media object
  const activeMedia =
    ROLLUP_MEDIA_TYPES.find((m) => m.id === selectedMediaId) || ROLLUP_MEDIA_TYPES[0];

  // Handle Fixed Width change (updates machine default rate)
  const handleWidthChange = (newWidth) => {
    setFixedWidth(newWidth);
    const newRate = activeMachineConfig.defaultRates[newWidth] || (newWidth === 3 ? 1350 : 1250);
    setCustomMachineRate(newRate);
  };

  // Handle Machine Type change
  const handleMachineTypeChange = (newType) => {
    setMachineType(newType);
    const config = MACHINE_OPTIONS[newType] || MACHINE_OPTIONS.standard;
    const newRate = config.defaultRates[validWidth] || 1250;
    setCustomMachineRate(newRate);
  };

  // Handle Media change
  const handleMediaChange = (media) => {
    setSelectedMediaId(media.id);
    setCustomFlexRate(media.defaultRate);
  };

  // Handle Add to Quote Cart
  const handleAddToQuote = () => {
    const quoteItem = {
      productId: product?.id || "STD-001",
      code: product?.code || "STD-001",
      name: `Roll-Up Standee (${validWidth}×${validHeight} Ft, ${
        includeMachine && includeBanner
          ? "Machine + Banner"
          : includeMachine
          ? "Hardware Machine Only"
          : "Banner Print Only"
      })`,
      categoryId: "flex-board",
      subCategory: "STANDIE",
      unitPrice: unitTotal,
      quantity: quantity,
      subtotal: grossSubtotal,
      discount: validDiscount,
      total: netAmountPayable,
      specifications: {
        "Fixed Machine Width": `${validWidth} Ft (${validWidth === 2.5 ? '30"' : '36"'})`,
        "Custom Standee Height": `${validHeight} Ft (${Math.round(validHeight * 12)}")`,
        "Total Banner Area": `${totalAreaSqFt} Sq.Ft.`,
        "Roll-Up Standee Machine": includeMachine
          ? `${activeMachineConfig.name} (${validWidth} Ft) @ ₹${machineUnitCost}`
          : "Not Included (Banner Only)",
        "Flex Printing Substrate": includeBanner
          ? `${activeMedia.name} (${totalAreaSqFt} sq.ft. @ ₹${validFlexRate}/sqft = ₹${bannerUnitCost})`
          : "Not Included (Hardware Only)",
        "Carry Bag": includeMachine ? "Complimentary Padded Shoulder Bag Included" : "N/A",
      },
    };

    addToQuote(quoteItem);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  // Handle Download PDF
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      generateRollUpStandieQuotationPdf({
        machineWidth: validWidth,
        customHeight: validHeight,
        totalAreaSqFt,
        machineType,
        machineName: activeMachineConfig.name,
        machineCost: machineUnitCost,
        includeMachine,
        includeBanner,
        mediaName: activeMedia.name,
        flexRate: validFlexRate,
        flexCost: bannerUnitCost,
        unitPrice: unitTotal,
        quantity,
        grossSubtotal,
        validDiscount,
        totalAmount: netAmountPayable,
        clientInfo: {
          clientName: clientName.trim(),
          phone: clientPhone.trim(),
        },
        productName: "Roll-Up Standee System (Hardware Machine + Custom Height Banner)",
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* Left Column: Interactive Configuration Form */}
      <div className="xl:col-span-7 space-y-6">
        {/* Product Identity Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider font-mono">
                Code: #{product?.code || "STD-001"}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
                SUBCATEGORY: STANDIE
              </span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Ready Stock / Same Day Dispatch
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Roll-Up Standee Machine & Banner System
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Professional aluminium roll-up standee with fixed width base (<strong>2.5 Ft</strong> or <strong>3 Ft</strong>), customizable display height, heavy-duty spring roller mechanism, 1440 DPI anti-curl banner printing, and padded shoulder travel bag.
          </p>

          {/* Quick Order Mode Selector */}
          <div className="mt-5 grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setOrderMode("complete")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                orderMode === "complete"
                  ? "bg-white text-blue-700 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Complete Standee
              <span className="block text-[9.5px] font-normal text-slate-400">Machine + Banner</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode("machine-only")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                orderMode === "machine-only"
                  ? "bg-white text-purple-700 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Machine Only
              <span className="block text-[9.5px] font-normal text-slate-400">Hardware Stand & Bag</span>
            </button>

            <button
              type="button"
              onClick={() => setOrderMode("banner-only")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all text-center ${
                orderMode === "banner-only"
                  ? "bg-white text-emerald-700 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Banner Print Only
              <span className="block text-[9.5px] font-normal text-slate-400">Replacement Print</span>
            </button>
          </div>
        </div>

        {/* STEP 1: FIXED MACHINE & BANNER WIDTH SELECTION (Core User Requirement) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Select Fixed Standee Width
              </h2>
            </div>
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              Machine & Banner Width is Fixed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option A: 2.5 Ft Fixed Width */}
            <div
              onClick={() => handleWidthChange(2.5)}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
                fixedWidth === 2.5
                  ? "border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold mb-1.5">
                    Most Popular
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    2.5 Ft Machine Base
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Width: <strong>2.5 Ft (30 Inches / 76 cm)</strong>
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    fixedWidth === 2.5
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {fixedWidth === 2.5 && <FiCheckCircle className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Machine Base:</span>
                  <span className="font-black text-blue-700 font-mono">₹1,250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Inside Banner Width:</span>
                  <span className="font-bold text-slate-800 font-mono">Fixed 2.5 Ft</span>
                </div>
              </div>
            </div>

            {/* Option B: 3 Ft Fixed Width */}
            <div
              onClick={() => handleWidthChange(3)}
              className={`cursor-pointer rounded-xl p-4 border-2 transition-all relative ${
                fixedWidth === 3
                  ? "border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold mb-1.5">
                    Wide Display
                  </span>
                  <h3 className="text-lg font-black text-slate-900">
                    3 Ft Machine Base
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Width: <strong>3 Ft (36 Inches / 91 cm)</strong>
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    fixedWidth === 3
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-300"
                  }`}
                >
                  {fixedWidth === 3 && <FiCheckCircle className="w-3.5 h-3.5" />}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Machine Base:</span>
                  <span className="font-black text-blue-700 font-mono">₹1,350</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Inside Banner Width:</span>
                  <span className="font-bold text-slate-800 font-mono">Fixed 3 Ft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: CUSTOMIZABLE HEIGHT CONFIGURATION (Core User Requirement) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Customize Standee Height
              </h2>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              Customizable (Max 6 Ft)
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Enter Custom Height (in Feet, up to 6 Ft):
            </label>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="6"
                  value={customHeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) <= 6) {
                      setCustomHeight(val);
                    } else {
                      setCustomHeight(6);
                    }
                  }}
                  onBlur={() => {
                    const val = parseFloat(customHeight);
                    if (!val || val < 1) setCustomHeight(3);
                    else if (val > 6) setCustomHeight(6);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold text-slate-900 text-base font-mono outline-hidden"
                  placeholder="e.g. 6 (Max 6 Ft)"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Feet ({Math.round(validHeight * 12)}")
                </span>
              </div>

              {/* Step +/- buttons */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setCustomHeight((prev) => Math.max(1, (parseFloat(prev) || 6) - 0.5))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() => setCustomHeight((prev) => Math.min(6, (parseFloat(prev) || 6) + 0.5))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Height Preset Buttons */}
            <div>
              <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
                Quick Height Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                {[3, 5, 6].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setCustomHeight(h)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      parseFloat(customHeight) === h
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {h} Ft {h === 6 ? "(Max / Standard)" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Dimension & Area Calculation Pill */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FiMaximize2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-700 font-medium">
                  Calculated Display Area:
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {validWidth} ft (W) × {validHeight} ft (H)
                </span>
              </div>
              <div className="font-black text-blue-700 font-mono text-sm bg-white px-2.5 py-0.5 rounded border border-blue-200">
                {totalAreaSqFt} Sq.Ft.
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: FLEX PRINTING MEDIA (Star Flex @ ₹30/sqft) */}
        {includeBanner && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Flex Banner Printing Inside Machine
                </h2>
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Star Flex @ ₹30/Sq.Ft.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Star Flex - High Gloss Finish
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      ₹30 / Sq.Ft.
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fixed {validWidth} Ft (W) × {validHeight} Ft (H) = <strong className="text-slate-800 font-mono">{totalAreaSqFt} Sq.Ft.</strong> (Durable high-gloss finish with vivid colors)
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-blue-200 sm:pl-5 shrink-0">
                <span className="text-xs text-slate-500 block">Banner Total:</span>
                <span className="text-lg font-black text-blue-700 font-mono block">
                  ₹{bannerUnitCost}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {totalAreaSqFt} sqft × ₹{validFlexRate}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: QUANTITY & DISCOUNT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                4
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Quantity & Pricing Adjustment
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Unit Subtotal: <strong className="text-slate-900 font-mono">₹{unitTotal}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Quantity (Units):
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-base flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 font-black text-slate-900 text-center text-base font-mono outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-base flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Discount */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Special Discount (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 text-base font-mono outline-hidden focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CLIENT DETAILS & ACTION BAR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Quotation Client Details
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              (Optional, printed on official PDF quotation)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Client / Company Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Acme Media Corp"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-blue-500 outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Contact Phone / Email
              </label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddToQuote}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                addedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg active:scale-[0.99]"
              }`}
            >
              {addedSuccess ? (
                <>
                  <FiCheckCircle className="w-5 h-5" />
                  Added to Quote Cart!
                </>
              ) : (
                <>
                  <FiShoppingBag className="w-5 h-5" />
                  Add to Quote Cart (₹{netAmountPayable.toLocaleString("en-IN")})
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm border-2 border-slate-300 hover:border-slate-800 text-slate-800 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 transition-all"
            >
              <FiDownload className="w-5 h-5 text-blue-600" />
              {isGeneratingPdf ? "Generating PDF..." : "Download Quotation PDF"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Visualizer Preview & Final Price Card */}
      <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-6">
        {/* Visualizer Component */}
        <RollUpStandiePreview
          machineWidth={validWidth}
          customHeight={validHeight}
          machineType={machineType}
          includeMachine={includeMachine}
          includeBanner={includeBanner}
          mediaName={activeMedia.name}
          flexRate={validFlexRate}
          machineCost={machineUnitCost}
          flexCost={bannerUnitCost}
          totalAreaSqFt={totalAreaSqFt}
          totalPrice={unitTotal}
        />

        {/* Complete Financial Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quotation Price Summary
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-700">
              Qty: {quantity}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {includeMachine && (
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Machine Base ({validWidth} Ft Base × {quantity}):
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{(machineUnitCost * quantity).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {includeBanner && (
              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Banner Print ({totalAreaSqFt} sqft × {quantity} @ ₹{validFlexRate}):
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  ₹{(bannerUnitCost * quantity).toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-600">
              <span>Cassette Fitting & Assembly:</span>
              <span className="font-bold text-emerald-600 uppercase text-[11px]">
                Complimentary
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600">
              <span>Padded Shoulder Travel Bag:</span>
              <span className="font-bold text-emerald-600 uppercase text-[11px]">
                Included Free
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold text-slate-700">
              <span>Gross Subtotal:</span>
              <span className="font-mono">₹{grossSubtotal.toLocaleString("en-IN")}</span>
            </div>

            {validDiscount > 0 && (
              <div className="flex items-center justify-between text-red-600 font-bold">
                <span>Special Discount:</span>
                <span className="font-mono">- ₹{validDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
          </div>

          {/* Final Net Amount */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                Net Amount Payable
              </span>
              <span className="text-[10px] text-blue-300">
                Inclusive of standee machine & printing
              </span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-400 font-mono">
                ₹{netAmountPayable.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
