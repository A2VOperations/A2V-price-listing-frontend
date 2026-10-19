import React from "react";
import {
  FiMaximize2,
  FiLayers,
  FiShield,
  FiCheckCircle,
  FiShoppingBag,
  FiPackage,
  FiZap,
} from "react-icons/fi";

export default function RollUpStandiePreview({
  machineWidth = 2.5,
  customHeight = 6,
  machineType = "standard", // "standard" | "luxury"
  includeMachine = true,
  includeBanner = true,
  mediaName = "Star Flex - High Gloss Finish",
  flexRate = 25,
  machineCost = 550,
  flexCost = 375,
  totalAreaSqFt = 15.0,
  totalPrice = 925,
}) {
  const numWidth = parseFloat(machineWidth) || 2.5;
  const numHeight = Math.min(6, Math.max(1, parseFloat(customHeight) || 6));

  // Dynamic visual container proportions based on height and width
  const aspectRatio = numWidth / numHeight; // typically 2.5 / 6 ≈ 0.42, or 3.5 / 6 ≈ 0.58
  // Set width in pixels adapted to aspect ratio
  const visualBannerWidth = Math.round(
    Math.max(170, Math.min(270, 190 * (numWidth / 2.5)))
  );
  // Banner height clamped for preview box
  const visualBannerHeight = 290;

  const is36Width = numWidth >= 3.0;
  const isLuxury = machineType === "luxury";

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col items-center justify-between relative overflow-hidden select-none">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-bold">
            <FiMaximize2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              Roll-Up Standee Visualizer
              <span className="px-1.5 py-0.2 bg-blue-500/30 text-blue-300 text-[9px] rounded font-mono font-semibold">
                STD-001
              </span>
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Fixed Width: {numWidth} Ft • Custom Height: {numHeight} Ft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              includeMachine && includeBanner
                ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                : includeMachine
                ? "bg-purple-600/20 text-purple-400 border-purple-500/30"
                : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {includeMachine && includeBanner
              ? "MACHINE + FLEX BANNER"
              : includeMachine
              ? "HARDWARE MACHINE ONLY"
              : "BANNER PRINT ONLY"}
          </span>
        </div>
      </div>

      {/* Main Interactive Rig Stage */}
      <div className="relative py-7 flex flex-col items-center justify-center w-full min-h-[430px]">
        {/* Left Customizable Height Dimension Line */}
        <div className="absolute left-1 sm:left-4 top-10 bottom-16 flex flex-col items-center justify-between text-[10px] text-slate-400">
          <div className="w-2.5 h-0.5 bg-blue-500" />
          <div className="h-full border-l-2 border-dashed border-blue-500/60 relative flex items-center justify-center">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[9px] text-blue-400 font-extrabold whitespace-nowrap rotate-[-90deg] shadow-xs border border-blue-500/30">
              Custom Height: {numHeight} Ft ({Math.round(numHeight * 12)}")
            </span>
          </div>
          <div className="w-2.5 h-0.5 bg-blue-500" />
        </div>

        {/* Physical Aluminium Roll-Up Standee Display */}
        <div
          className="relative flex flex-col items-center transition-all duration-300"
          style={{ width: `${visualBannerWidth}px` }}
        >
          {/* Top Snap Rail / Hanger Bar (Aluminium Profile) */}
          <div className="w-full flex flex-col items-center relative z-20">
            {/* Top Hanger Hook / Finial */}
            <div className="w-3.5 h-2 bg-slate-400 rounded-t-sm border border-slate-500 shadow-xs flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Snap Rail Bar */}
            <div className="w-full h-3.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-xs shadow-md border border-slate-400 flex items-center justify-between px-2">
              <div className="w-1 h-1.5 rounded-xs bg-slate-600" />
              <span className="text-[7.5px] font-bold text-slate-700 tracking-wider font-mono uppercase">
                Alu Snap Rail • {numWidth} Ft
              </span>
              <div className="w-1 h-1.5 rounded-xs bg-slate-600" />
            </div>
          </div>

          {/* Banner Graphic Canvas & Rear Bungee Pole */}
          <div
            className="w-full relative flex items-center justify-center overflow-hidden"
            style={{ height: `${visualBannerHeight}px` }}
          >
            {/* Rear Bungee/Telescopic Vertical Aluminium Support Pole (Peeking through/behind) */}
            <div className="absolute top-0 bottom-0 w-2.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 border-x border-slate-700 z-0 flex flex-col justify-around items-center">
              <div className="w-3.5 h-1 bg-slate-800 rounded-full" title="Pole Coupler 1" />
              <div className="w-3.5 h-1 bg-slate-800 rounded-full" title="Pole Coupler 2" />
              <div className="w-3.5 h-1 bg-slate-800 rounded-full" title="Pole Coupler 3" />
            </div>

            {/* Banner Canvas */}
            {includeBanner ? (
              <div
                className="w-full h-full relative z-10 shadow-2xl flex flex-col justify-between p-3 border-x border-slate-300 transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(145deg, #1e293b 0%, #0f172a 40%, #1e1b4b 100%)",
                }}
              >
                {/* Subtle graphic patterns on the banner */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Top Banner Content: Brand & Category */}
                <div className="relative z-10 text-center pt-1">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[9px] font-bold text-blue-300">
                    <FiLayers className="w-2.5 h-2.5 text-blue-400" />
                    <span>A2V ROLL-UP STANDEE</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white tracking-tight mt-1">
                    HIGH DEFINITION
                  </h4>
                  <p className="text-[8px] text-blue-200/80 font-medium">
                    1440 DPI Anti-Curl Banner Print
                  </p>
                </div>

                {/* Center Banner Graphic: Dimensions Highlight */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg transform hover:scale-105 transition-transform">
                    <div className="w-full h-full bg-slate-900/90 rounded-[14px] flex flex-col items-center justify-center p-1">
                      <span className="text-[10px] font-black text-amber-400 leading-none">
                        {totalAreaSqFt}
                      </span>
                      <span className="text-[7.5px] text-slate-300 font-bold uppercase mt-0.5">
                        Sq.Ft.
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <div className="text-[11px] font-black text-white tracking-wider font-mono">
                      {numWidth} FT × {numHeight} FT
                    </div>
                    <div className="text-[8px] text-slate-300 font-medium mt-0.5">
                      {mediaName}
                    </div>
                  </div>
                </div>

                {/* Bottom Banner Content: Badges */}
                <div className="relative z-10 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[7.5px] text-slate-300">
                  <span className="flex items-center gap-1 font-mono text-blue-400 font-bold">
                    <FiCheckCircle className="w-2.5 h-2.5" />
                    Fixed W: {numWidth}'
                  </span>
                  <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                    <FiZap className="w-2.5 h-2.5" />
                    Custom H: {numHeight}'
                  </span>
                </div>
              </div>
            ) : (
              /* Hardware Only placeholder wireframe */
              <div className="w-full h-full relative z-10 border-2 border-dashed border-slate-700 rounded bg-slate-800/40 flex flex-col items-center justify-center p-4 text-center">
                <FiPackage className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs font-bold text-slate-300">
                  Hardware Only Mode
                </span>
                <span className="text-[9px] text-slate-500 mt-1 max-w-[130px]">
                  Roll-Up Machine ready for {numWidth} Ft banner mounting
                </span>
              </div>
            )}
          </div>

          {/* Aluminium Base Cassette (Spring Roller Machine) */}
          {includeMachine ? (
            <div className="w-full flex flex-col items-center relative z-20 -mt-0.5">
              {/* Internal Spring Slot Edge */}
              <div className="w-11/12 h-1 bg-slate-800 border-x border-slate-600 rounded-t-xs" />

              {/* Main Machine Cassette Body */}
              <div
                className={`w-full rounded-sm shadow-xl relative border flex items-center justify-between px-2.5 py-1.5 transition-all ${
                  isLuxury
                    ? "h-9 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border-slate-300"
                    : "h-7 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-slate-400"
                }`}
              >
                {/* Left Chrome End Cap */}
                <div className="w-2 h-4 rounded-xs bg-gradient-to-b from-slate-300 to-slate-500 border border-slate-600 shadow-inner" />

                <div className="text-center">
                  <span
                    className={`font-black tracking-wider uppercase font-mono block ${
                      isLuxury
                        ? "text-[8px] text-slate-800"
                        : "text-[7.5px] text-slate-700"
                    }`}
                  >
                    {isLuxury
                      ? `TEARDROP BROAD BASE • ${numWidth} FT`
                      : `ROLL-UP MACHINE • ${numWidth} FT BASE`}
                  </span>
                  <span className="text-[6.5px] text-slate-500 font-bold block">
                    INTERNAL SPRING RETRACTION MECHANISM
                  </span>
                </div>

                {/* Right Chrome End Cap */}
                <div className="w-2 h-4 rounded-xs bg-gradient-to-b from-slate-300 to-slate-500 border border-slate-600 shadow-inner" />
              </div>

              {/* Base Feet / Stabilizers */}
              {!isLuxury ? (
                /* Twin Swivel Feet for Standard Aluminium Machine */
                <div className="w-full flex justify-between px-3 -mt-1 relative z-10">
                  {/* Left Swivel Foot */}
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-1.5 bg-slate-600" />
                    <div className="w-8 h-2 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-full border border-slate-500 shadow-md flex items-center justify-between px-0.5">
                      <div className="w-1 h-1 rounded-full bg-slate-900" />
                      <div className="w-1 h-1 rounded-full bg-slate-900" />
                    </div>
                  </div>

                  {/* Right Swivel Foot */}
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-1.5 bg-slate-600" />
                    <div className="w-8 h-2 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-full border border-slate-500 shadow-md flex items-center justify-between px-0.5">
                      <div className="w-1 h-1 rounded-full bg-slate-900" />
                      <div className="w-1 h-1 rounded-full bg-slate-900" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Luxury Broad Base Footprint */
                <div className="w-10/12 h-1.5 bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500 rounded-b-md shadow-lg border-t border-slate-400" />
              )}
            </div>
          ) : (
            /* Banner only bottom rail */
            <div className="w-full h-2 bg-slate-600 rounded-b border border-slate-500 mt-1" />
          )}

          {/* Bottom Fixed Width Dimension Line */}
          <div className="w-full flex items-center justify-between mt-4 text-[10px] text-slate-400">
            <div className="h-2 w-0.5 bg-blue-500" />
            <div className="w-full border-t-2 border-dashed border-blue-500/60 relative flex items-center justify-center">
              <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px] text-blue-400 font-black whitespace-nowrap shadow-xs border border-blue-500/30">
                Fixed Width: {numWidth} Ft ({numWidth === 2.5 ? '30"' : '42"'})
              </span>
            </div>
            <div className="h-2 w-0.5 bg-blue-500" />
          </div>
        </div>
      </div>


      {/* Unit Price Summary Bar */}
      <div className="w-full mt-3 p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-800/60 to-indigo-950/40 border border-blue-500/20 flex items-center justify-between">
        <div>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
            Calculated Unit Price
          </span>
          <span className="text-xs text-slate-300 font-mono">
            {includeMachine ? `Machine: ₹${machineCost}` : ""}
            {includeMachine && includeBanner ? " + " : ""}
            {includeBanner ? `Banner (${totalAreaSqFt} sqft): ₹${flexCost}` : ""}
          </span>
        </div>
        <div className="text-right">
          <span className="text-base font-extrabold text-blue-400 font-mono">
            ₹{totalPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[9px] text-slate-400 block">per unit</span>
        </div>
      </div>
    </div>
  );
}
