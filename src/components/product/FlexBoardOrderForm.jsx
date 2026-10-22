import React, { useState, useMemo, useEffect } from "react";
import { FiPackage, FiLayers, FiCheck, FiInfo, FiSliders, FiTool, FiCheckCircle, FiEdit3, FiTag, FiFileText, FiDownload, FiPlus, FiTrash2, FiUser, FiPhone } from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import FlexFramePreview from "./FlexFramePreview";
import { generateFlexQuotationPdf } from "@/lib/generateQuotationPdf";

const FLEX_MATERIALS = [
  { label: "Normal Flex - ₹15 / sqft", name: "Normal Flex", pricePerSqFt: 15 },
  { label: "Star Flex - ₹25 / sqft", name: "Star Flex", pricePerSqFt: 25 },
  { label: "Mini Star Flex - ₹17 / sqft", name: "Mini Star Flex", pricePerSqFt: 17 },
  { label: "Black Out Flex - ₹18 / sqft", name: "Black Out Flex", pricePerSqFt: 18 },
  { label: "Custom Flex (Manual Price)", name: "Custom Flex", pricePerSqFt: 15 },
];

const BOARD_TYPES = [
  { label: "Not Required", name: "None", ratePerFt: 0 },
  { label: "Iron Board - ₹35 / running ft", name: "Iron Board", ratePerFt: 35 },
  { label: "Wooden Board - ₹25 / running ft", name: "Wooden Board", ratePerFt: 25 },
];

