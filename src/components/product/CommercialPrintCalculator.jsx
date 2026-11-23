import React, { useState, useMemo, useEffect } from "react";
import {
  FiBookOpen,
  FiLayers,
  FiTag,
  FiGrid,
  FiDownload,
  FiUser,
  FiPhone,
  FiScissors,
  FiShield,
  FiDollarSign,
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import { useAuth } from "@/context/AuthContext";
import { generateGeneralProductQuotationPdf } from "@/lib/generateQuotationPdf";

// Standard preset sizes
const PRESET_SIZES = [
  { id: "4.5x11", name: '4.5" × 11" (Standard Bill Book)', w: 4.5, h: 11, popular: true },
  { id: "a4", name: 'A4 (8.27" × 11.69")', w: 8.27, h: 11.69, popular: true },
  { id: "a5", name: 'A5 / A4 Half (5.83" × 8.27")', w: 5.83, h: 8.27, popular: true },
  { id: "legal", name: 'Legal (8.5" × 14.0")', w: 8.5, h: 14.0 },
  { id: "1/4-demy", name: '1/4 Demy (4.5" × 9.0")', w: 4.5, h: 9.0 },
  { id: "1/6-demy", name: '1/6 Demy (3.0" × 9.0")', w: 3.0, h: 9.0 },
  { id: "1/8-demy", name: '1/8 Demy (4.5" × 4.5")', w: 4.5, h: 4.5 },
  { id: "custom", name: "Custom Dimensions", w: 4.5, h: 11 },
];

const RAW_SHEET_OPTIONS = [
  { label: '18" × 22" (Standard Mini Offset Sheet)', w: 18, h: 22, gsms: [58, 64, 70] },
  { label: '23" × 36" (Large Sheet)', w: 23, h: 36, gsms: [70, 80, 90, 100, 115] },
  { label: '25" × 36" (Full Commercial Sheet)', w: 25, h: 36, gsms: [70, 80, 90, 100, 115] },
];

const BINDING_OPTIONS = [
  { id: "normal", name: "Normal Binding (Includes Cover, Gatta & Finishing)", rate: 25, tag: "Standard Popular" },
  { id: "stapler", name: "Stapler / Wire Stitch Binding", rate: 12, tag: "Economy" },
  { id: "gumming", name: "Top Gumming Pad (Writing / Memo)", rate: 10, tag: "Pads" },
  { id: "glue", name: "Hot Melt Glue Spine Binding", rate: 20, tag: "Books" },
  { id: "premium", name: "Premium Hardbound with Rexine", rate: 35, tag: "Luxury" },
];

export default function CommercialPrintCalculator({ product, onVariantSelect }) {
  const { addToQuote, clientInfo, updateClientInfo } = useQuote();
  const { isAdmin } = useAuth();

  // Basic Product State
  const [productType, setProductType] = useState(product?.name || "Bill Book");
  const [sizePreset, setSizePreset] = useState("4.5x11");
  const [customWidth, setCustomWidth] = useState(4.5);
  const [customHeight, setCustomHeight] = useState(11);
  const [quantity, setQuantity] = useState(10); // Minimum 10 units
  const [pagesPerBook, setPagesPerBook] = useState(100); // 100 pages/sets per book
  const [plyCount, setPlyCount] = useState(2); // 1, 2, or 3 ply

  // Client Details
  const [clientName, setClientName] = useState(clientInfo?.clientName || "");
  const [clientPhone, setClientPhone] = useState(clientInfo?.phone || "");
  const [companyName, setCompanyName] = useState(clientInfo?.companyName || "");

  useEffect(() => {
    if (clientInfo?.clientName && !clientName) setClientName(clientInfo.clientName);
    if (clientInfo?.phone && !clientPhone) setClientPhone(clientInfo.phone);
    if (clientInfo?.companyName && !companyName) setCompanyName(clientInfo.companyName);
  }, [clientInfo]);

  // Per-Ply Configurations (White, Yellow, Pink)
  const [plyConfigs, setPlyConfigs] = useState([
    {
      plyIndex: 1,
      colour: "White",
      gsm: 64,
      rawSheetWidth: 18,
      rawSheetHeight: 22,
      printingMethod: "mini_offset",
      inkColour: "Black",
      hasBackPrint: false,
    },
    {
      plyIndex: 2,
      colour: "Yellow",
      gsm: 58,
      rawSheetWidth: 18,
      rawSheetHeight: 22,
      printingMethod: "mini_offset",
      inkColour: "Black",
      hasBackPrint: false,
    },
    {
      plyIndex: 3,
      colour: "Pink",
      gsm: 58,
      rawSheetWidth: 18,
      rawSheetHeight: 22,
      printingMethod: "mini_offset",
      inkColour: "Black",
      hasBackPrint: false,
    },
  ]);

  // Binding & Finishing States
  const [selectedBinding, setSelectedBinding] = useState("normal");
  const [hasNumbering, setHasNumbering] = useState(true);
  const [startNumber, setStartNumber] = useState(1);
  const [hasPunching, setHasPunching] = useState(false);

  // Bargaining & Commercial States
  const [manualSellingPrice, setManualSellingPrice] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Determine Active Finished Dimensions
  const selectedSizeObj = PRESET_SIZES.find((s) => s.id === sizePreset) || PRESET_SIZES[0];
  const finishedW = sizePreset === "custom" ? Math.max(1, parseFloat(customWidth) || 4.5) : selectedSizeObj.w;
  const finishedH = sizePreset === "custom" ? Math.max(1, parseFloat(customHeight) || 11) : selectedSizeObj.h;

  // Active Binding Rate
  const activeBindingObj = BINDING_OPTIONS.find((b) => b.id === selectedBinding) || BINDING_OPTIONS[0];
  const bindingRate = activeBindingObj.rate;

  // -------------------------------------------------------------
  // PURE CLIENT-SIDE CALCULATION ENGINE (Matching Handover V1.0)
  // -------------------------------------------------------------
  const calculation = useMemo(() => {
    const qty = Math.max(1, parseInt(quantity, 10) || 10);
    const pages = Math.max(10, parseInt(pagesPerBook, 10) || 100);
    const activePlies = plyConfigs.slice(0, plyCount);

    let totalPaperCost = 0;
    let totalOffsetRunCost = 0;
    let totalDigitalCost = 0;
    const uniqueMasters = new Set();
    let totalOffsetRuns = 0;

    const plyCalculations = activePlies.map((ply, idx) => {
      // 1. Cutting Yield
      const sW = ply.rawSheetWidth;
      const sH = ply.rawSheetHeight;
      const pW = finishedW;
      const pH = finishedH;

      const vCols = Math.floor(sW / pW);
      const vRows = Math.floor(sH / pH);
      const verticalYield = vCols * vRows;

      const hCols = Math.floor(sW / pH);
      const hRows = Math.floor(sH / pW);
      const horizontalYield = hCols * hRows;

      const isHorizontal = horizontalYield > verticalYield;
      const bestYield = Math.max(1, isHorizontal ? horizontalYield : verticalYield);
      const selectedLayout = isHorizontal ? "horizontal" : "vertical";
      const grid = isHorizontal ? { cols: hCols, rows: hRows } : { cols: vCols, rows: vRows };

      // 2. Paper Requirements & Wastage (+5 loose / +10 ream)
      const totalPlyPages = qty * pages;
      const netSheets = Math.ceil(totalPlyPages / bestYield);
      const isReam = netSheets >= 500;
      const wastage = isReam ? 10 : 5;
      const grossSheets = netSheets + wastage;

      // 3. Approximate Paper Rates
      const sheetRate = sW === 18 ? 1.35 : 3.4;
      const plyCost = Math.round(grossSheets * sheetRate);
      totalPaperCost += plyCost;

      // 4. Printing Process
      if (ply.printingMethod === "mini_offset") {
        uniqueMasters.add(`FRONT_${ply.inkColour}`);
        totalOffsetRuns += 1;
        if (ply.hasBackPrint) {
          uniqueMasters.add(`BACK_${ply.inkColour}`);
          totalOffsetRuns += 1;
        }
      } else if (ply.printingMethod === "digital" && ply.colour === "White") {
        // Digital 12x18 rate
        const digYield = Math.max(1, Math.floor(18 / pW) * Math.floor(12 / pH));
        const digSheets = Math.ceil(totalPlyPages / digYield);
        const digRate = ply.hasBackPrint ? 7 : 6;
        totalDigitalCost += digSheets * digRate;
      }

      return {
        ...ply,
        verticalYield,
        horizontalYield,
        bestYield,
        selectedLayout,
        grid,
        netSheets,
        wastage,
        grossSheets,
        plyCost,
      };
    });

    // Offset Cost
    const masterCost = uniqueMasters.size * 30; // ₹30/master
    const offsetSlabs = Math.max(1, Math.ceil((qty * pages) / (plyCalculations[0]?.bestYield || 8) / 1000));
    const offsetRunCost = totalOffsetRuns * offsetSlabs * 70; // ₹70 per 1000 impressions per run
    totalOffsetRunCost = offsetRunCost;

    // Finishing Costs
    const bindingCost = qty * bindingRate;
    const numberingCost = hasNumbering ? qty * 2 : 0; // ₹2/book
    const punchingCost = hasPunching ? qty * 2 : 0; // ₹2/book
    const totalFinishingCost = bindingCost + numberingCost + punchingCost;

    // Total Vendor Production Cost
    const totalVendorCost = Math.round(
      totalPaperCost + masterCost + totalOffsetRunCost + totalDigitalCost + totalFinishingCost
    );

    // Recommended Selling Price (approx 30% margin default)
    const recommendedSellingPrice = Math.round(totalVendorCost * 1.4);

    // Final Selling Price
    const finalSellingPrice = manualSellingPrice && !isNaN(Number(manualSellingPrice))
      ? Number(manualSellingPrice)
      : recommendedSellingPrice;

    // Net Margin Evaluation
    const netProfit = Math.round(finalSellingPrice - totalVendorCost);
    const profitMarginPercent = finalSellingPrice > 0
      ? Number(((netProfit / finalSellingPrice) * 100).toFixed(1))
      : 0;

    const gstAmount = 0;
    const grandTotal = finalSellingPrice;

    // Numbering Range
    const totalSets = qty * pages;
    const endNumber = parseInt(startNumber, 10) + totalSets - 1;
    const numberingRange = hasNumbering
      ? `${String(startNumber).padStart(4, "0")} – ${String(endNumber).padStart(4, "0")}`
      : "None";

    return {
      qty,
      pages,
      plyCalculations,
      masterCost,
      masterCount: uniqueMasters.size,
      totalOffsetRuns,
      offsetRunCost,
      totalDigitalCost,
      totalPaperCost,
      totalFinishingCost,
      bindingCost,
      numberingCost,
      punchingCost,
      totalVendorCost,
      recommendedSellingPrice,
      finalSellingPrice,
      netProfit,
      profitMarginPercent,
      isLossMaking: netProfit < 0,
      gstAmount,
      grandTotal,
      numberingRange,
    };
  }, [
    quantity,
    pagesPerBook,
    plyCount,
    plyConfigs,
    finishedW,
    finishedH,
    bindingRate,
    hasNumbering,
    startNumber,
    hasPunching,
    manualSellingPrice,
  ]);

  const handleUpdatePly = (index, field, value) => {
    setPlyConfigs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add To Quote Cart
  const handleAddToQuote = () => {
    const itemSpec = {
      productName: `${productType} (${plyCount}-Ply)`,
      category: "bill-books",
      finishedSize: `${finishedW}" × ${finishedH}"`,
      quantity: calculation.qty,
      pagesPerBook: calculation.pages,
      plyCount,
      bindingType: activeBindingObj.name,
      hasNumbering,
      numberingRange: calculation.numberingRange,
      hasPunching,
      subtotal: calculation.finalSellingPrice,
      gstAmount: calculation.gstAmount,
      totalAmount: calculation.grandTotal,
    };

    addToQuote(
      {
        id: `BB-${Date.now()}`,
        name: `${productType} (${plyCount}-Ply)`,
        code: "BB-001",
        image: "/src/assets/images/categories (8).webp",
        unitName: "Books",
        categoryId: "bill-books",
      },
      {
        "Size": `${finishedW}" × ${finishedH}"`,
        "Ply Layers": `${plyCount} Ply`,
        "Pages / Book": `${calculation.pages} Sets`,
        "Binding": activeBindingObj.name,
        "Numbering": calculation.numberingRange,
        "Punching": hasPunching ? "Yes (Perforated)" : "No",
      },
      calculation.qty,
      {
        subtotal: calculation.finalSellingPrice,
        gstAmount: calculation.gstAmount,
        totalAmount: calculation.grandTotal,
        unitPrice: Math.round(calculation.finalSellingPrice / calculation.qty),
      }
    );

    if (clientName || clientPhone || companyName) {
      updateClientInfo({ clientName, phone: clientPhone, companyName });
    }

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3500);
  };

  // Instant PDF Download
  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      const docUrl = generateGeneralProductQuotationPdf({
        productName: `${productType} (${plyCount}-Ply)`,
        productCode: "BB-001",
        selectedVariant: `${finishedW}" × ${finishedH}"`,
        selectedOptions: {
          "Finished Dimensions": `${finishedW}" × ${finishedH}"`,
          "Ply Layers": `${plyCount} Ply (${calculation.plyCalculations.map((p) => p.colour).join(", ")})`,
          "Pages / Book": `${calculation.pages} Sets`,
          "Binding Type": activeBindingObj.name,
          "Serial Numbering": calculation.numberingRange,
          "Perforation / Punching": hasPunching ? "Yes (Perforated)" : "No",
        },
        quantity: calculation.qty,
        unitName: "Books",
        applicableCost: calculation.finalSellingPrice,
        validDiscount: 0,
        totalAmount: calculation.grandTotal,
        clientInfo: {
          clientName: clientName || "Valued Customer",
          phone: clientPhone || "N/A",
          companyName: companyName || "",
        },
      });

      if (docUrl) {
        window.open(docUrl, "_blank");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF quotation. Please check console.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-600 text-white shadow-xs">
              <FiBookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bill Book &amp; Commercial Printing Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Configure Single, Two-Ply &amp; Three-Ply Bill Books, Receipt Books, Writing Pads with automatic sheet yield optimization, Mini Offset runs, and serial numbering.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONFIGURATION CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: PRODUCT & FINISHED SIZE */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiTag className="text-orange-600" />
                1. Product &amp; Finished Size
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                Step 1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Type
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Bill Book">Bill Book</option>
                  <option value="Receipt Book">Receipt Book</option>
                  <option value="Cash Memo">Cash Memo</option>
                  <option value="Delivery Challan">Delivery Challan</option>
                  <option value="Bilty Book">Bilty Book</option>
                  <option value="Order Book">Order Book</option>
                  <option value="Writing Pad">Writing Pad</option>
                  <option value="Gumming Pad">Gumming Pad</option>
                  <option value="Donation Receipt">Donation Receipt</option>
                  <option value="Jagran Slip">Jagran Slip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finished Size Preset
                </label>
                <select
                  value={sizePreset}
                  onChange={(e) => setSizePreset(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-orange-500"
                >
                  {PRESET_SIZES.map((sz) => (
                    <option key={sz.id} value={sz.id}>
                      {sz.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {sizePreset === "custom" && (
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-orange-50/50 rounded-xl border border-orange-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Custom Width (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Custom Height (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: QUANTITY & MULTI-PLY LAYERS */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiLayers className="text-orange-600" />
                2. Volume &amp; Multi-Ply Layers
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                Step 2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity (Pads / Books)
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">MOQ: 10 units recommended</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pages / Sets per Book
                </label>
                <select
                  value={pagesPerBook}
                  onChange={(e) => setPagesPerBook(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-orange-500"
                >
                  <option value={50}>50 Pages / Sets</option>
                  <option value={100}>100 Pages / Sets (Standard)</option>
                  <option value={150}>150 Pages / Sets</option>
                  <option value={200}>200 Pages / Sets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Number of Plies
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map((ply) => (
                    <button
                      key={ply}
                      type="button"
                      onClick={() => setPlyCount(ply)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        plyCount === ply
                          ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {ply} Ply
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PER-PLY CUSTOMIZATION CARDS */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                Individual Ply Paper &amp; Printing Configurations:
              </span>

              {plyConfigs.slice(0, plyCount).map((ply, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-full border ${
                          ply.colour === "White"
                            ? "bg-white border-slate-400"
                            : ply.colour === "Yellow"
                            ? "bg-amber-300 border-amber-400"
                            : "bg-pink-300 border-pink-400"
                        }`}
                      />
                      Layer {idx + 1}: {ply.colour} Paper
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {calculation.plyCalculations[idx]?.bestYield || 0} Pieces/Sheet
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Raw Sheet
                      </label>
                      <select
                        value={`${ply.rawSheetWidth}x${ply.rawSheetHeight}`}
                        onChange={(e) => {
                          const [w, h] = e.target.value.split("x").map(Number);
                          handleUpdatePly(idx, "rawSheetWidth", w);
                          handleUpdatePly(idx, "rawSheetHeight", h);
                        }}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                      >
                        {RAW_SHEET_OPTIONS.map((rs, i) => (
                          <option key={i} value={`${rs.w}x${rs.h}`}>
                            {rs.w}" × {rs.h}"
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        GSM
                      </label>
                      <select
                        value={ply.gsm}
                        onChange={(e) => handleUpdatePly(idx, "gsm", Number(e.target.value))}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                      >
                        {[58, 64, 70, 80, 90, 100, 115].map((g) => (
                          <option key={g} value={g}>
                            {g} GSM
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Printing Method
                      </label>
                      <select
                        value={ply.printingMethod}
                        onChange={(e) => handleUpdatePly(idx, "printingMethod", e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                      >
                        <option value="mini_offset">Mini Offset</option>
                        {ply.colour === "White" && (
                          <option value="digital">Digital (White Only)</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Ink Colour
                      </label>
                      <select
                        value={ply.inkColour}
                        onChange={(e) => handleUpdatePly(idx, "inkColour", e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                      >
                        <option value="Black">Black Ink</option>
                        <option value="Red">Red Ink</option>
                        <option value="Blue">Blue Ink</option>
                        <option value="Green">Green Ink</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: BINDING, NUMBERING & PUNCHING */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiScissors className="text-orange-600" />
                3. Binding, Numbering &amp; Punching
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                Step 3
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Binding Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BINDING_OPTIONS.map((bind) => {
                  const isSelected = selectedBinding === bind.id;
                  return (
                    <button
                      key={bind.id}
                      type="button"
                      onClick={() => setSelectedBinding(bind.id)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        isSelected
                          ? "bg-orange-50/70 border-orange-600 ring-2 ring-orange-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-900">{bind.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {bind.tag}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-orange-600">
                        ₹{bind.rate} / Book
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* SERIAL NUMBERING */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNumbering}
                    onChange={(e) => setHasNumbering(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Serial Numbering (+₹2 / Book)
                  </span>
                </label>
                {hasNumbering && (
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Starting Serial Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Range: {calculation.numberingRange}
                    </span>
                  </div>
                )}
              </div>

              {/* PUNCHING / PERFORATION */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPunching}
                    onChange={(e) => setHasPunching(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Punching / Perforation (+₹2 / Book)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Line perforation along the binding margin across all plies for smooth customer receipt tear-off.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME YIELD VISUALIZER & COMMERCIALS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SHEET CUTTING OPTIMIZATION CARD */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiGrid className="text-orange-600" />
                Sheet Cutting Optimization
              </span>
              <span className="text-orange-600 font-extrabold text-xs">
                {calculation.plyCalculations[0]?.bestYield || 0} Pcs / Sheet
              </span>
            </h3>

            {/* Visual Grid Mockup of Raw Sheet Cut */}
            <div className="p-4 bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-slate-800 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400">
                Raw Sheet: {plyConfigs[0]?.rawSheetWidth}" × {plyConfigs[0]?.rawSheetHeight}" ({calculation.plyCalculations[0]?.selectedLayout} layout)
              </div>
              <div
                className="grid gap-1 p-2 bg-slate-800/80 rounded-lg border border-slate-700 max-w-full overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${calculation.plyCalculations[0]?.grid?.cols || 2}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: calculation.plyCalculations[0]?.bestYield || 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-10 sm:w-12 h-14 sm:h-16 bg-orange-600/20 border border-orange-500/50 rounded flex items-center justify-center text-[10px] font-mono font-bold text-orange-400"
                  >
                    #{i + 1}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-slate-500">
                Finished Size: {finishedW}" × {finishedH}"
              </span>
            </div>

            {/* Paper Calculation Stats */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Net Sheets</span>
                <span className="font-bold text-slate-900">
                  {calculation.plyCalculations[0]?.netSheets || 0}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Wastage Buffer</span>
                <span className="font-bold text-amber-600">
                  +{calculation.plyCalculations[0]?.wastage || 5}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Total Sheets</span>
                <span className="font-bold text-slate-900">
                  {calculation.plyCalculations[0]?.grossSheets || 0}
                </span>
              </div>
            </div>
          </div>

          {/* FINANCIAL SUMMARY & BARGAINING PANEL */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                Quotation &amp; Commercials
              </span>
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="text-2xl font-black text-white">
                    ₹{calculation.grandTotal.toLocaleString("en-IN")}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Net Payable Amount
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Unit Cost</span>
                  <span className="text-sm font-bold text-orange-400">
                    ₹{Math.round(calculation.finalSellingPrice / calculation.qty)} / Book
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Sales Executive Negotiated Selling Price Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Selling Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Recommended: ₹${calculation.recommendedSellingPrice}`}
                    value={manualSellingPrice}
                    onChange={(e) => setManualSellingPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Recommended standard price: ₹{calculation.recommendedSellingPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Client Info Inputs */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Client Information (For Quotation):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Phone / WhatsApp"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleAddToQuote}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  {addedSuccess ? "Added to Quote Cart!" : "Add to Client Quote Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiDownload className="w-4 h-4 text-orange-600" />
                  {isGeneratingPdf ? "Generating PDF..." : "Download Official PDF Quote"}
                </button>
              </div>
            </div>

            {/* MANAGER / ADMIN COST FIREWALL (Only visible to Admin role) */}
            {isAdmin && (
              <div className="p-4 bg-amber-50/60 border-t border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <FiShield className="w-4 h-4 text-amber-600" />
                    Manager Production Audit (Confidential)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      calculation.isLossMaking
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {calculation.profitMarginPercent}% Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">Total Vendor Cost:</span>
                    <span className="font-bold text-slate-900">
                      ₹{calculation.totalVendorCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Net Company Profit:</span>
                    <span
                      className={`font-black ${
                        calculation.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      ₹{calculation.netProfit.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {calculation.isLossMaking && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[10px] font-bold flex items-center gap-1.5 mt-2">
                    <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Warning: Selling price is below vendor production cost!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
