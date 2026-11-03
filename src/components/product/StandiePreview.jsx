import React from "react";
import { FiMaximize2 } from "react-icons/fi";

export default function StandiePreview({
  totalHeight,
  width = 3,
  legClearance = 1,
  flexHeight = 5,
  flexWidth = 3,
  flexArea = 15,
  isDoubleSided = true,
  mediaName = "Star Flex",
  flexRate = 25,
  ironRunningFt = 18,
  ironRate = 35,
  angleBaseFt = 2,
  angleRate = 50,
  supportCount = 4,
  supportRate = 80,
  totalPrice = 1580,
}) {
  const numLeg = parseFloat(legClearance) || 0;
  const numFlexH = parseFloat(flexHeight) || 5;
  const numHeight = parseFloat(totalHeight) || parseFloat((numFlexH + numLeg).toFixed(2));
  const numWidth = parseFloat(width) || parseFloat(flexWidth) || 3;

  // Aspect ratio scaling for visual container
  const ratio = Math.max(0.35, Math.min(0.85, numWidth / numHeight));
  const containerWidthPx = Math.round(Math.max(220, Math.min(320, 250 * (ratio / 0.6))));

  const flexPercentage = Math.max(40, Math.min(92, (numFlexH / numHeight) * 100));
  const legPercentage = Math.max(0, 100 - flexPercentage);

  const flexCost = Math.round(flexArea * (isDoubleSided ? 2 : 1) * flexRate);
  const ironCost = Math.round(ironRunningFt * ironRate);
  const angleCost = Math.round(angleBaseFt * angleRate);
  const supportCost = Math.round(supportCount * supportRate);

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
              Iron Frame Standee Specification
              <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-mono font-semibold border border-slate-700">
                STD-002
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              Total: {numHeight} ft H × {numWidth} ft W • {numLeg} ft Ground Clearance
            </span>
          </div>
        </div>

        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
            {isDoubleSided ? "Double-Sided Flex" : "Single-Sided Flex"}
          </span>
        </div>
      </div>

      {/* Main Schematic Stage */}
      <div className="relative py-8 flex flex-col items-center justify-center w-full min-h-[410px]">
        {/* Left Height Dimension Line */}
        <div className="absolute left-2 sm:left-4 top-8 bottom-12 flex flex-col items-center justify-between text-[10px] text-slate-400">
          <div className="w-2.5 h-0.5 bg-slate-500" />
          <div className="h-full border-l border-dashed border-slate-600 relative flex items-center justify-center">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono whitespace-nowrap rotate-[-90deg] border border-slate-700">
              Total Height: {numHeight} ft
            </span>
          </div>
          <div className="w-2.5 h-0.5 bg-slate-500" />
        </div>

        {/* Physical Iron Frame & Flex Standee Rig */}
        <div
          className="relative flex flex-col items-center transition-all duration-300"
          style={{ width: `${containerWidthPx}px` }}
        >
          {/* Top Iron Crossbar */}
          <div className="w-full h-3 bg-slate-700 rounded-t-xs border border-slate-600 flex items-center justify-center px-1 relative z-20">
            <span className="text-[8px] font-mono text-slate-300 uppercase tracking-widest">
              Top Rail • {numWidth} ft
            </span>
          </div>

          {/* Frame Body with Left & Right Vertical Iron Pipes */}
          <div className="w-full relative flex justify-between" style={{ height: "300px" }}>
            {/* Left Vertical Iron Pipe */}
            <div className="w-3 h-full bg-slate-700 border-x border-slate-600 relative z-20 shrink-0" />

            {/* Inner Content Area: Flex Board Area + Leg Clearance */}
            <div className="flex-1 flex flex-col relative px-0.5">
              {/* Flex Banner Board */}
              <div
                className="w-full relative bg-slate-950 border border-slate-700 shadow-inner overflow-hidden transition-all duration-300 flex flex-col justify-between p-3"
                style={{ height: `${flexPercentage}%` }}
              >
                <div className="text-center my-auto">
                  <span className="text-[10px] font-bold text-slate-300 font-mono block">
                    {numWidth} ft × {numFlexH} ft Flex
                  </span>
                  <span className="text-[9px] text-orange-400 font-semibold block mt-0.5">
                    {flexArea} sq.ft ({isDoubleSided ? "2 Sides" : "1 Side"})
                  </span>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-slate-800 text-[8px] font-mono text-slate-300 border border-slate-700">
                    {mediaName}
                  </span>
                </div>

                <div className="text-right text-[8px] text-slate-400 font-mono">
                  Flex: {numFlexH} ft
                </div>
              </div>

              {/* Lower Horizontal Crossbar */}
              <div className="w-full h-2.5 bg-slate-700 border-y border-slate-600 flex items-center justify-center relative z-20">
                <span className="text-[7.5px] font-mono text-slate-400">
                  Cross Pipe {numWidth} ft
                </span>
              </div>

              {/* Bottom Legs Clearance */}
              <div
                className="w-full relative flex items-center justify-center bg-slate-900/40"
                style={{ height: `${legPercentage}%` }}
              >
                <span className="text-[9px] font-mono text-slate-400">
                  ↕ {numLeg} ft Ground Clearance
                </span>
              </div>
            </div>

            {/* Right Vertical Iron Pipe */}
            <div className="w-3 h-full bg-slate-700 border-x border-slate-600 relative z-20 shrink-0" />
          </div>

          {/* Angle Iron Base Feet & Triangular Supports */}
          <div className="w-full relative flex justify-between items-end -mt-1 z-30">
            {/* Left Foot Assembly */}
            <div className="flex flex-col items-center relative" style={{ width: "64px", marginLeft: "-26px" }}>
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 64 32">
                <line x1="32" y1="0" x2="32" y2="32" stroke="#475569" strokeWidth="3" />
                <line x1="32" y1="4" x2="4" y2="30" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <line x1="32" y1="4" x2="60" y2="30" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="w-full h-2 bg-slate-700 rounded-xs border border-slate-600 text-center">
                <span className="text-[6.5px] text-slate-300 font-mono block">Angle 1 ft</span>
              </div>
            </div>

            <div className="flex-1 text-center pb-1">
              <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">
                Welded Angle Iron Base
              </span>
            </div>

            {/* Right Foot Assembly */}
            <div className="flex flex-col items-center relative" style={{ width: "64px", marginRight: "-26px" }}>
              <svg className="w-full h-8 overflow-visible" viewBox="0 0 64 32">
                <line x1="32" y1="0" x2="32" y2="32" stroke="#475569" strokeWidth="3" />
                <line x1="32" y1="4" x2="4" y2="30" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
                <line x1="32" y1="4" x2="60" y2="30" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="w-full h-2 bg-slate-700 rounded-xs border border-slate-600 text-center">
                <span className="text-[6.5px] text-slate-300 font-mono block">Angle 1 ft</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Width Dimension Line */}
        <div className="w-48 mt-4 flex items-center justify-between text-[10px] text-slate-400">
          <div className="h-2.5 w-0.5 bg-slate-500" />
          <div className="w-full border-t border-dashed border-slate-600 relative text-center">
            <span className="bg-slate-900 px-2 text-[10px] text-slate-300 font-mono">
              Width: {numWidth} ft ({Math.round(numWidth * 12)}")
            </span>
          </div>
          <div className="h-2.5 w-0.5 bg-slate-500" />
        </div>
      </div>

      {/* Rate Breakdown */}
      <div className="w-full bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-xs space-y-1.5 mt-2">
        <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-700/80 pb-1">
          <span>Itemized Material Cost:</span>
          <span className="font-mono text-orange-400 font-extrabold">₹{totalPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-300 text-[10px] font-mono">
          <div>
            • Iron Frame ({ironRunningFt} ft × ₹{ironRate}): <span className="font-bold text-white">₹{ironCost}</span>
          </div>
          <div>
            • Angle Rod ({angleBaseFt} ft × ₹{angleRate}): <span className="font-bold text-white">₹{angleCost}</span>
          </div>
          <div>
            • Support Rods ({supportCount} × ₹{supportRate}): <span className="font-bold text-white">₹{supportCost}</span>
          </div>
          <div>
            • Flex Print ({flexArea} sqft × {isDoubleSided ? "2" : "1"} × ₹{flexRate}):{" "}
            <span className="font-bold text-white">₹{flexCost}</span>
          </div>
        </div>
      </div>

      {/* Specifications Footer */}
      <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[10px] text-center mt-3 font-mono">
        <div>
          <span className="text-slate-200 font-bold block">{ironRunningFt} Running Ft</span>
          <span className="text-slate-400 text-[9px]">MS Iron Pipe</span>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-slate-200 font-bold block">{supportCount} Support Rods</span>
          <span className="text-slate-400 text-[9px]">Welded Braces</span>
        </div>
        <div>
          <span className="text-slate-200 font-bold block">{isDoubleSided ? "Double Sided" : "Single Sided"}</span>
          <span className="text-slate-400 text-[9px]">{mediaName}</span>
        </div>
      </div>
    </div>
  );
}
