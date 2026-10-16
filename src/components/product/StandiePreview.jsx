import React from "react";
import { FiCheck, FiShoppingBag, FiMaximize2, FiAward, FiLayers } from "react-icons/fi";

export default function StandiePreview({
  width = 2.5,
  height = 6,
  sizeLabel = "2.5 × 6 Ft",
  mediaName = "Star Flex",
  standType = "Standard Aluminium Roll-Up Stand",
  lamination = "None",
}) {
  const isLuxury = standType.toLowerCase().includes("luxury") || standType.toLowerCase().includes("teardrop");
  const isXStand = standType.toLowerCase().includes("x-banner") || standType.toLowerCase().includes("spider");
  const isNoStand = standType.toLowerCase().includes("no stand") || standType.toLowerCase().includes("banner print only");

  // Approximate aspect ratio calculation for preview container
  const numWidth = parseFloat(width) || 2.5;
  const numHeight = parseFloat(height) || 6;
  const aspectRatio = Math.max(0.3, Math.min(0.65, numWidth / numHeight));

  const totalAreaSqFt = (numWidth * numHeight).toFixed(1);

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col items-center justify-between relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 font-bold">
            <FiMaximize2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-bold text-slate-200">Interactive Standee Preview</span>
            <span className="text-[10px] text-slate-400 block">{sizeLabel} • {totalAreaSqFt} sq. ft.</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
            {mediaName}
          </span>
        </div>
      </div>

      {/* Main Standee Graphic Stage */}
      <div className="relative py-6 flex flex-col items-center justify-center w-full min-h-[360px]">
        {/* Height Dimension indicator */}
        <div className="absolute -left-1 sm:left-2 top-10 bottom-12 flex flex-col items-center justify-between text-[10px] text-slate-400">
          <div className="w-1.5 h-0.5 bg-slate-600" />
          <div className="h-full border-l border-dashed border-slate-600 relative">
            <span className="absolute -left-7 top-1/2 -translate-y-1/2 rotate-[-90deg] bg-slate-900 px-1 text-[9px] text-orange-400 font-bold whitespace-nowrap">
              {height} ft ({Math.round(numHeight * 12)}")
            </span>
          </div>
          <div className="w-1.5 h-0.5 bg-slate-600" />
        </div>

        {/* The Standee Physical Rig */}
        <div className="flex flex-col items-center transition-all duration-300" style={{ width: `${Math.round(aspectRatio * 320)}px` }}>
          {/* Top Aluminium Snapping Clamp Profile */}
          {!isNoStand && (
            <div className="w-full h-3 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-xs shadow-md border-b border-slate-500 relative flex items-center justify-center">
              <div className="w-3 h-1 bg-slate-600 rounded-xs" />
            </div>
          )}

          {/* Banner Printed Graphic Pull-Up Sheet */}
          <div
            className="w-full relative shadow-2xl overflow-hidden border border-slate-700/80 transition-all duration-300"
            style={{
              height: "260px",
              background: "linear-gradient(145deg, #0F172A 0%, #1E293B 40%, #0B192C 100%)",
            }}
          >
            {/* Glossy sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

            {/* Inner Graphic Mockup Elements */}
            <div className="p-3.5 h-full flex flex-col justify-between text-center relative z-10">
              <div>
                {/* Brand Logo Header */}
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 backdrop-blur-xs border border-white/10 mb-2">
                  <span className="font-extrabold text-[10px] tracking-widest text-white">A2V</span>
                  <span className="font-extrabold text-[10px] text-orange-400">PRINTS</span>
                </div>
                <h4 className="text-[13px] font-black text-white leading-tight uppercase tracking-tight">
                  PROMOTIONAL DISPLAY
                </h4>
                <div className="h-0.5 w-8 bg-orange-500 mx-auto mt-1 rounded-full" />
              </div>

              {/* Graphic Body Visual Accent */}
              <div className="my-auto py-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-900/80 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-extrabold text-white leading-none">{totalAreaSqFt}</span>
                    <span className="text-[7px] text-orange-400 font-bold uppercase">SQ.FT</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-300 font-medium mt-2 leading-tight px-1">
                  High Resolution Vivid Printing
                </p>
                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-orange-600 text-[8px] font-bold text-white uppercase tracking-wider">
                  {mediaName}
                </div>
              </div>

              {/* Graphic Footer */}
              <div className="pt-2 border-t border-white/10">
                <div className="text-[8px] text-slate-400 font-mono tracking-wider">
                  {width} FT × {height} FT
                </div>
                <div className="text-[7px] text-emerald-400 font-semibold mt-0.5">
                  ★ Durable &amp; Scratch Resistant
                </div>
              </div>
            </div>

            {/* Lamination ribbon tag */}
            {lamination && lamination !== "None" && (
              <div className="absolute top-1.5 right-1.5 bg-blue-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                {lamination}
              </div>
            )}
          </div>

          {/* Bottom Stand Mechanism */}
          {!isNoStand && (
            <>
              {isLuxury ? (
                // Luxury Teardrop Broad Base
                <div className="w-[115%] h-6 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 rounded-b-xl shadow-xl border-t border-slate-400 relative flex items-center justify-between px-2">
                  <div className="w-2.5 h-4 bg-gradient-to-r from-slate-200 to-slate-400 rounded-xs shadow-xs border border-slate-300" />
                  <span className="text-[8px] font-bold text-slate-700 tracking-wider">TEARDROP CHROME</span>
                  <div className="w-2.5 h-4 bg-gradient-to-r from-slate-400 to-slate-200 rounded-xs shadow-xs border border-slate-300" />
                </div>
              ) : isXStand ? (
                // X-Stand Spider Feet
                <div className="w-full pt-1 flex justify-between items-center px-1">
                  <div className="w-1.5 h-5 bg-slate-400 rotate-[-35deg] rounded-full shadow" />
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <div className="w-1.5 h-5 bg-slate-400 rotate-[35deg] rounded-full shadow" />
                </div>
              ) : (
                // Standard Roll-up Aluminium Base with Stabilizing Feet
                <div className="w-[108%] relative">
                  <div className="w-full h-4.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-xs shadow-lg border-t border-slate-500 flex items-center justify-center">
                    <div className="w-6 h-1 bg-slate-500/50 rounded-full" />
                  </div>
                  {/* Twin Swivel Feet */}
                  <div className="flex justify-between items-center px-2 -mt-0.5">
                    <div className="w-8 h-1.5 bg-slate-400 rounded-b-xs shadow border border-slate-500" />
                    <div className="w-8 h-1.5 bg-slate-400 rounded-b-xs shadow border border-slate-500" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Width Dimension Indicator */}
        <div className="w-48 mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <div className="h-1.5 w-0.5 bg-slate-600" />
          <div className="w-full border-t border-dashed border-slate-600 relative text-center">
            <span className="bg-slate-900 px-1 text-[9px] text-orange-400 font-bold">
              {width} ft ({Math.round(numWidth * 12)}")
            </span>
          </div>
          <div className="h-1.5 w-0.5 bg-slate-600" />
        </div>
      </div>

      {/* Highlights & Badges Footer */}
      <div className="w-full grid grid-cols-2 gap-2 pt-3 border-t border-slate-800 text-[11px]">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <FiShoppingBag className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="truncate">Includes Carry Bag</span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-300">
          <FiAward className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Ready in 24 Hours</span>
        </div>
      </div>
    </div>
  );
}
