import React from "react";
import {
  FiMaximize2,
  FiLayers,
  FiShield,
  FiCheckCircle,
  FiZap,
} from "react-icons/fi";

export default function StandieHutPreview({
  totalWidth = 2.5,
  totalHeight = 4,
  legClearance = 0.5,
  frameType = "iron-3kg", // "iron-3kg" | "iron-5kg" | "wooden"
  mediaType = "star-flex", // "star-flex" | "normal-flex"
  flexRate = 25,
  frameRate = 35,
  runningFt = 26,
  hingesCount = 2,
  hingeRate = 15,
  isDoubleSided = true,
  unitTotal = 1378,
}) {
  const numW = parseFloat(totalWidth) || 2.5;
  const numH = parseFloat(totalHeight) || 4;
  const numLeg = parseFloat(legClearance) || 0.5;
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
  const hutWidthPx = Math.round(Math.max(180, Math.min(270, 210 * (ratio / 0.62))));
  const hutHeightPx = 280;

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col items-center justify-between relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-bold">
            <FiMaximize2 className="w-3.5 h-3.5" />
          </span>
          <div>
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              Standee Hut (A-Frame) Visualizer
              <span className="px-1.5 py-0.2 bg-amber-500/30 text-amber-300 text-[9px] rounded font-mono font-semibold">
                STD-003
              </span>
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Total Frame: {numW} × {totalFrameH} Ft • Flex: {numW} × {numFlexH} Ft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              isWooden
                ? "bg-amber-600/20 text-amber-300 border-amber-500/30"
                : isIron5kg
                ? "bg-purple-600/20 text-purple-300 border-purple-500/30"
                : "bg-blue-600/20 text-blue-300 border-blue-500/30"
            }`}
          >
            {isWooden
              ? "WOODEN TIMBER FRAME"
              : isIron5kg
              ? "HEAVY IRON FRAME (5 KG)"
              : "LIGHT IRON FRAME (3 KG)"}
          </span>
        </div>
      </div>

      {/* Main 3D / Perspective Stage */}
      <div className="relative py-8 flex flex-col items-center justify-center w-full min-h-[400px]">
        {/* Height dimension guide on left */}
        <div className="absolute left-1 sm:left-4 top-10 bottom-14 flex flex-col items-center justify-between text-[10px] text-slate-400">
          <div className="w-2.5 h-0.5 bg-amber-500" />
          <div className="h-full border-l-2 border-dashed border-amber-500/60 relative flex items-center justify-center">
            <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[9px] text-amber-400 font-extrabold whitespace-nowrap rotate-[-90deg] shadow-xs border border-amber-500/30">
              Total Height: {totalFrameH} Ft ({numFlexH}' Flex + {numLeg}' Legs)
            </span>
          </div>
          <div className="w-2.5 h-0.5 bg-amber-500" />
        </div>

        {/* 3D A-Frame Hut Rig Container */}
        <div
          className="relative transition-all duration-300 flex items-center justify-center"
          style={{ width: `${hutWidthPx + 50}px`, height: `${hutHeightPx}px` }}
        >
          {/* Top Hinge / Apex Joint Bar */}
          <div
            className={`absolute top-0 z-30 h-3.5 rounded-full shadow-lg border flex items-center justify-between px-1.5 ${
              isWooden
                ? "bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 border-amber-600"
                : "bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-slate-300"
            }`}
            style={{ width: `${hutWidthPx}px` }}
          >
            {/* Dynamic Hinges Rivets/Plates */}
            <div className="w-full flex items-center justify-around">
              {Array.from({ length: numHinges }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-0.5 bg-slate-900/90 px-1 py-0.5 rounded shadow-xs border border-amber-500/30"
                  title={`Apex Hinge #${idx + 1} (₹${numHingePrice})`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-[6.5px] font-black text-amber-300 font-mono">
                    H{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7.5px] font-black tracking-wider uppercase font-mono text-amber-300 bg-slate-950/95 px-1.5 py-0.2 rounded border border-amber-500/40 shadow-xs whitespace-nowrap">
              {numHinges}x Apex Hinges (₹{hingesTotalCost})
            </span>
          </div>

          {/* Rear A-frame board (angled behind, showing depth) */}
          <div
            className="absolute top-1 z-0 rounded-b-md opacity-40 shadow-2xl transition-all"
            style={{
              width: `${hutWidthPx - 10}px`,
              height: `${hutHeightPx - 8}px`,
              transform: "skewY(-4deg) rotate(-3deg) translate(22px, 8px)",
              background: isWooden
                ? "linear-gradient(180deg, #78350f 0%, #451a03 100%)"
                : "linear-gradient(180deg, #334155 0%, #0f172a 100%)",
              border: isWooden ? "3px solid #92400e" : "3px solid #475569",
            }}
          >
            {/* Rear legs shadow */}
            <div className="absolute -bottom-4 left-2 w-3 h-4 bg-slate-800/80" />
            <div className="absolute -bottom-4 right-2 w-3 h-4 bg-slate-800/80" />
          </div>

          {/* Side Limiting Stay Chain / Bracket connecting Front and Back */}
          <div
            className="absolute z-10 w-12 h-1 border-t-2 border-dashed border-amber-400/80"
            style={{ top: "60%", right: "-12px", transform: "rotate(10deg)" }}
            title="Heavy-Duty Safety Stay Chain"
          />

          {/* Front Main A-Frame Face */}
          <div
            className={`relative z-20 rounded-b-md shadow-2xl flex flex-col justify-between transition-all ${
              isWooden
                ? "bg-gradient-to-b from-amber-900 via-amber-950 to-amber-900 border-x-4 border-t-2 border-b-0 border-amber-700"
                : isIron5kg
                ? "bg-slate-900 border-x-4 border-t-2 border-b-0 border-slate-500"
                : "bg-slate-900 border-x-[3px] border-t-2 border-b-0 border-slate-400"
            }`}
            style={{
              width: `${hutWidthPx}px`,
              height: `${hutHeightPx - 20}px`,
            }}
          >
            {/* Flex Banner Canvas Area */}
            <div
              className="w-full flex-1 relative flex flex-col justify-between p-3.5 m-0 overflow-hidden shadow-inner"
              style={{
                background:
                  mediaType === "normal-flex"
                    ? "linear-gradient(145deg, #1e293b 0%, #0f172a 60%, #1e293b 100%)"
                    : "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0284c7 100%)",
              }}
            >
              {/* Graphic sheen */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px]" />
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

              {/* Top Banner Tag */}
              <div className="relative z-10 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[8.5px] font-extrabold text-amber-300">
                  <FiLayers className="w-2.5 h-2.5 text-amber-400" />
                  A2V STANDEE HUT
                </span>
                <h4 className="text-xs font-black text-white tracking-wider uppercase mt-1">
                  A-FRAME DISPLAY
                </h4>
              </div>

              {/* Center Dimension Badge */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 shadow-lg">
                  <div className="w-full h-full bg-slate-900 rounded-[10px] flex flex-col items-center justify-center p-1 text-center">
                    <span className="text-[10px] font-black text-amber-400 leading-none">
                      {numW}×{numFlexH}'
                    </span>
                    <span className="text-[7.5px] text-slate-300 font-bold uppercase mt-0.5">
                      FLEX
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[9px] font-extrabold text-white font-mono block">
                    {mediaType === "normal-flex" ? "Normal Frontlit Flex" : "Star Flex - High Gloss"}
                  </span>
                  <span className="text-[7.5px] text-amber-200/90 font-medium block">
                    {isDoubleSided ? "Double-Sided Tent Display" : "Single-Sided Banner"}
                  </span>
                </div>
              </div>

              {/* Bottom Specs Badge */}
              <div className="relative z-10 pt-1.5 border-t border-slate-700/60 flex items-center justify-between text-[7.5px] text-slate-300 font-mono">
                <span className="text-amber-400 font-bold">W: {numW} Ft • H: {numFlexH} Ft</span>
                <span className="text-emerald-400 font-bold">Leg: +{numLeg} Ft</span>
              </div>
            </div>

            {/* Bottom Support Crossbar (Perimeter rail) */}
            <div
              className={`w-full h-2 shadow-md flex items-center justify-between px-2 ${
                isWooden
                  ? "bg-amber-800 border-y border-amber-700"
                  : "bg-slate-700 border-y border-slate-600"
              }`}
            >
              <div className="w-1 h-1 rounded-full bg-slate-900" />
              <span className="text-[6.5px] font-bold text-slate-300 font-mono">
                LOWER CROSSBAR
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-900" />
            </div>

            {/* Bottom Ground Legs (0.5 Ft Clearance) */}
            <div className="w-full flex justify-between px-1.5 -mb-5 relative z-10">
              {/* Left Ground Leg */}
              <div
                className={`w-2.5 h-5 rounded-b-xs shadow-md ${
                  isWooden
                    ? "bg-gradient-to-b from-amber-800 to-amber-950 border-x border-b border-amber-700"
                    : isIron5kg
                    ? "bg-gradient-to-b from-slate-600 to-slate-900 border-x border-b border-slate-500"
                    : "bg-gradient-to-b from-slate-500 to-slate-800 border-x border-b border-slate-400"
                }`}
              >
                <div className="w-full h-1 bg-slate-900/60 mt-4 rounded-b-xs" />
              </div>

              {/* Leg Clearance Label */}
              <span className="text-[8px] font-bold text-amber-400 bg-slate-900 px-1 py-0.5 rounded border border-amber-500/40 shadow-xs mt-1">
                +{numLeg} Ft Legs
              </span>

              {/* Right Ground Leg */}
              <div
                className={`w-2.5 h-5 rounded-b-xs shadow-md ${
                  isWooden
                    ? "bg-gradient-to-b from-amber-800 to-amber-950 border-x border-b border-amber-700"
                    : isIron5kg
                    ? "bg-gradient-to-b from-slate-600 to-slate-900 border-x border-b border-slate-500"
                    : "bg-gradient-to-b from-slate-500 to-slate-800 border-x border-b border-slate-400"
                }`}
              >
                <div className="w-full h-1 bg-slate-900/60 mt-4 rounded-b-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Width Dimension Line */}
        <div className="mt-7 flex items-center justify-between text-[10px] text-slate-400" style={{ width: `${hutWidthPx}px` }}>
          <div className="h-2 w-0.5 bg-amber-500" />
          <div className="w-full border-t border-dashed border-amber-500/60 relative flex items-center justify-center">
            <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px] text-amber-400 font-extrabold shadow-xs border border-amber-500/30">
              Width: {numW} Ft
            </span>
          </div>
          <div className="h-2 w-0.5 bg-amber-500" />
        </div>
      </div>

      {/* Footer Specs Quick Pill */}
      <div className="w-full bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">
            Calculated Total Specs:
          </span>
          <span className="font-extrabold text-slate-100 font-mono">
            {runningFt} Ru.Ft Frame + {totalArea} Sq.Ft Flex + {numHinges} Hinges
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">
            Estimated Unit Cost:
          </span>
          <span className="text-base font-black text-amber-400 font-mono">
            ₹{unitTotal.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
