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
  FiTool,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import StandiePreview from "./StandiePreview";
import { generateStandieQuotationPdf } from "@/lib/generateQuotationPdf";


const FLEX_MEDIA_TYPES = [
  {
    id: "star-flex",
    name: "Star Flex - High Gloss Finish",
    defaultRate: 30,
    tag: "High Gloss",
    description: "High durability glossy Star Flex with vivid color contrast and rich ink saturation.",
  },
];

export default function StandieOrderForm({ product, onVariantSelect }) {
  const { addToQuote } = useQuote();

  // Core Dimensions (Feet)
  const [standeeHeight, setStandeeHeight] = useState(5);
  const [standeeWidth, setStandeeWidth] = useState(3);
  const [legClearance, setLegClearance] = useState(1);

  // Flex Printing Configurations
  const [selectedMediaId, setSelectedMediaId] = useState("star-flex");
  const [flexRatePerSqFt, setFlexRatePerSqFt] = useState(30);
  const [isDoubleSided, setIsDoubleSided] = useState(true);

  // Iron Rod Frame Specifications
  const [ironRodRatePerFt, setIronRodRatePerFt] = useState(35);

  // Angle Rod Base Feet Specifications
  const [angleBaseTotalFt, setAngleBaseTotalFt] = useState(2);
  const [angleRodRatePerFt, setAngleRodRatePerFt] = useState(50);

  // Support Rods Specifications
  const [supportCount, setSupportCount] = useState(4);
  const [supportRatePerPc, setSupportRatePerPc] = useState(80);

  // Quantity & Discount
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // Client Details for Quotation
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


  // Safe Dimension Parsing
  const validHeight = Math.max(1, parseFloat(standeeHeight) || 5);
  const validWidth = Math.max(0.5, parseFloat(standeeWidth) || 3);
  const validLeg = Math.max(0, Math.min(validHeight - 0.5, parseFloat(legClearance) || 1));

  // Calculated Flex Display Size
  const flexHeight = parseFloat((validHeight - validLeg).toFixed(2));
  const flexWidth = validWidth;
  const singleSideFlexArea = parseFloat((flexHeight * flexWidth).toFixed(2));
  const sidesMultiplier = isDoubleSided ? 2 : 1;
  const totalFlexPrintArea = parseFloat((singleSideFlexArea * sidesMultiplier).toFixed(2));

  // Safe Rates
  const validFlexRate = Math.max(0, parseFloat(flexRatePerSqFt) || 0);
  const validIronRate = Math.max(0, parseFloat(ironRodRatePerFt) || 0);
  const validAngleRate = Math.max(0, parseFloat(angleRodRatePerFt) || 0);
  const validSupportRate = Math.max(0, parseFloat(supportRatePerPc) || 0);

  // 1. Flex Cost: Area × Rate × Sides (default 4 × 3 = 12 × 25 × 2 = ₹600)
  const singleSideFlexCost = Math.round(singleSideFlexArea * validFlexRate);
  const flexCostTotal = Math.round(singleSideFlexCost * sidesMultiplier);

  // 2. Iron Rod Frame Running Feet: (Height + Height + Width + Width) = 5+5+3+3 = 16 running ft
  // Cost: 16 × 35 = ₹560
  const ironRunningFt = parseFloat((validHeight * 2 + validWidth * 2).toFixed(2));
  const ironRodCostTotal = Math.round(ironRunningFt * validIronRate);

  // 3. Angle Rod Base (Legs): default 2 ft × ₹50 = ₹100
  const validAngleFt = Math.max(0, parseFloat(angleBaseTotalFt) || 0);
  const angleRodCostTotal = Math.round(validAngleFt * validAngleRate);

  // 4. Support Rods: default 4 supports × ₹80 = ₹320
  const validSupports = Math.max(0, parseInt(supportCount) || 0);
  const supportCostTotal = Math.round(validSupports * validSupportRate);

  // Per Unit Subtotal: 560 + 100 + 320 + 600 = ₹1,580
  const unitTotal = ironRodCostTotal + angleRodCostTotal + supportCostTotal + flexCostTotal;
  const grossSubtotal = Math.round(unitTotal * quantity);
  const validDiscount = Math.max(0, Math.min(grossSubtotal, parseFloat(discount) || 0));
  const netAmountPayable = Math.max(0, grossSubtotal - validDiscount);

  // Media object
  const activeMedia = FLEX_MEDIA_TYPES.find((m) => m.id === selectedMediaId) || FLEX_MEDIA_TYPES[0];

  const handleMediaChange = (media) => {
    setSelectedMediaId(media.id);
    setFlexRatePerSqFt(media.defaultRate);
  };

  // Add to Quote Cart
  const handleAddToQuote = () => {
    const quoteItem = {
      productId: product?.id || "STD-002",
      code: product?.code || "STD-002",
      name: `Iron Frame Standee (${validWidth}×${validHeight} Ft, ${isDoubleSided ? "Double-Sided" : "Single-Sided"})`,
      categoryId: "flex-board",
      subCategory: "STANDIE",
      unitPrice: unitTotal,
      quantity: quantity,
      subtotal: grossSubtotal,
      discount: validDiscount,
      total: netAmountPayable,
      specifications: {
        "Total Standee Size": `${validWidth} ft (W) × ${validHeight} ft (H)`,
        "Flex Display Area": `${flexWidth} ft × ${flexHeight} ft (${singleSideFlexArea} sq.ft. ${isDoubleSided ? "Both Sides × 2" : "Single Side"})`,
        "Ground Leg Clearance": `${validLeg} ft`,
        "Iron Pipe Frame": `${ironRunningFt} running ft (${validHeight}+${validHeight}+${validWidth}+${validWidth} ft) @ ₹${validIronRate}/ft (₹${ironRodCostTotal})`,
        "Angle Rod Base Feet": `${validAngleFt} ft @ ₹${validAngleRate}/ft (₹${angleRodCostTotal})`,
        "Support Rods": `${validSupports} supports @ ₹${validSupportRate}/pc (₹${supportCostTotal})`,
        "Flex Printing": `${activeMedia.name} @ ₹${validFlexRate}/sqft (₹${flexCostTotal})`,
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
      generateStandieQuotationPdf({
        standeeSize: `${validWidth} × ${validHeight} Ft`,
        validWidth,
        validHeight,
        legClearance: validLeg,
        flexHeight,
        flexWidth,
        flexArea: singleSideFlexArea,
        isDoubleSided,
        mediaName: activeMedia.name,
        flexRate: validFlexRate,
        flexCost: flexCostTotal,
        ironRunningFt,
        ironRate: validIronRate,
        ironCost: ironRodCostTotal,
        angleBaseFt: validAngleFt,
        angleRate: validAngleRate,
        angleCost: angleRodCostTotal,
        supportCount: validSupports,
        supportRate: validSupportRate,
        supportCost: supportCostTotal,
        quantity,
        unitTotal,
        grossSubtotal,
        validDiscount,
        totalAmount: netAmountPayable,
        clientInfo: {
          clientName: clientName.trim(),
          phone: clientPhone.trim(),
        },
        productName: "Heavy-Duty MS Iron Frame Standee Display",
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wide">
              Iron Frame Standee Configurator
            </span>
            <span className="text-xs text-slate-400 font-mono">#{product?.code || "STD-002"}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Iron Frame Standee &amp; Flex Display Calculator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Heavy-duty MS iron pipe framing with running feet, angle base stand, 4 corner supports, and 2-sided flex printing.
          </p>
        </div>

        {/* Live Total Rate Badge */}
        <div className="text-right bg-gradient-to-br from-orange-50 to-amber-50 p-3.5 rounded-xl border border-orange-200 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Total Price
          </div>
          <div className="text-2xl font-black text-slate-900 leading-tight">
            ₹{netAmountPayable.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            ₹{unitTotal.toLocaleString()} / unit • {quantity} {quantity === 1 ? "unit" : "units"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Standee Size & Clearance Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiMaximize2 className="w-3.5 h-3.5 text-orange-600" />
                1. Standee Size &amp; Frame Dimensions
              </span>
              <span className="text-[11px] text-orange-600 font-bold">
                Flex Area: {singleSideFlexArea} sq.ft. / side
              </span>
            </label>

            {/* Dimensions Input Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Standee Height (Ft):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="15"
                    value={standeeHeight}
                    onChange={(e) => setStandeeHeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 font-bold">ft</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Full frame height</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Standee Width (Ft):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="15"
                    value={standeeWidth}
                    onChange={(e) => setStandeeWidth(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 font-bold">ft</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Frame width</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                  Stand Rod / Legs (Ft):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="4"
                    value={legClearance}
                    onChange={(e) => setLegClearance(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <span className="absolute right-2.5 top-1.5 text-[10px] text-slate-400 font-bold">ft</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 block">Default 1 ft clearance</span>
              </div>
            </div>

            {/* Calculated Flex Dimensions Highlight */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/20 text-amber-700 font-bold">
                  <FiLayers className="w-3.5 h-3.5" />
                </span>
                <span className="text-amber-900 font-semibold">
                  Mounted Flex Board Size:{" "}
                  <strong className="text-amber-950 font-bold font-mono">
                    {flexHeight} ft (H) × {flexWidth} ft (W) = {singleSideFlexArea} Sq.Ft.
                  </strong>
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-800 bg-white/70 px-2 py-0.5 rounded border border-amber-300">
                Height ({validHeight}ft) - Legs ({validLeg}ft) = {flexHeight}ft
              </span>
            </div>
          </div>

          {/* 2. Iron Rod Frame Running Feet Calculation */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FiTool className="w-3.5 h-3.5 text-orange-600" />
                2. MS Iron Rod Frame (Running Feet)
              </label>
              <span className="text-xs font-extrabold text-orange-700">
                ₹{ironRodCostTotal.toLocaleString()}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 bg-white p-3 rounded-xl border border-slate-200 space-y-1 font-mono">
              <div className="flex justify-between items-center text-slate-700">
                <span>Running Feet Formula:</span>
                <span className="font-bold text-slate-900">
                  {validHeight} + {validHeight} + {validWidth} + {validWidth} = {ironRunningFt} Running Ft
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                (2 Vertical side poles of {validHeight}ft each + Top horizontal pipe of {validWidth}ft + Bottom crossbar of {validWidth}ft)
              </p>
            </div>

            {/* Iron Rod Rate Customizer */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <span className="text-xs font-bold text-slate-700">
                Iron Rod Price per Running Foot:
              </span>
              <div className="relative w-36">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1"
                  value={ironRodRatePerFt}
                  onChange={(e) => setIronRodRatePerFt(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-xs font-extrabold bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">/ft</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              {ironRunningFt} ft × ₹{validIronRate} = <strong className="text-slate-900">₹{ironRodCostTotal}</strong>
            </div>
          </div>

          {/* 3. Angle Rod Stand (Base Legs) & 4. Support Rods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Angle Rod Base Feet */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  3. Angle Rod Base Feet
                </span>
                <span className="text-xs font-extrabold text-orange-700">
                  ₹{angleRodCostTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                2 Welded angle iron legs providing sturdy upright stability.
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">Base Feet Span:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      value={angleBaseTotalFt}
                      onChange={(e) => setAngleBaseTotalFt(e.target.value)}
                      className="w-full pr-6 pl-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    />
                    <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">ft</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">Rate per Foot:</span>
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={angleRodRatePerFt}
                      onChange={(e) => setAngleRodRatePerFt(e.target.value)}
                      className="w-full pl-5 pr-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                {validAngleFt} ft × ₹{validAngleRate} = <strong className="text-slate-900">₹{angleRodCostTotal}</strong>
              </div>
            </div>

            {/* Support Rods */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  4. Support Rods (Stays)
                </span>
                <span className="text-xs font-extrabold text-orange-700">
                  ₹{supportCostTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                4 Corner stays (2 on each leg) bracing upright poles to the angle feet.
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">Support Count:</span>
                  <div className="relative w-24">
                    <input
                      type="number"
                      min="0"
                      value={supportCount}
                      onChange={(e) => setSupportCount(e.target.value)}
                      className="w-full pr-2 pl-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">Rate per Piece:</span>
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={supportRatePerPc}
                      onChange={(e) => setSupportRatePerPc(e.target.value)}
                      className="w-full pl-5 pr-2 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                {validSupports} pcs × ₹{validSupportRate} = <strong className="text-slate-900">₹{supportCostTotal}</strong>
              </div>
            </div>
          </div>

          {/* 5. Flex Media Printing (Double-Sided Both Sides) */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <FiLayers className="w-3.5 h-3.5 text-orange-600" />
                5. Flex Banner Printing (Both Sides)
              </label>
              <span className="text-xs font-extrabold text-orange-700">
                ₹{flexCostTotal.toLocaleString()}
              </span>
            </div>

            {/* Sides Option Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setIsDoubleSided(true)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isDoubleSided
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>★ Double-Sided (Front + Back)</span>
                <span className="text-[10px] opacity-90 font-mono">(× 2)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDoubleSided(false)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  !isDoubleSided
                    ? "bg-orange-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>Single-Sided (Front Only)</span>
                <span className="text-[10px] opacity-90 font-mono">(× 1)</span>
              </button>
            </div>

            {/* Star Flex Dedicated Card with Editable Rate */}
            <div className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">Star Flex - High Gloss Finish</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-orange-100 text-orange-800 border border-orange-200">
                      High Gloss Flex
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    High durability glossy Star Flex with vivid color contrast and rich ink saturation.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Star Flex Rate:</span>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={flexRatePerSqFt}
                      onChange={(e) => setFlexRatePerSqFt(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-xs font-black bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">/sqft</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flex Calculation Breakdown Display */}
            <div className="text-right text-[11px] text-slate-600 font-mono bg-white p-2.5 rounded-lg border border-slate-200">
              Flex Size: {flexHeight} × {flexWidth} = {singleSideFlexArea} sq.ft.
              <br />
              {isDoubleSided ? (
                <>
                  = {singleSideFlexArea} sq.ft. × ₹{validFlexRate} = ₹{singleSideFlexCost}
                  <br />
                  = 2 × ₹{singleSideFlexCost} = <strong className="text-slate-900">₹{flexCostTotal}</strong>
                </>
              ) : (
                <>
                  = {singleSideFlexArea} sq.ft. × ₹{validFlexRate} = <strong className="text-slate-900">₹{flexCostTotal}</strong>
                </>
              )}
            </div>
          </div>

          {/* 6. Quantity & Special Discount */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Quantity (Standees):
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Special Discount (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  max={grossSubtotal}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage: Visual Interactive Preview & Itemized Bill (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Interactive Preview */}
          <StandiePreview
            totalHeight={validHeight}
            width={validWidth}
            legClearance={validLeg}
            flexHeight={flexHeight}
            flexWidth={flexWidth}
            flexArea={singleSideFlexArea}
            isDoubleSided={isDoubleSided}
            mediaName={activeMedia.name}
            flexRate={validFlexRate}
            ironRunningFt={ironRunningFt}
            ironRate={validIronRate}
            angleBaseFt={validAngleFt}
            angleRate={validAngleRate}
            supportCount={validSupports}
            supportRate={validSupportRate}
            totalPrice={unitTotal}
          />

          {/* Itemized Specification & Pricing Bill */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Itemized Cost Breakdown
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {quantity} {quantity === 1 ? "Unit" : "Units"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 font-mono">
              {/* Iron Rod Frame */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-800 block">1. Iron Rod Frame:</span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {validHeight}+{validHeight}+{validWidth}+{validWidth} = {ironRunningFt} ft × ₹{validIronRate}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{(ironRodCostTotal * quantity).toLocaleString()}
                </span>
              </div>

              {/* Angle Rod Base */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-800 block">2. Angle Rod Base (Legs):</span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {validAngleFt} ft × ₹{validAngleRate}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{(angleRodCostTotal * quantity).toLocaleString()}
                </span>
              </div>

              {/* Support Rods */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-800 block">3. Support Rods:</span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {validSupports} pcs × ₹{validSupportRate}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{(supportCostTotal * quantity).toLocaleString()}
                </span>
              </div>

              {/* Flex Printing */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-800 block">
                    4. Flex Printing ({isDoubleSided ? "Both Sides" : "Single Side"}):
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {isDoubleSided ? `2 × (${singleSideFlexArea} sqft × ₹${validFlexRate})` : `${singleSideFlexArea} sqft × ₹${validFlexRate}`}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">
                  ₹{(flexCostTotal * quantity).toLocaleString()}
                </span>
              </div>

              {/* Formula Verification Note */}
              <div className="pt-2 border-t border-slate-200 text-[10.5px] text-slate-500">
                Formula: {ironRodCostTotal} + {angleRodCostTotal} + {supportCostTotal} + {flexCostTotal} ={" "}
                <strong className="text-slate-800">₹{unitTotal.toLocaleString()} / unit</strong>
              </div>

              {validDiscount > 0 && (
                <div className="flex justify-between items-center text-orange-600 font-bold pt-1 border-t border-slate-200 font-sans">
                  <span>Special Discount:</span>
                  <span>- ₹{validDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Total Payable Box */}
            <div className="pt-3 border-t border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Net Amount Payable
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{netAmountPayable.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Complete Fabricated Unit
              </span>
            </div>

            {/* Client Info (For Instant PDF Quotation) */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                Customer Information (For Official Quotation):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Client / Company Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleAddToQuote}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    Added to Quote Cart!
                  </>
                ) : (
                  <>
                    <FiShoppingBag className="w-4 h-4" />
                    Add Standee to Quote (₹{netAmountPayable.toLocaleString()})
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <FiDownload className="w-4 h-4 text-orange-400" />
                {isGeneratingPdf ? "Generating PDF..." : "Download Official Quotation PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