export default function FlexBoardOrderForm({ product, onVariantSelect }) {
  const { addToQuote, clientInfo, updateClientInfo } = useQuote();

  // State
  const [clientName, setClientName] = useState(clientInfo?.clientName || "");
  const [clientPhone, setClientPhone] = useState(clientInfo?.phone || "");

  useEffect(() => {
    if (clientInfo?.clientName && !clientName) {
      setClientName(clientInfo.clientName);
    }
    if (clientInfo?.phone && !clientPhone) {
      setClientPhone(clientInfo.phone);
    }
  }, [clientInfo]);

  const [selectedMaterialLabel, setSelectedMaterialLabel] = useState(
    FLEX_MATERIALS[0].label
  );
  const [flexRatePerSqFt, setFlexRatePerSqFt] = useState(
    FLEX_MATERIALS[0].pricePerSqFt
  );
  const [height, setHeight] = useState(9);
  const [width, setWidth] = useState(18);
  const [boardType, setBoardType] = useState("None");
  const [boardRatePerFt, setBoardRatePerFt] = useState(35);
  const [hasSupportRod, setHasSupportRod] = useState("No");
  const [supportRodType, setSupportRodType] = useState("Horizontal");
  const [supportRodCount, setSupportRodCount] = useState(1);
  const [customRodLength, setCustomRodLength] = useState(3);

  const [hasFitting, setHasFitting] = useState("No");
  const [manualFittingPrice, setManualFittingPrice] = useState(0);
  const [hasAngle, setHasAngle] = useState("No");
  const [angleCount, setAngleCount] = useState(1);
  const [hasAnglePatti, setHasAnglePatti] = useState("No");
  const [anglePattiCount, setAnglePattiCount] = useState(1);
  const [customHardwareList, setCustomHardwareList] = useState([]);
  const [newHardwareName, setNewHardwareName] = useState("");
  const [newHardwarePrice, setNewHardwarePrice] = useState("");
  const [discount, setDiscount] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfGeneratedSuccess, setPdfGeneratedSuccess] = useState(false);

  const handleAddCustomHardware = () => {
    const trimmedName = newHardwareName.trim();
    if (!trimmedName) return;

    const priceNum = parseFloat(newHardwarePrice);
    const validPrice = isNaN(priceNum) ? 0 : Math.max(0, priceNum);

    const newItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      name: trimmedName,
      price: validPrice,
    };

    setCustomHardwareList((prev) => [...prev, newItem]);
    setNewHardwareName("");
    setNewHardwarePrice("");
  };

  const handleRemoveCustomHardware = (id) => {
    setCustomHardwareList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCustomHardware = (id, field, value) => {
    setCustomHardwareList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: field === "price" ? Math.max(0, parseFloat(value) || 0) : value,
          };
        }
        return item;
      })
    );
  };

  const handleMaterialChange = (newLabel) => {
    setSelectedMaterialLabel(newLabel);
    const matched = FLEX_MATERIALS.find((m) => m.label === newLabel);
    if (matched) {
      setFlexRatePerSqFt(matched.pricePerSqFt);
    }
    if (onVariantSelect) onVariantSelect(newLabel);
  };

  const handleBoardTypeChange = (newType) => {
    setBoardType(newType);
    const matched = BOARD_TYPES.find((b) => b.name === newType);
    if (matched && matched.ratePerFt > 0) {
      setBoardRatePerFt(matched.ratePerFt);
    }
  };

  const validFlexRate = Math.max(0.1, Number(flexRatePerSqFt) || 0);

  // Active flex material details with dynamic manual price
  const activeMaterial = useMemo(() => {
    const base =
      FLEX_MATERIALS.find((m) => m.label === selectedMaterialLabel) ||
      FLEX_MATERIALS[0];
    return {
      ...base,
      pricePerSqFt: validFlexRate,
      defaultRate: base.pricePerSqFt,
      isCustomPrice: validFlexRate !== base.pricePerSqFt,
    };
  }, [selectedMaterialLabel, validFlexRate]);

  const validBoardRate =
    boardType === "None" ? 0 : Math.max(0, Number(boardRatePerFt) || 0);

  // Active board type details with dynamic manual price
  const activeBoard = useMemo(() => {
    const base =
      BOARD_TYPES.find((b) => b.name === boardType) || BOARD_TYPES[0];
    return {
      ...base,
      ratePerFt: validBoardRate,
      defaultRate: base.ratePerFt,
      isCustomPrice: base.name !== "None" && validBoardRate !== base.ratePerFt,
    };
  }, [boardType, validBoardRate]);

  // Height & Width Calculations
  const validHeight = Math.max(0.1, Number(height) || 0);
  const validWidth = Math.max(0.1, Number(width) || 0);
  const flexAreaSqFt = Math.round(validHeight * validWidth * 100) / 100;
  const flexPrintingPricePerUnit = Math.round(flexAreaSqFt * validFlexRate * 100) / 100;

  // Running Feet Calculation for Board
  const runningFeetDetails = useMemo(() => {
    if (boardType === "None") {
      return { totalRunningFeet: 0, formula: "0 ft", outerPerimeter: 0, supportRunningFeet: 0 };
    }

    const outerPerimeter = validHeight + validWidth + validHeight + validWidth;
    let supportRunningFeet = 0;
    let rodLenText = "";

    if (hasSupportRod === "Yes" && supportRodCount > 0) {
      if (supportRodType === "Horizontal") {
        supportRunningFeet = validWidth * supportRodCount;
        rodLenText = `${validWidth} ft`;
      } else if (supportRodType === "Vertical") {
        supportRunningFeet = validHeight * supportRodCount;
        rodLenText = `${validHeight} ft`;
      } else if (supportRodType === "Custom") {
        const len = Number(customRodLength) || 0;
        supportRunningFeet = len * supportRodCount;
        rodLenText = `${len} ft`;
      }
    }

    const totalRunningFeet = outerPerimeter + supportRunningFeet;

    // Formula text matching user's handwriting (e.g. 8 + 3 + 8 + 3 + 3)
    const formulaParts = [validHeight, validWidth, validHeight, validWidth];
    if (hasSupportRod === "Yes" && supportRodCount > 0) {
      for (let i = 0; i < supportRodCount; i++) {
        formulaParts.push(rodLenText);
      }
    }
    const formula = formulaParts.join(" + ");

    return {
      outerPerimeter,
      supportRunningFeet,
      totalRunningFeet: Math.round(totalRunningFeet * 100) / 100,
      formula,
    };
  }, [
    boardType,
    validHeight,
    validWidth,
    hasSupportRod,
    supportRodType,
    supportRodCount,
    customRodLength,
  ]);

  const boardCostPerUnit = Math.round(runningFeetDetails.totalRunningFeet * activeBoard.ratePerFt * 100) / 100;

  // Fitting Charges (Manual custom price)
  const fittingChargesTotal = useMemo(() => {
    if (hasFitting !== "Yes") return 0;
    return Math.max(0, Number(manualFittingPrice) || 0);
  }, [hasFitting, manualFittingPrice]);

  // Angle Charges (₹450 per unit)
  const angleUnits = hasAngle === "Yes" ? Math.max(1, Number(angleCount) || 1) : 0;
  const angleCostPerUnit = angleUnits * 450;

  // Angle Patti Charges (₹100 per patti unit)
  const pattiUnits = hasAnglePatti === "Yes" ? Math.max(1, Number(anglePattiCount) || 1) : 0;
  const anglePattiCostPerUnit = pattiUnits * 100;

  // Custom Hardware Total
  const customHardwareTotal = useMemo(() => {
    return customHardwareList.reduce(
      (sum, item) => sum + (Math.max(0, Number(item.price) || 0)),
      0
    );
  }, [customHardwareList]);

  // Total Unit Cost & Order Subtotal
  const singleUnitCost = flexPrintingPricePerUnit + boardCostPerUnit + angleCostPerUnit + anglePattiCostPerUnit;
  const grossSubtotal = Math.round((singleUnitCost * quantity + fittingChargesTotal + customHardwareTotal) * 100) / 100;
  const discountAmount = Math.max(0, Number(discount) || 0);
  const validDiscount = Math.min(grossSubtotal, discountAmount);
  const totalAmount = Math.max(0, Math.round((grossSubtotal - validDiscount) * 100) / 100);

  const handleAddOrder = (e) => {
    e.preventDefault();

    const selectedOptionsSummary = {
      "Flex Subcategory": `${activeMaterial.name} (₹${activeMaterial.pricePerSqFt}/sqft)${activeMaterial.isCustomPrice ? " [Manual Rate]" : ""}`,
      "Dimensions": `${validHeight} ft × ${validWidth} ft (${flexAreaSqFt} sqft)`,
      "Flex Printing Price": `Rs. ${flexPrintingPricePerUnit.toLocaleString()}/-`,
      "Board Structure": activeBoard.name !== "None"
        ? `${activeBoard.name} (${runningFeetDetails.totalRunningFeet} Running Ft @ ₹${activeBoard.ratePerFt}/ft)${activeBoard.isCustomPrice ? " [Manual Rate]" : ""}`
        : "Not Required",
      "Support Rods": hasSupportRod === "Yes"
        ? `${supportRodCount} Rod(s) [${supportRodType}]`
        : "Not Required",
      "Fitting Charges":
        hasFitting === "Yes"
          ? `Rs. ${fittingChargesTotal}/- (Manual Price)`
          : "Not Required",
      "Angle":
        hasAngle === "Yes"
          ? `${angleUnits} unit(s) (Rs. ${(angleCostPerUnit * quantity).toLocaleString()}/-)`
          : "Not Required",
      "Angle Patti": hasAnglePatti === "Yes" ? `${pattiUnits} unit(s) (Rs. ${anglePattiCostPerUnit * quantity}/-)` : "Not Required",
      ...(customHardwareList.length > 0
        ? customHardwareList.reduce((acc, item) => {
            acc[`Custom Hardware: ${item.name}`] = `Rs. ${Number(item.price || 0).toLocaleString()}/-`;
            return acc;
          }, {})
        : {}),
      ...(validDiscount > 0 ? { "Discount Applied": `- Rs. ${validDiscount.toLocaleString()}/-` } : {}),
    };

    const calculation = {
      quantity,
      baseUnitPrice: singleUnitCost,
      optionsTotal: 0,
      subtotal: grossSubtotal,
      discount: validDiscount,
      gstRate: 0,
      gstAmount: 0,
      totalAmount,
      perUnitFinal: Math.round((totalAmount / quantity) * 100) / 100,
      details: {
        flexPrintingPricePerUnit,
        boardCostPerUnit,
        fittingChargesTotal,
        hasFitting,
        angleCostPerUnit,
        angleUnits,
        anglePattiCostPerUnit,
        customHardwareTotal,
        customHardwareList,
        runningFeetDetails,
        grossSubtotal,
        discount: validDiscount,
      },
    };

    const activeProduct = {
      ...product,
      name: `Flex Board (${activeMaterial.name} ${validHeight}x${validWidth} ft)`,
      code: activeMaterial.name === "Star Flex" ? "FB-102" : activeMaterial.name === "Mini Star Flex" ? "FB-103" : activeMaterial.name === "Black Out Flex" ? "FB-104" : "FB-101",
    };

    addToQuote(activeProduct, selectedOptionsSummary, quantity, calculation);
    setAddedSuccess(true);

    // Auto-generate official PDF quotation on adding order
    try {
      handleGeneratePdf();
    } catch (err) {
      console.warn("Could not generate PDF quotation on order submission:", err);
    }

    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    try {
      if (clientName || clientPhone) {
        updateClientInfo({ clientName, phone: clientPhone });
      }

      generateFlexQuotationPdf({
        activeMaterial,
        validHeight,
        validWidth,
        flexAreaSqFt,
        flexPrintingPricePerUnit,
        activeBoard,
        runningFeetDetails,
        boardCostPerUnit,
        hasSupportRod,
        supportRodCount,
        supportRodType,
        customRodLength,
        hasFitting,
        fittingChargesTotal,
        hasAngle,
        angleUnits,
        angleCostPerUnit,
        hasAnglePatti,
        pattiUnits,
        anglePattiCostPerUnit,
        customHardwareList,
        customHardwareTotal,
        quantity,
        grossSubtotal,
        validDiscount,
        totalAmount,
        clientInfo: {
          clientName: clientName.trim() || clientInfo?.clientName || "Walk-in Client",
          phone: clientPhone.trim() || clientInfo?.phone || "",
        },
      });
      setPdfGeneratedSuccess(true);
      setTimeout(() => setPdfGeneratedSuccess(false), 3000);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  return (
    <form onSubmit={handleAddOrder} className="space-y-6 text-slate-800">
      {/* 1. SELECT FLEX SUBCATEGORY & MANUAL PRICE */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FiLayers className="w-4 h-4 text-orange-600" />
            1. Select Flex Subcategory & Price
          </label>
          <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
            ₹{validFlexRate} / sq. ft.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Subcategory Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Flex Subcategory
            </label>
            <select
              value={selectedMaterialLabel}
              onChange={(e) => handleMaterialChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-orange-600 focus:outline-none cursor-pointer"
            >
              {FLEX_MATERIALS.map((mat) => (
                <option key={mat.label} value={mat.label}>
                  {mat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Manual Rate Entry & Steppers */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 block">
                Rate per Sq. Ft. (₹)
              </label>
              <span className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                <FiEdit3 className="w-3 h-3" /> Manual Price
              </span>
            </div>

            <div className="flex items-center border border-orange-300 rounded-lg overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-orange-500">
              <button
                type="button"
                onClick={() =>
                  setFlexRatePerSqFt((prev) =>
                    Math.max(1, Math.round(((Number(prev) || 1) - 1) * 10) / 10)
                  )
                }
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-r border-slate-300 select-none active:bg-slate-300"
                aria-label="Decrease flex rate"
                title="Decrease rate by ₹1"
              >
                -
              </button>
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={flexRatePerSqFt}
                  onChange={(e) => setFlexRatePerSqFt(e.target.value)}
                  placeholder="Rate per sqft"
                  className="w-full pl-7 pr-3 py-2 text-xs font-bold text-slate-900 text-center bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button
                type="button"
                onClick={() =>
                  setFlexRatePerSqFt((prev) =>
                    Math.round(((Number(prev) || 0) + 1) * 10) / 10
                  )
                }
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-l border-slate-300 select-none active:bg-slate-300"
                aria-label="Increase flex rate"
                title="Increase rate by ₹1"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic calculation feedback & reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] pt-1 text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
          <div>
            <span>Calculated Flex Printing Cost: </span>
            <strong className="text-slate-900 font-bold">
              {flexAreaSqFt} sqft × ₹{validFlexRate}/sqft = ₹{flexPrintingPricePerUnit.toLocaleString()}
            </strong>
          </div>
          {activeMaterial.isCustomPrice && (
            <button
              type="button"
              onClick={() => setFlexRatePerSqFt(activeMaterial.defaultRate)}
              className="text-[10px] text-orange-600 hover:underline font-bold self-start sm:self-auto flex items-center gap-1"
            >
              Reset to default (₹{activeMaterial.defaultRate}/sqft)
            </button>
          )}
        </div>
      </div>

      {/* 2. DYNAMIC FLEX BOARD DIMENSIONS (HEIGHT & WIDTH IN FEET) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FiSliders className="w-4 h-4 text-orange-600" />
            2. Flex Board Size (In Feet)
          </span>
          <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            {flexAreaSqFt} sq. ft.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Height (Feet)
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
              <button
                type="button"
                onClick={() => setHeight(Math.max(0.5, Math.round(((Number(height) || 1) - 0.5) * 10) / 10))}
                className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs border-r border-slate-300 select-none active:bg-slate-400"
                aria-label="Decrease Height"
              >
                -
              </button>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-2 py-1.5 text-xs text-center font-bold text-slate-900 bg-slate-50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setHeight(Math.round(((Number(height) || 0) + 0.5) * 10) / 10)}
                className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs border-l border-slate-300 select-none active:bg-slate-400"
                aria-label="Increase Height"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 block">
              Width (Feet)
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50 shadow-2xs">
              <button
                type="button"
                onClick={() => setWidth(Math.max(0.5, Math.round(((Number(width) || 1) - 0.5) * 10) / 10))}
                className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs border-r border-slate-300 select-none active:bg-slate-400"
                aria-label="Decrease Width"
              >
                -
              </button>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-2 py-1.5 text-xs text-center font-bold text-slate-900 bg-slate-50 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => setWidth(Math.round(((Number(width) || 0) + 0.5) * 10) / 10)}
                className="px-2.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-extrabold text-xs border-l border-slate-300 select-none active:bg-slate-400"
                aria-label="Increase Width"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Flex Price Summary Banner */}
        <div className="bg-orange-50/80 rounded-lg p-3 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center space-x-2 text-orange-950 font-medium">
            <FiInfo className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span>
              Flex Price ({flexAreaSqFt} sqft × ₹{activeMaterial.pricePerSqFt}):
            </span>
          </div>
          <span className="font-extrabold text-orange-700 text-sm">
            Rs. {flexPrintingPricePerUnit.toLocaleString()}/-
          </span>
        </div>
      </div>

      {/* 3. BOARD STRUCTURE & RUNNING FEET CALCULATION */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FiTool className="w-4 h-4 text-orange-600" />
            3. Board Frame & Support Structure
          </span>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 self-start sm:self-auto">
            {boardType === "None" ? "Not Required" : `₹${activeBoard.ratePerFt}/running ft`}
          </span>
        </div>

        {/* Board Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 block">
            Select Board Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {BOARD_TYPES.map((b) => (
              <button
                type="button"
                key={b.name}
                onClick={() => handleBoardTypeChange(b.name)}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold transition-all border ${
                  boardType === b.name
                    ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {b.name === "None" ? "Not Required" : b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Board Rate Entry (If Board Selected) */}
        {boardType !== "None" && (
          <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FiEdit3 className="w-3.5 h-3.5 text-orange-600" />
                  {activeBoard.name} Rate per Running Foot (₹)
                </label>
                <span className="text-[10px] text-slate-500">
                  Preset default: ₹{activeBoard.defaultRate}/ft • Edit or use +/- steppers
                </span>
              </div>

              {/* Rate Steppers & Input */}
              <div className="flex items-center border border-orange-300 rounded-lg overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-orange-500 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() =>
                    setBoardRatePerFt((prev) =>
                      Math.max(1, Math.round(((Number(prev) || 1) - 1) * 10) / 10)
                    )
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-r border-slate-300 select-none active:bg-slate-300"
                  aria-label="Decrease board rate"
                  title="Decrease rate by ₹1"
                >
                  -
                </button>
                <div className="relative flex-1 flex items-center min-w-[95px]">
                  <span className="absolute left-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={boardRatePerFt}
                    onChange={(e) => setBoardRatePerFt(e.target.value)}
                    placeholder="Rate per ft"
                    className="w-full pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900 text-center bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[10px] text-slate-400 font-semibold pr-2">/ft</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setBoardRatePerFt((prev) =>
                      Math.round(((Number(prev) || 0) + 1) * 10) / 10
                    )
                  }
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs border-l border-slate-300 select-none active:bg-slate-300"
                  aria-label="Increase board rate"
                  title="Increase rate by ₹1"
                >
                  +
                </button>
              </div>
            </div>

            {/* Live calculation info & Reset */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] pt-1 text-slate-600 border-t border-orange-200/60">
              <div>
                <span>Structure Framing Cost: </span>
                <strong className="text-slate-900 font-bold">
                  {runningFeetDetails.totalRunningFeet} running ft × ₹{validBoardRate}/ft = ₹{boardCostPerUnit.toLocaleString()}
                </strong>
              </div>
              {activeBoard.isCustomPrice && (
                <button
                  type="button"
                  onClick={() => setBoardRatePerFt(activeBoard.defaultRate)}
                  className="text-[10px] text-orange-600 hover:underline font-bold self-start sm:self-auto flex items-center gap-1"
                >
                  Reset to default (₹{activeBoard.defaultRate}/ft)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Support Rod Options (If Board Selected) */}
        {boardType !== "None" && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800">
                Add Support Rod / Mid Stick?
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setHasSupportRod("No")}
                  className={`px-3 py-1 text-[11px] font-bold rounded ${
                    hasSupportRod === "No"
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-600 border border-slate-300"
                  }`}
                >
                  Not Required
                </button>
                <button
                  type="button"
                  onClick={() => setHasSupportRod("Yes")}
                  className={`px-3 py-1 text-[11px] font-bold rounded ${
                    hasSupportRod === "Yes"
                      ? "bg-orange-600 text-white"
                      : "bg-white text-slate-600 border border-slate-300"
                  }`}
                >
                  Add Rod
                </button>
              </div>
            </div>

            {hasSupportRod === "Yes" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    Rod Orientation
                  </label>
                  <select
                    value={supportRodType}
                    onChange={(e) => setSupportRodType(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="Horizontal">Horizontal ({validWidth} ft)</option>
                    <option value="Vertical">Vertical ({validHeight} ft)</option>
                    <option value="Custom">Custom Length</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 block">
                    Number of Rods
                  </label>
                  <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                    <button
                      type="button"
                      onClick={() => setSupportRodCount(Math.max(1, supportRodCount - 1))}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-r border-slate-300 select-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={supportRodCount}
                      onChange={(e) => setSupportRodCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-1 py-1 text-xs bg-white text-center font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSupportRodCount(supportRodCount + 1)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-l border-slate-300 select-none"
                    >
                      +
                    </button>
                  </div>
                </div>

                {supportRodType === "Custom" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600 block">
                      Custom Length (Ft)
                    </label>
                    <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setCustomRodLength(Math.max(0.5, Math.round(((Number(customRodLength) || 1) - 0.5) * 10) / 10))}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-r border-slate-300 select-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={customRodLength}
                        onChange={(e) => setCustomRodLength(e.target.value)}
                        className="w-full px-1 py-1 text-xs bg-white text-center font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomRodLength(Math.round(((Number(customRodLength) || 0) + 0.5) * 10) / 10)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-l border-slate-300 select-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Dynamic 2D SVG Frame & Running Feet Diagram Preview */}
        <FlexFramePreview
          height={validHeight}
          width={validWidth}
          boardType={boardType}
          supportRodType={supportRodType}
          supportRodCount={supportRodCount}
          customRodLength={customRodLength}
          runningFeetDetails={runningFeetDetails}
        />
      </div>

      {/* 4. ADDITIONAL HARDWARE & SERVICE OPTIONS */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-200 text-xs">
        <div className="px-4 py-3 bg-slate-50 font-black text-xs uppercase tracking-wider text-slate-900">
          4. ADDITIONAL HARDWARE & FITTING OPTIONS
        </div>

        {/* Fitting Charges Option */}
        <div className="p-3.5 sm:px-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-900 block">Fitting Charges</span>
              <span className="text-[11px] text-slate-500">
                {hasFitting === "Yes"
                  ? "Manual custom fitting / installation charges"
                  : "Not required (₹0)"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setHasFitting("No")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  hasFitting === "No"
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                Not Required
              </button>
              <button
                type="button"
                onClick={() => setHasFitting("Yes")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                  hasFitting === "Yes"
                    ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <FiEdit3 className="w-3.5 h-3.5" />
                <span>Manual Price {hasFitting === "Yes" && fittingChargesTotal > 0 ? `(+₹${fittingChargesTotal})` : ""}</span>
              </button>
            </div>
          </div>

          {/* Manual Fitting Price Input */}
          {hasFitting === "Yes" && (
            <div className="p-3 bg-orange-50/70 rounded-lg border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5 text-orange-950 font-bold text-xs">
                  <FiEdit3 className="w-3.5 h-3.5 text-orange-600" />
                  <span>Enter Fitting Charges (₹):</span>
                </div>
                <p className="text-[10px] text-orange-700">
                  Type any custom fitting amount or use +/- buttons
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center border border-orange-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setManualFittingPrice((prev) => Math.max(0, (Number(prev) || 0) - 50))}
                    className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 font-extrabold text-xs border-r border-orange-200 select-none active:bg-orange-200"
                    aria-label="Decrease fitting charges"
                  >
                    -
                  </button>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={manualFittingPrice}
                      onChange={(e) => setManualFittingPrice(e.target.value)}
                      placeholder="0"
                      className="w-28 pl-6 pr-2.5 py-1.5 text-xs text-center font-bold text-slate-900 bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setManualFittingPrice((prev) => (Number(prev) || 0) + 50)}
                    className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 font-extrabold text-xs border-l border-orange-200 select-none active:bg-orange-200"
                    aria-label="Increase fitting charges"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Angle Option */}
        <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 block">Angle Price</span>
            <span className="text-[11px] text-slate-500">
              ₹450 per unit {hasAngle === "Yes" && `(${angleUnits} unit${angleUnits > 1 ? "s" : ""} = ₹${angleCostPerUnit})`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setHasAngle("No")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hasAngle === "No"
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Not Required
            </button>
            <button
              type="button"
              onClick={() => setHasAngle("Yes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hasAngle === "Yes"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Required
            </button>
            {hasAngle === "Yes" && (
              <div className="flex items-center space-x-1 pl-2">
                <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setAngleCount(Math.max(1, angleCount - 1))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-r border-slate-300 select-none active:bg-slate-300"
                    aria-label="Decrease angle count"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={angleCount}
                    onChange={(e) => setAngleCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-12 px-1 py-1 text-center font-bold bg-white text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAngleCount(angleCount + 1)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-l border-slate-300 select-none active:bg-slate-300"
                    aria-label="Increase angle count"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Angle Patti Option */}
        <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 block">Angle Patti</span>
            <span className="text-[11px] text-slate-500">₹100 per patti unit</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setHasAnglePatti("No")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hasAnglePatti === "No"
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Not Required
            </button>
            <button
              type="button"
              onClick={() => setHasAnglePatti("Yes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hasAnglePatti === "Yes"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Required
            </button>
            {hasAnglePatti === "Yes" && (
              <div className="flex items-center space-x-1 pl-2">
                <div className="flex items-center border border-slate-300 rounded overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setAnglePattiCount(Math.max(1, anglePattiCount - 1))}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-r border-slate-300 select-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={anglePattiCount}
                    onChange={(e) => setAnglePattiCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-12 px-1 py-1 text-center font-bold bg-white text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAnglePattiCount(anglePattiCount + 1)}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border-l border-slate-300 select-none"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] font-bold text-orange-600">Unit(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Custom Hardware / Fitting Items (Manual Add) */}
        <div className="p-3.5 sm:px-4 space-y-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <FiTool className="w-4 h-4 text-orange-600" />
                <span className="font-bold text-slate-900 block">Custom Hardware & Fitting Items</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Manually add custom hardware, scaffolding, clamps, or services with custom item name and price
              </span>
            </div>
            {customHardwareList.length > 0 && (
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200 self-start sm:self-auto">
                Total Custom: +₹{customHardwareTotal.toLocaleString()}
              </span>
            )}
          </div>

          {/* List of Added Custom Items */}
          {customHardwareList.length > 0 && (
            <div className="space-y-2">
              {customHardwareList.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-orange-300 transition-colors"
                >
                  <span className="text-slate-400 font-mono text-[10px] w-4 text-center font-bold">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateCustomHardware(item.id, "name", e.target.value)}
                    placeholder="Item name"
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded font-semibold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                  <div className="flex items-center border border-slate-200 rounded overflow-hidden bg-slate-50 px-2 py-1">
                    <span className="text-xs font-bold text-slate-400 mr-1">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => handleUpdateCustomHardware(item.id, "price", e.target.value)}
                      placeholder="0"
                      className="w-20 text-xs font-bold text-slate-900 bg-transparent text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomHardware(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="Delete item"
                    aria-label={`Delete ${item.name}`}
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Custom Item Input Row */}
          <div className="p-3 bg-white rounded-lg border border-dashed border-orange-300/80 space-y-2">
            <span className="text-[10px] font-bold text-orange-950 uppercase tracking-wider block">
              + Add Custom Item with Name & Price
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newHardwareName}
                onChange={(e) => setNewHardwareName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomHardware();
                  }
                }}
                placeholder="Item name (e.g. Scaffolding, Extra Clamps, Lighting)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                <span className="pl-3 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  value={newHardwarePrice}
                  onChange={(e) => setNewHardwarePrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomHardware();
                    }
                  }}
                  placeholder="Price"
                  className="w-28 px-2 py-1.5 text-xs font-bold text-slate-900 text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomHardware}
                disabled={!newHardwareName.trim()}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quantity Row */}
        <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <FiPackage className="w-4 h-4 text-orange-600 flex-shrink-0" />
            <span>Total Boards Quantity</span>
          </div>
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm border-r border-slate-300 select-none active:bg-slate-300 transition-colors"
              aria-label="Decrease Quantity"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-20 px-2 py-1.5 text-center font-extrabold text-slate-900 bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm border-l border-slate-300 select-none active:bg-slate-300 transition-colors"
              aria-label="Increase Quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* ITEMIZED PRICE BREAKDOWN TABLE */}
      <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs divide-y divide-slate-200 text-xs">
        <div className="px-4 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-wider flex justify-between items-center">
          <span>Cost Calculation Summary</span>
          <span className="text-orange-400 font-normal text-[11px]">
            {quantity} {quantity === 1 ? "Board" : "Boards"}
          </span>
        </div>

        <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700">
          <span>Flex Printing ({flexAreaSqFt} sqft @ ₹{activeMaterial.pricePerSqFt})</span>
          <span className="font-bold text-slate-900">
            Rs. {(flexPrintingPricePerUnit * quantity).toLocaleString()}/-
          </span>
        </div>

        {boardType !== "None" && (
          <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700">
            <span>
              {activeBoard.name} ({runningFeetDetails.totalRunningFeet} ft @ ₹{activeBoard.ratePerFt}/ft)
            </span>
            <span className="font-bold text-slate-900">
              Rs. {(boardCostPerUnit * quantity).toLocaleString()}/-
            </span>
          </div>
        )}

        {hasFitting === "Yes" && (
          <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700">
            <span>Fitting Charges (Manual Price)</span>
            <span className="font-bold text-slate-900">
              Rs. {fittingChargesTotal.toLocaleString()}/-
            </span>
          </div>
        )}

        {hasAngle === "Yes" && (
          <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700">
            <span>
              Angle Charges ({angleUnits} unit{angleUnits > 1 ? "s" : ""} @ ₹450{quantity > 1 ? ` × ${quantity}` : ""})
            </span>
            <span className="font-bold text-slate-900">
              Rs. {(angleCostPerUnit * quantity).toLocaleString()}/-
            </span>
          </div>
        )}

        {hasAnglePatti === "Yes" && (
          <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700">
            <span>Angle Patti ({pattiUnits} units @ ₹100)</span>
            <span className="font-bold text-slate-900">
              Rs. {(anglePattiCostPerUnit * quantity).toLocaleString()}/-
            </span>
          </div>
        )}

        {/* Custom Hardware & Fitting Options */}
        {customHardwareList.map((item) => (
          <div
            key={item.id}
            className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700 bg-orange-50/25"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <FiTool className="w-3.5 h-3.5 text-orange-600" />
              {item.name || "Custom Item"} (Hardware)
            </span>
            <span className="font-bold text-slate-900">
              Rs. {Number(item.price || 0).toLocaleString()}/-
            </span>
          </div>
        ))}

        {/* Subtotal (Before Discount) */}
        <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700 bg-slate-50/50">
          <span className="font-bold text-slate-800">Subtotal Amount</span>
          <span className="font-bold text-slate-900">
            Rs. {grossSubtotal.toLocaleString()}/-
          </span>
        </div>

        {/* Discount in Rupees (₹) Input */}
        <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/40">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-1.5 text-amber-950 font-bold text-xs">
              <FiTag className="w-3.5 h-3.5 text-amber-600" />
              <span>Discount in Rupees (₹):</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Enter discount amount in ₹ to subtract from total
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-amber-300 rounded-lg overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setDiscount((prev) => Math.max(0, (Number(prev) || 0) - 50))}
                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-xs border-r border-amber-300 select-none active:bg-amber-300"
                aria-label="Decrease discount"
              >
                -
              </button>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  max={grossSubtotal}
                  step="50"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-24 pl-6 pr-2.5 py-1.5 text-xs text-center font-bold text-slate-900 bg-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setDiscount((prev) => Math.min(grossSubtotal, (Number(prev) || 0) + 50))}
                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-xs border-l border-amber-300 select-none active:bg-amber-300"
                aria-label="Increase discount"
              >
                +
              </button>
            </div>
            {validDiscount > 0 && (
              <button
                type="button"
                onClick={() => setDiscount(0)}
                className="px-2 py-1 text-[11px] font-bold text-red-600 hover:text-red-800 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                title="Remove discount"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Total Amount Payable */}
        <div className="p-4 flex justify-between items-center bg-orange-50/80">
          <div>
            <span className="font-extrabold text-slate-900 text-sm block">
              Total Amount Payable
            </span>
            {validDiscount > 0 && (
              <span className="text-[11px] text-emerald-700 font-bold block">
                Saved ₹{validDiscount.toLocaleString()} with discount
              </span>
            )}
          </div>
          <span className="font-black text-orange-700 text-base sm:text-lg">
            Rs. {totalAmount.toLocaleString()}/-
          </span>
        </div>

        {/* CLIENT INFORMATION FOR OFFICIAL QUOTATION */}
        <div className="p-3.5 sm:px-4 bg-slate-50/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FiUser className="w-3.5 h-3.5 text-orange-600" />
              Client Details (For Official Quotation PDF):
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Personalized Estimate</span>
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


      {/* ACTION BUTTONS: GENERATE QUOTATION PDF & ADD ORDER */}
      <div className="space-y-2 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={isGeneratingPdf}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2 border cursor-pointer ${
              pdfGeneratedSuccess
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.99]"
            }`}
          >
            {pdfGeneratedSuccess ? (
              <>
                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-emerald-700">Quotation PDF Downloaded!</span>
              </>
            ) : (
              <>
                <FiFileText className="w-4 h-4 text-orange-600" />
                <span>{isGeneratingPdf ? "Generating PDF..." : "Download Quotation (PDF)"}</span>
              </>
            )}
          </button>

          <button
            type="submit"
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              addedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-orange-600 text-white hover:bg-orange-700 active:scale-[0.99]"
            }`}
          >
            {addedSuccess ? (
              <>
                <FiCheckCircle className="w-4 h-4" />
                <span>Order Added & PDF Generated!</span>
              </>
            ) : (
              <>
                <FiPackage className="w-4 h-4" />
                <span>Add Order (Pay & Generate PDF)</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-center text-slate-400">
          Official PDF quotation is automatically generated with client-ready specifications and cost breakdown.
        </p>
      </div>
    </form>
  );
}
