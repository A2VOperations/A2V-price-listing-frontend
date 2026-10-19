import React from "react";
import { FiMaximize2, FiLayers, FiShield, FiCheckCircle } from "react-icons/fi";

export default function StandiePreview({
  totalHeight = 5,
  width = 3,
  legClearance = 1,
  flexHeight = 4,
  flexWidth = 3,
  flexArea = 12,
  isDoubleSided = true,
  mediaName = "Star Flex",
  flexRate = 25,
  ironRunningFt = 16,
  ironRate = 35,
  angleBaseFt = 2,
  angleRate = 50,
  supportCount = 4,
  supportRate = 80,
  totalPrice = 1580,
}) {
  const numHeight = parseFloat(totalHeight) || 5;
  const numWidth = parseFloat(width) || 3;
  const numLeg = parseFloat(legClearance) || 1;
  const numFlexH = Math.max(0.5, numHeight - numLeg);

  // Aspect ratio scaling for visual container
  const ratio = Math.max(0.35, Math.min(0.85, numWidth / numHeight));
  const containerWidthPx = Math.round(Math.max(220, Math.min(340, 260 * (ratio / 0.6))));

  const flexPercentage = Math.max(40, Math.min(85, (numFlexH / numHeight) * 100));
  const legPercentage = 100 - flexPercentage;

  const flexCost = Math.round(flexArea * (isDoubleSided ? 2 : 1) * flexRate);
  const ironCost = Math.round(ironRunningFt * ironRate);
  const angleCost = Math.round(angleBaseFt * angleRate);
  const supportCost = Math.round(supportCount * supportRate);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col items-center justify-between relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-52 h-52 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-52 h-52 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 font-bold">
            <FiMaximize2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-bold text-slate-100">Iron Frame Standee Visualizer</span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Total: {numHeight}ft H × {numWidth}ft W • 1ft Ground Legs
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-orange-600/20 text-orange-400 text-[10px] font-bold border border-orange-500/30">
            {isDoubleSided ? "2 SIDES FLEX" : "1 SIDE FLEX"}
          </span>
        </div>
      </div>

      {/* Main Interactive Rig Stage */}
      <div className="relative py-6 flex flex-col items-center justify-center w-full min-h-[410px]">
        {/* Left Total Height Dimension Line */}
        <div className="absolute left-1 sm:left-3 top-8 bottom-12 flex flex-col items-center justify-between text-[10px] text-slate-400">
          <div className="w-2 h-0.5 bg-orange-500" />
          <div className="h-full border-l-2 border-dashed border-orange-500/60 relative flex items-center justify-center">
            <span className="bg-slate-900 px-1 py-0.5 rounded text-[9px] text-orange-400 font-extrabold whitespace-nowrap rotate-[-90deg] shadow-xs border border-orange-500/30">
              Total Height: {numHeight} Ft
            </span>
          </div>
          <div className="w-2 h-0.5 bg-orange-500" />
        </div>

        {/* Physical Iron Frame & Flex Standee Rig */}
        <div
          className="relative flex flex-col items-center transition-all duration-300"
          style={{ width: `${containerWidthPx}px` }}
        >
          {/* Top Iron Crossbar (Square Pipe) */}
          <div className="w-full h-3 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-t-xs shadow-md border-b border-slate-900 flex items-center justify-between px-1 relative z-20">
            <div className="w-2 h-2 rounded-full bg-slate-900/60 border border-slate-500" title="Corner Weld" />
            <span className="text-[8px] font-bold text-slate-300 tracking-wider font-mono">
              IRON PIPE {numWidth} FT
            </span>
            <div className="w-2 h-2 rounded-full bg-slate-900/60 border border-slate-500" title="Corner Weld" />
          </div>

          {/* Frame Body with Left & Right Vertical Iron Pipes */}
          <div className="w-full relative flex justify-between" style={{ height: "300px" }}>
            {/* Left Vertical Full-Height Iron Pipe */}
            <div className="w-3.5 h-full bg-gradient-to-b from-slate-600 via-slate-500 to-slate-700 border-x border-slate-900 shadow-md relative z-20 shrink-0 flex flex-col justify-between">
              <div className="w-full h-1 bg-slate-800/80" />
              <div className="w-full h-1 bg-slate-800/80" />
            </div>

            {/* Inner Content Area: Flex Board Area + 1ft Leg Clearance */}
            <div className="flex-1 flex flex-col relative px-0.5">
              {/* Flex Banner Board (Occupies top flexPercentage) */}
              <div
                className="w-full relative rounded-xs shadow-inner overflow-hidden border border-slate-700/80 transition-all duration-300 flex flex-col justify-between p-3"
                style={{
                  height: `${flexPercentage}%`,
                  background: "linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
                }}
              >
                {/* Surface sheen effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

                {/* Grommets / Mounting Eyelets in 4 corners */}
                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-slate-300 border border-slate-700 shadow-xs" />
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-slate-300 border border-slate-700 shadow-xs" />
                <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-slate-300 border border-slate-700 shadow-xs" />
                <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-slate-300 border border-slate-700 shadow-xs" />

                {/* Flex Banner Mockup Content */}
                <div className="text-center relative z-10 my-auto">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 border border-white/10 mb-1.5">
                    <span className="font-extrabold text-[9px] tracking-wider text-white">A2V</span>
                    <span className="font-extrabold text-[9px] text-orange-400">PRINTS</span>
                  </div>
                  <h4 className="text-[12px] font-black text-white uppercase tracking-tight leading-tight">
                    FLEX DISPLAY BOARD
                  </h4>
                  <div className="h-0.5 w-10 bg-orange-500 mx-auto my-1 rounded-full" />
                  <div className="text-[10px] font-bold text-amber-300 font-mono mt-1">
                    {numFlexH} FT × {numWidth} FT
                  </div>
                  <div className="text-[9px] text-slate-300 font-medium">
                    ({flexArea} Sq.Ft • {isDoubleSided ? "Both Sides × 2" : "1 Side"})
                  </div>

                  <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-orange-600/90 text-[8px] font-bold text-white uppercase tracking-wider shadow-xs">
                    {mediaName}
                  </div>
                </div>

                {/* Right Flex Height Dimension Marker */}
                <div className="absolute right-2 top-2 bottom-2 flex items-center pointer-events-none">
                  <span className="text-[8px] text-amber-400 font-bold bg-slate-900/80 px-1 py-0.5 rounded border border-amber-500/30">
                    {numFlexH}ft
                  </span>
                </div>
              </div>

              {/* Middle Horizontal Iron Crossbar separating Flex from 1ft Legs */}
              <div className="w-full h-3 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 border-y border-slate-900 shadow-sm flex items-center justify-between px-1 relative z-20">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900/80" />
                <span className="text-[7.5px] font-bold text-slate-300 tracking-wider font-mono">
                  LOWER CROSS PIPE {numWidth} FT
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900/80" />
              </div>

              {/* Bottom 1ft Legs Open Air Clearance Gap */}
              <div
                className="w-full relative flex items-center justify-center"
                style={{ height: `${legPercentage}%` }}
              >
                {/* 1ft Leg Dimension Callout in center */}
                <div className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-[9px] font-mono text-slate-300 flex items-center gap-1 shadow-xs">
                  <span>↕ 1 FT STAND ROD / LEGS</span>
                </div>
              </div>
            </div>

            {/* Right Vertical Full-Height Iron Pipe */}
            <div className="w-3.5 h-full bg-gradient-to-b from-slate-600 via-slate-500 to-slate-700 border-x border-slate-900 shadow-md relative z-20 shrink-0 flex flex-col justify-between">
              <div className="w-full h-1 bg-slate-800/80" />
              <div className="w-full h-1 bg-slate-800/80" />
            </div>
          </div>

          {/* Ground Foundation: 2 Angle Iron Base Feet & 4 Support Braces */}
          <div className="w-full relative flex justify-between items-end px-0 -mt-2 z-30">
            {/* Left Foot Assembly (Angle Iron Bar + 2 Triangular Supports) */}
            <div className="flex flex-col items-center relative" style={{ width: "70px", marginLeft: "-28px" }}>
              {/* 2 Diagonal Welded Support Rods */}
              <svg className="w-full h-9 overflow-visible" viewBox="0 0 70 36">
                {/* Vertical center pole line stub */}
                <line x1="35" y1="0" x2="35" y2="36" stroke="#475569" strokeWidth="4" />
                {/* Left diagonal support brace */}
                <line x1="35" y1="6" x2="6" y2="33" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                {/* Right diagonal support brace */}
                <line x1="35" y1="6" x2="64" y2="33" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                {/* Weld points */}
                <circle cx="35" cy="6" r="2.5" fill="#f59e0b" />
                <circle cx="6" cy="33" r="2.5" fill="#f59e0b" />
                <circle cx="64" cy="33" r="2.5" fill="#f59e0b" />
              </svg>
              {/* Angle Iron Base Foot (Flat on ground) */}
              <div className="w-full h-2.5 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-sm border-t border-slate-400 shadow-lg relative flex items-center justify-between px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span className="text-[6.5px] font-black text-amber-300 font-mono">ANGLE 1FT</span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>
            </div>

            {/* Ground Clearance Label in middle */}
            <div className="flex-1 text-center pb-1">
              <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">
                Heavy Angle Iron Stand Base
              </span>
            </div>

            {/* Right Foot Assembly (Angle Iron Bar + 2 Triangular Supports) */}
            <div className="flex flex-col items-center relative" style={{ width: "70px", marginRight: "-28px" }}>
              {/* 2 Diagonal Welded Support Rods */}
              <svg className="w-full h-9 overflow-visible" viewBox="0 0 70 36">
                {/* Vertical center pole line stub */}
                <line x1="35" y1="0" x2="35" y2="36" stroke="#475569" strokeWidth="4" />
                {/* Left diagonal support brace */}
                <line x1="35" y1="6" x2="6" y2="33" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                {/* Right diagonal support brace */}
                <line x1="35" y1="6" x2="64" y2="33" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                {/* Weld points */}
                <circle cx="35" cy="6" r="2.5" fill="#f59e0b" />
                <circle cx="6" cy="33" r="2.5" fill="#f59e0b" />
                <circle cx="64" cy="33" r="2.5" fill="#f59e0b" />
              </svg>
              {/* Angle Iron Base Foot (Flat on ground) */}
              <div className="w-full h-2.5 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-sm border-t border-slate-400 shadow-lg relative flex items-center justify-between px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                <span className="text-[6.5px] font-black text-amber-300 font-mono">ANGLE 1FT</span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Width Dimension Line */}
        <div className="w-52 mt-4 flex items-center justify-between text-[10px] text-slate-400">
          <div className="h-2 w-0.5 bg-orange-500" />
          <div className="w-full border-t-2 border-dashed border-orange-500/60 relative text-center">
            <span className="bg-slate-900 px-2 text-[9px] text-orange-400 font-extrabold shadow-xs">
              Frame Width: {numWidth} Ft ({Math.round(numWidth * 12)}")
            </span>
          </div>
          <div className="h-2 w-0.5 bg-orange-500" />
        </div>
      </div>

      {/* Formula Verification Pill (Matches Handwritten Note Exactly) */}
      <div className="w-full bg-slate-800/90 rounded-xl p-3 border border-slate-700 text-[10.5px] space-y-1.5 mt-2">
        <div className="flex items-center justify-between font-bold text-orange-400 border-b border-slate-700/80 pb-1">
          <span>Formula Match (From Specifications):</span>
          <span>₹{totalPrice.toLocaleString()}</span>
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
            • Flex ({flexArea} sqft × {isDoubleSided ? "2 sides" : "1"} × ₹{flexRate}):{" "}
            <span className="font-bold text-white">₹{flexCost}</span>
          </div>
        </div>
      </div>

      {/* Key Highlights Footer */}
      <div className="w-full grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-[10.5px] text-center mt-3">
        <div className="flex flex-col items-center">
          <span className="text-orange-400 font-bold">16 Running Ft</span>
          <span className="text-[9px] text-slate-400">Iron Square Pipe</span>
        </div>
        <div className="flex flex-col items-center border-x border-slate-800">
          <span className="text-amber-400 font-bold">4 Support Rods</span>
          <span className="text-[9px] text-slate-400">High Stability</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-emerald-400 font-bold">2-Sided Flex</span>
          <span className="text-[9px] text-slate-400">High Resolution</span>
        </div>
      </div>
    </div>
  );
}
