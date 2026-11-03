import React from "react";
import {
  FiMaximize2,
  FiLayers,
  FiPackage,
} from "react-icons/fi";

export default function RollUpStandiePreview({
  machineWidth = 2.5,
  customHeight = 6,
  machineType = "standard", // "standard" | "luxury"
  includeMachine = true,
  includeBanner = true,
  mediaName = "Star Flex",
  flexRate = 30,
  machineCost = 1250,
  flexCost = 450,
  totalAreaSqFt = 15.0,
  totalPrice = 1700,
}) {
  const numWidth = parseFloat(machineWidth) || 2.5;
  const numHeight = Math.min(6, Math.max(1, parseFloat(customHeight) || 6));

  // Visual proportions
  const visualBannerWidth = Math.round(
    Math.max(180, Math.min(260, 200 * (numWidth / 2.5)))
  );
  const visualBannerHeight = 290;
  const isLuxury = machineType === "luxury";

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
              Roll-Up Standee Specification
              <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded font-mono font-semibold border border-slate-700">
                STD-001
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              {numWidth} ft W × {numHeight} ft H • {totalAreaSqFt} sq.ft
            </span>
          </div>
        </div>

        <div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
            {includeMachine && includeBanner
              ? "Base + Banner"
              : includeMachine
              ? "Base Only"
              : "Banner Only"}
          </span>
        </div>
      </div>

      {/* Main Schematic Stage */}
      <div className="relative py-8 flex flex-col items-center justify-center w-full min-h-[420px]">
        {/* Left Height Dimension Line */}
        <div className="absolute left-2 sm:left-4 top-10 bottom-16 flex flex-col items-center justify-between text-[10px] text-slate-400">
          <div className="w-2.5 h-0.5 bg-slate-500" />
          <div className="h-full border-l border-dashed border-slate-600 relative flex items-center justify-center">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-slate-300 font-mono whitespace-nowrap rotate-[-90deg] border border-slate-700">
              Height: {numHeight} ft ({Math.round(numHeight * 12)}")
            </span>
          </div>
          <div className="w-2.5 h-0.5 bg-slate-500" />
        </div>

        {/* Physical Aluminium Roll-Up Standee Structure */}
        <div
          className="relative flex flex-col items-center transition-all duration-300"
          style={{ width: `${visualBannerWidth}px` }}
        >
          {/* Top Aluminium Snap Rail Profile */}
          <div className="w-full flex flex-col items-center relative z-20">
            <div className="w-full h-3 bg-slate-700 rounded-t-xs border border-slate-600 shadow-sm flex items-center justify-center px-2">
              <span className="text-[8px] font-mono font-medium text-slate-300 uppercase tracking-widest">
                Snap Rail • {numWidth} ft
              </span>
            </div>
          </div>

          {/* Banner Graphic Canvas & Rear Support Pole */}
          <div
            className="w-full relative flex items-center justify-center overflow-hidden"
            style={{ height: `${visualBannerHeight}px` }}
          >
            {/* Rear Aluminium Support Pole */}
            <div className="absolute top-0 bottom-0 w-2 bg-slate-700 border-x border-slate-600 z-0" />

            {/* Banner Canvas */}
            {includeBanner ? (
              <div className="w-full h-full relative z-10 bg-slate-950 border-x border-slate-700 shadow-lg flex flex-col justify-between p-4 transition-all duration-300">
                {/* Subtle Grid Accent */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Top Banner Content */}
                <div className="relative z-10 text-center pt-2">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-[9px] font-mono font-bold text-slate-300 border border-slate-700">
                    <FiLayers className="w-3 h-3 text-orange-400" />
                    <span>A2V PRINTS</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 tracking-wide mt-1.5 uppercase">
                    Roll-Up Display
                  </h4>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    1440 DPI • Anti-Curl Edge
                  </p>
                </div>

                {/* Center Banner Graphic: Dimensions Callout */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                  <div className="border border-slate-700 bg-slate-900/80 rounded-lg p-3 text-center w-32 shadow-xs">
                    <span className="text-sm font-extrabold text-white font-mono block">
                      {numWidth}' × {numHeight}'
                    </span>
                    <span className="text-[10px] text-orange-400 font-bold block mt-0.5">
                      {totalAreaSqFt} Sq.Ft.
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium block mt-1">
                      {mediaName}
                    </span>
                  </div>
                </div>

                {/* Bottom Banner Content */}
                <div className="relative z-10 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Width: {numWidth} ft</span>
                  <span>Height: {numHeight} ft</span>
                </div>
              </div>
            ) : (
              /* Hardware Only Mode */
              <div className="w-full h-full relative z-10 border border-dashed border-slate-700 bg-slate-800/40 flex flex-col items-center justify-center p-4 text-center rounded">
                <FiPackage className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs font-bold text-slate-300">
                  Hardware Only
                </span>
                <span className="text-[10px] text-slate-500 mt-1 max-w-[140px]">
                  Roll-Up cassette ready for {numWidth} ft banner mounting
                </span>
              </div>
            )}
          </div>

          {/* Aluminium Base Cassette */}
          {includeMachine ? (
            <div className="w-full flex flex-col items-center relative z-20">
              {/* Main Machine Cassette Body */}
              <div
                className={`w-full rounded-sm border flex items-center justify-between px-3 py-1.5 transition-all ${
                  isLuxury
                    ? "h-8 bg-slate-700 border-slate-600"
                    : "h-7 bg-slate-800 border-slate-700"
                }`}
              >
                <div className="w-1.5 h-3 bg-slate-600 rounded-xs" />
                <div className="text-center">
                  <span className="font-mono font-bold text-[8px] text-slate-300 uppercase tracking-wider block">
                    {isLuxury
                      ? `Luxury Teardrop Base • ${numWidth} ft`
                      : `Standard Cassette • ${numWidth} ft`}
                  </span>
                </div>
                <div className="w-1.5 h-3 bg-slate-600 rounded-xs" />
              </div>

              {/* Stabilizer Feet */}
              {!isLuxury ? (
                /* Twin Swivel Feet for Standard */
                <div className="w-full flex justify-between px-3 -mt-0.5 relative z-10">
                  <div className="w-7 h-1.5 bg-slate-600 rounded-full border border-slate-500" />
                  <div className="w-7 h-1.5 bg-slate-600 rounded-full border border-slate-500" />
                </div>
              ) : (
                /* Luxury Broad Base Footprint */
                <div className="w-10/12 h-1.5 bg-slate-600 rounded-b-md border-t border-slate-500" />
              )}
            </div>
          ) : (
            /* Banner only bottom rail */
            <div className="w-full h-2 bg-slate-700 rounded-b border border-slate-600 mt-1" />
          )}

          {/* Bottom Width Dimension Line */}
          <div className="w-full flex items-center justify-between mt-4 text-[10px] text-slate-400">
            <div className="h-2.5 w-0.5 bg-slate-500" />
            <div className="w-full border-t border-dashed border-slate-600 relative flex items-center justify-center">
              <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono whitespace-nowrap border border-slate-700">
                Width: {numWidth} ft ({numWidth === 2.5 ? '30"' : '36"'})
              </span>
            </div>
            <div className="h-2.5 w-0.5 bg-slate-500" />
          </div>
        </div>
      </div>

      {/* Unit Price Summary Bar */}
      <div className="w-full mt-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
            Calculated Unit Price
          </span>
          <span className="text-xs text-slate-300 font-mono">
            {includeMachine ? `Hardware: ₹${machineCost.toLocaleString("en-IN")}` : ""}
            {includeMachine && includeBanner ? " + " : ""}
            {includeBanner ? `Print (${totalAreaSqFt} sq.ft): ₹${flexCost.toLocaleString("en-IN")}` : ""}
          </span>
        </div>
        <div className="text-right">
          <span className="text-base font-extrabold text-orange-400 font-mono">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] text-slate-400 block font-medium">per unit</span>
        </div>
      </div>
    </div>
  );
}
