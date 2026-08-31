import React, { useState, useMemo } from "react";
import { FiPackage, FiLayers, FiCheck, FiInfo, FiSliders, FiTool, FiCheckCircle } from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import FlexFramePreview from "./FlexFramePreview";

const FLEX_MATERIALS = [
  { label: "Normal Flex - ₹15 / sqft", name: "Normal Flex", pricePerSqFt: 15 },
  { label: "Star Flex - ₹25 / sqft", name: "Star Flex", pricePerSqFt: 25 },
  { label: "Mini Star Flex - ₹17 / sqft", name: "Mini Star Flex", pricePerSqFt: 17 },
  { label: "Black Out Flex - ₹18 / sqft", name: "Black Out Flex", pricePerSqFt: 18 },
];

const BOARD_TYPES = [
  { label: "Not Required", name: "None", ratePerFt: 0 },
  { label: "Iron Board - ₹35 / running ft", name: "Iron Board", ratePerFt: 35 },
  { label: "Wooden Board - ₹25 / running ft", name: "Wooden Board", ratePerFt: 25 },
];

export default function FlexBoardOrderForm({ product, onVariantSelect }) {
  const { addToQuote } = useQuote();

  // State
  const [selectedMaterialLabel, setSelectedMaterialLabel] = useState(
    FLEX_MATERIALS[0].label
  );
  const [height, setHeight] = useState(9);
  const [width, setWidth] = useState(18);
  const [boardType, setBoardType] = useState("None");
  const [hasSupportRod, setHasSupportRod] = useState("No");
  const [supportRodType, setSupportRodType] = useState("Horizontal");
  const [supportRodCount, setSupportRodCount] = useState(1);
  const [customRodLength, setCustomRodLength] = useState(3);

  const [hasFitting, setHasFitting] = useState("No");
  const [hasAngle, setHasAngle] = useState("No");
  const [hasAnglePatti, setHasAnglePatti] = useState("No");
  const [anglePattiCount, setAnglePattiCount] = useState(1);

  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Active flex material details
  const activeMaterial = useMemo(() => {
    return (
      FLEX_MATERIALS.find((m) => m.label === selectedMaterialLabel) ||
      FLEX_MATERIALS[0]
    );
  }, [selectedMaterialLabel]);

  // Active board type details
  const activeBoard = useMemo(() => {
    return (
      BOARD_TYPES.find((b) => b.name === boardType) || BOARD_TYPES[0]
    );
  }, [boardType]);

  // Height & Width Calculations
  const validHeight = Math.max(0.1, Number(height) || 0);
  const validWidth = Math.max(0.1, Number(width) || 0);
  const flexAreaSqFt = Math.round(validHeight * validWidth * 100) / 100;
  const flexPrintingPricePerUnit = Math.round(flexAreaSqFt * activeMaterial.pricePerSqFt * 100) / 100;

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

  // Fitting Charges (₹300 for 1st board, ₹200 for each additional board)
  const fittingChargesTotal = useMemo(() => {
    if (hasFitting !== "Yes") return 0;
    const qty = Math.max(1, Number(quantity) || 1);
    if (qty === 1) return 300;
    return 300 + (qty - 1) * 200;
  }, [hasFitting, quantity]);

  // Angle Charges (₹450 per unit board)
  const angleCostPerUnit = hasAngle === "Yes" ? 450 : 0;

  // Angle Patti Charges (₹100 per patti unit)
  const pattiUnits = hasAnglePatti === "Yes" ? Math.max(1, Number(anglePattiCount) || 1) : 0;
  const anglePattiCostPerUnit = pattiUnits * 100;

  // Total Unit Cost & Order Subtotal
  const singleUnitCost = flexPrintingPricePerUnit + boardCostPerUnit + angleCostPerUnit + anglePattiCostPerUnit;
  const totalAmount = Math.round((singleUnitCost * quantity + fittingChargesTotal) * 100) / 100;

  const handleAddOrder = (e) => {
    e.preventDefault();

    const selectedOptionsSummary = {
      "Flex Subcategory": `${activeMaterial.name} (₹${activeMaterial.pricePerSqFt}/sqft)`,
      "Dimensions": `${validHeight} ft × ${validWidth} ft (${flexAreaSqFt} sqft)`,
      "Flex Printing Price": `Rs. ${flexPrintingPricePerUnit.toLocaleString()}/-`,
      "Board Structure": activeBoard.name !== "None"
        ? `${activeBoard.name} (${runningFeetDetails.totalRunningFeet} Running Ft @ ₹${activeBoard.ratePerFt}/ft)`
        : "Not Required",
      "Support Rods": hasSupportRod === "Yes"
        ? `${supportRodCount} Rod(s) [${supportRodType}]`
        : "Not Required",
      "Fitting Charges": hasFitting === "Yes" ? `Rs. ${fittingChargesTotal}/-` : "Not Required",
      "Angle": hasAngle === "Yes" ? `Rs. ${angleCostPerUnit * quantity}/-` : "Not Required",
      "Angle Patti": hasAnglePatti === "Yes" ? `${pattiUnits} unit(s) (Rs. ${anglePattiCostPerUnit * quantity}/-)` : "Not Required",
    };

    const calculation = {
      quantity,
      baseUnitPrice: singleUnitCost,
      optionsTotal: 0,
      subtotal: totalAmount,
      gstRate: 0,
      gstAmount: 0,
      totalAmount,
      perUnitFinal: Math.round((totalAmount / quantity) * 100) / 100,
      details: {
        flexPrintingPricePerUnit,
        boardCostPerUnit,
        fittingChargesTotal,
        angleCostPerUnit,
        anglePattiCostPerUnit,
        runningFeetDetails,
      },
    };

    const activeProduct = {
      ...product,
      name: `Flex Board (${activeMaterial.name} ${validHeight}x${validWidth} ft)`,
      code: activeMaterial.name === "Star Flex" ? "FB-102" : activeMaterial.name === "Mini Star Flex" ? "FB-103" : activeMaterial.name === "Black Out Flex" ? "FB-104" : "FB-101",
    };

    addToQuote(activeProduct, selectedOptionsSummary, quantity, calculation);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleAddOrder} className="space-y-6 text-slate-800">
      {/* 1. SELECT FLEX SUBCATEGORY / MATERIAL */}
      <div className="space-y-1.5">
        <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
          1. SELECT FLEX SUBCATEGORY
        </label>
        <select
          value={selectedMaterialLabel}
          onChange={(e) => {
            setSelectedMaterialLabel(e.target.value);
            if (onVariantSelect) onVariantSelect(e.target.value);
          }}
          className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
        >
          {FLEX_MATERIALS.map((mat) => (
            <option key={mat.label} value={mat.label}>
              {mat.label}
            </option>
          ))}
        </select>
      </div>

      {/* 2. DYNAMIC FLEX BOARD DIMENSIONS (HEIGHT & WIDTH IN FEET) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FiSliders className="w-4 h-4 text-blue-600" />
            2. Flex Board Size (In Feet)
          </span>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
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
        <div className="bg-blue-50/80 rounded-lg p-3 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center space-x-2 text-blue-950 font-medium">
            <FiInfo className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Flex Price ({flexAreaSqFt} sqft × ₹{activeMaterial.pricePerSqFt}):
            </span>
          </div>
          <span className="font-extrabold text-blue-700 text-sm">
            Rs. {flexPrintingPricePerUnit.toLocaleString()}/-
          </span>
        </div>
      </div>

      {/* 3. BOARD STRUCTURE & RUNNING FEET CALCULATION */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FiTool className="w-4 h-4 text-blue-600" />
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
                onClick={() => setBoardType(b.name)}
                className={`py-2 px-2 text-center rounded-lg text-xs font-bold transition-all border ${
                  boardType === b.name
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {b.name === "None" ? "Not Required" : b.name}
              </button>
            ))}
          </div>
        </div>

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
                      ? "bg-blue-600 text-white"
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
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-300 rounded font-medium focus:ring-1 focus:ring-blue-500"
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
        <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 block">Fitting Charges</span>
            <span className="text-[11px] text-slate-500">
              ₹300 for 1st board + ₹200 for each extra board
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setHasFitting("No")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hasFitting === "No"
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Not Required
            </button>
            <button
              type="button"
              onClick={() => setHasFitting("Yes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                hasFitting === "Yes"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Required (+₹{fittingChargesTotal})
            </button>
          </div>
        </div>

        {/* Angle Option */}
        <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 block">Angle Price</span>
            <span className="text-[11px] text-slate-500">₹450 per unit board</span>
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
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              Required (+₹450)
            </button>
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
                  ? "bg-blue-600 text-white border-blue-600"
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
                <span className="text-[11px] font-bold text-blue-600">Unit(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Quantity Row */}
        <div className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-bold text-slate-900">
            <FiPackage className="w-4 h-4 text-blue-600 flex-shrink-0" />
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
          <span className="text-blue-400 font-normal text-[11px]">
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
              {activeBoard.name} ({runningFeetDetails.totalRunningFeet} ft @ ₹{activeBoard.ratePerFt})
            </span>
            <span className="font-bold text-slate-900">
              Rs. {(boardCostPerUnit * quantity).toLocaleString()}/-
            </span>
          </div>
        )}

        {hasFitting === "Yes" && (
          <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700">
            <span>Fitting Charges ({quantity} board{quantity > 1 ? "s" : ""})</span>
            <span className="font-bold text-slate-900">
              Rs. {fittingChargesTotal.toLocaleString()}/-
            </span>
          </div>
        )}

        {hasAngle === "Yes" && (
          <div className="p-3.5 sm:px-4 flex justify-between items-center text-slate-700">
            <span>Angle Charges (₹450 × {quantity})</span>
            <span className="font-bold text-slate-900">
              Rs. {(450 * quantity).toLocaleString()}/-
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

        <div className="p-4 flex justify-between items-center bg-blue-50/80">
          <span className="font-extrabold text-slate-900 text-sm">
            Total Amount Payable
          </span>
          <span className="font-black text-blue-700 text-base sm:text-lg">
            Rs. {totalAmount.toLocaleString()}/-
          </span>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
          addedSuccess
            ? "bg-emerald-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
        }`}
      >
        {addedSuccess ? (
          <>
            <FiCheckCircle className="w-5 h-5" />
            <span>Order Added to Cart / Quote!</span>
          </>
        ) : (
          <span>Add Order (Pay From Wallet)</span>
        )}
      </button>
    </form>
  );
}
