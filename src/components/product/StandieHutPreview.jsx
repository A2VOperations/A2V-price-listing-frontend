import React from "react";
import { FiMaximize2 } from "react-icons/fi";

export default function StandieHutPreview({
  totalWidth = 2.5,
  totalHeight = 4,
  legClearance = 1,
  frameType = "iron-3kg", // "iron-3kg" | "iron-5kg" | "wooden"
  mediaType = "star-flex", // "star-flex" | "normal-flex"
  flexRate = 30,
  frameRate = 35,
  runningFt = 30,
  hingesCount = 2,
  hingeRate = 15,
  isDoubleSided = true,
  unitTotal = 1680,
}) {
  const numW = parseFloat(totalWidth) || 2.5;
  const numH = parseFloat(totalHeight) || 4;
  const numLeg = parseFloat(legClearance) || (legClearance === 0 ? 0 : 1);
  const numHinges = Math.max(1, parseInt(hingesCount) || 2);
  const numHingePrice = Math.max(0, parseFloat(hingeRate) || 0);
  const hingesTotalCost = numHinges * numHingePrice;
  const numFlexH = numH;
  const totalFrameH = parseFloat((numH + numLeg).toFixed(2));
  const singleSideArea = parseFloat((numW * numFlexH).toFixed(2));
  const totalArea = parseFloat((singleSideArea * (isDoubleSided ? 2 : 1)).toFixed(2));

  const isWooden = frameType === "wooden";
  const isIron5kg = frameType === "iron-5kg";

  // Visual aspect ratio
  const ratio = Math.max(0.4, Math.min(0.9, numW / totalFrameH));
  const hutWidthPx = Math.round(Math.max(180, Math.min(260, 210 * (ratio / 0.62))));
  const hutHeightPx = 280;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col items-center justify-between select-none">
      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300 font-bold border border-slate-700">
            <FiMaximize2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              Standee Hut (A-Frame) Specification
              <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-mono font-semibold border border-slate-700">
                STD-003
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Total Frame: {numW} × {totalFrameH} ft • Flex: {numW} × {numFlexH} ft
            </span>
          </div>
        </div>

        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
            {isWooden
              ? "Wooden Frame"
              : isIron5kg
              ? "Heavy Iron (5 kg)"
              : "Light Iron (3 kg)"}
          </span>
        </div>
      </div>

      {/* Main A-Frame Elevation Stage */}
      <div className="relative py-8 flex flex-col items-center justify-center w-full min-h-[390px]">
        {/* Height dimension guide on left */}
        <div className="absolute left-2 sm:left-4 top-10 bottom-14 flex flex-col items-center justify-between text-[10px] text-slate-400">
          <div className="w-2.5 h-0.5 bg-slate-500" />
          <div className="h-full border-l border-dashed border-slate-600 relative flex items-center justify-center">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono whitespace-nowrap rotate-[-90deg] border border-slate-700">
              Total: {totalFrameH} ft ({numFlexH}' + {numLeg}' legs)
            </span>
          </div>
          <div className="w-2.5 h-0.5 bg-slate-500" />
        </div>

        {/* A-Frame Hut Rig Container */}
        <div
          className="relative transition-all duration-300 flex items-center justify-center"
          style={{ width: `${hutWidthPx + 40}px`, height: `${hutHeightPx}px` }}
        >
          {/* Top Apex Hinge Bar */}
          <div
            className={`absolute top-0 z-30 h-3 rounded border flex items-center justify-between px-2 ${
              isWooden
                ? "bg-amber-900/90 border-amber-800 text-amber-200"
                : "bg-slate-700 border-slate-600 text-slate-200"
            }`}
            style={{ width: `${hutWidthPx}px` }}
          >
            <span className="text-[7.5px] font-mono uppercase tracking-wider mx-auto">
              Apex Hinge Rail ({numHinges}x)
            </span>
          </div>

          {/* Rear Board Angled Perspective */}
          <div
            className="absolute top-1 z-0 rounded opacity-30 shadow-lg"
            style={{
              width: `${hutWidthPx - 8}px`,
              height: `${hutHeightPx - 10}px`,
              transform: "skewY(-3deg) rotate(-2deg) translate(16px, 6px)",
              background: isWooden ? "#78350f" : "#334155",
              border: isWooden ? "2px solid #92400e" : "2px solid #475569",
            }}
          />

          {/* Front Main A-Frame Face */}
          <div
            className={`relative z-20 rounded shadow-md flex flex-col justify-between ${
              isWooden
                ? "bg-slate-950 border-2 border-amber-800"
                : "bg-slate-950 border-2 border-slate-700"
            }`}
            style={{
              width: `${hutWidthPx}px`,
              height: `${hutHeightPx - 20}px`,
            }}
          >
            {/* Flex Banner Canvas Area */}
            <div className="w-full flex-1 relative flex flex-col justify-between p-3 overflow-hidden">
              <div className="text-center pt-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block">
                  A-Frame Tent Display
                </span>
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wide block mt-1">
                  {mediaType === "normal-flex" ? "Normal Flex" : "Star Flex"}
                </span>
              </div>

              {/* Center Dimension Marker */}
              <div className="text-center my-auto border border-slate-800 bg-slate-900/80 rounded p-2 mx-auto w-28">
                <span className="text-xs font-extrabold text-white font-mono block">
                  {numW}' × {numFlexH}'
                </span>
                <span className="text-[9px] text-orange-400 font-mono block mt-0.5">
                  {totalArea} sq.ft
                </span>
                <span className="text-[8px] text-slate-400 block mt-0.5">
                  {isDoubleSided ? "2 Sides (Tent)" : "Single Side"}
                </span>
              </div>

              {/* Bottom Specs */}
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-400 font-mono">
                <span>{numW} ft W × {numFlexH} ft H</span>
                <span>+{numLeg} ft Legs</span>
              </div>
            </div>

            {/* Bottom Support Rail */}
            <div className={`w-full h-2 flex items-center justify-center ${
              isWooden ? "bg-amber-900/70 border-t border-amber-800" : "bg-slate-800 border-t border-slate-700"
            }`}>
              <span className="text-[7px] font-mono text-slate-400 uppercase">
                Base Rail
              </span>
            </div>

            {/* Ground Clearance Legs */}
            <div className="w-full flex justify-between px-2 -mb-4 relative z-10">
              <div className={`w-2 h-4 rounded-b-xs ${isWooden ? "bg-amber-800" : "bg-slate-600"}`} />
              <span className="text-[8px] font-mono text-slate-400 bg-slate-900 px-1 py-0.2 rounded border border-slate-700 mt-1">
                +{numLeg} ft
              </span>
              <div className={`w-2 h-4 rounded-b-xs ${isWooden ? "bg-amber-800" : "bg-slate-600"}`} />
            </div>
          </div>
        </div>

        {/* Bottom Width Dimension Line */}
        <div className="mt-7 flex items-center justify-between text-[10px] text-slate-400" style={{ width: `${hutWidthPx}px` }}>
          <div className="h-2 w-0.5 bg-slate-500" />
          <div className="w-full border-t border-dashed border-slate-600 relative flex items-center justify-center">
            <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono border border-slate-700">
              Width: {numW} ft
            </span>
          </div>
          <div className="h-2 w-0.5 bg-slate-500" />
        </div>
      </div>

      {/* Specifications Footer */}
      <div className="w-full bg-slate-800/80 rounded-xl p-3 border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Specification Details:
          </span>
          <span className="font-bold text-slate-200 font-mono text-xs">
            {runningFt} Ru.Ft Frame • {totalArea} Sq.Ft Flex • {numHinges} Apex Hinges
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">
            Calculated Unit Price:
          </span>
          <span className="text-base font-extrabold text-orange-400 font-mono">
            ₹{unitTotal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
