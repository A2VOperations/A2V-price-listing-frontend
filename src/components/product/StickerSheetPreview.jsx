import React, { useMemo } from "react";
import { FiGrid, FiLayers, FiCheckCircle } from "react-icons/fi";

export default function StickerSheetPreview({
  sheetWidth = 18, // inches (landscape default for 12x18)
  sheetHeight = 12, // inches
  stickerWidth = 2, // inches
  stickerHeight = 2, // inches
  sideMargin = 0.25, // inches (margin on 4 sides of sheet)
  gap = 0.125, // inches (gap/bleed between stickers)
  shape = "rectangle", // 'rectangle' | 'round' | 'rounded' | 'oval'
  showLabels = true,
}) {
  // Safe numeric values
  const sW = Math.max(1, Number(sheetWidth) || 18);
  const sH = Math.max(1, Number(sheetHeight) || 12);
  const stW = Math.max(0.2, Number(stickerWidth) || 2);
  const stH = Math.max(0.2, Number(stickerHeight) || 2);
  const margin = Math.max(0, Number(sideMargin) || 0);
  const bleedGap = Math.max(0, Number(gap) || 0);

  // Compute Layout Calculation
  const layout = useMemo(() => {
    const printableW = Math.max(0, sW - 2 * margin);
    const printableH = Math.max(0, sH - 2 * margin);

    // Number of columns: (cols * stW) + ((cols - 1) * bleedGap) <= printableW
    // cols * (stW + bleedGap) - bleedGap <= printableW
    // cols <= (printableW + bleedGap) / (stW + bleedGap)
    const cols = Math.max(0, Math.floor((printableW + bleedGap) / (stW + bleedGap)));
    const rows = Math.max(0, Math.floor((printableH + bleedGap) / (stH + bleedGap)));

    const totalStickers = cols * rows;

    // Total used dimensions by sticker grid
    const usedW = cols > 0 ? cols * stW + (cols - 1) * bleedGap : 0;
    const usedH = rows > 0 ? rows * stH + (rows - 1) * bleedGap : 0;

    // Leftover margins (centered on printable area)
    const startX = margin + (printableW - usedW) / 2;
    const startY = margin + (printableH - usedH) / 2;

    const sheetArea = sW * sH;
    const usedArea = totalStickers * (stW * stH);
    const utilizationPct = sheetArea > 0 ? Math.round((usedArea / sheetArea) * 100) : 0;

    // Generate sticker items coordinates
    const items = [];
    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        count++;
        const x = startX + c * (stW + bleedGap);
        const y = startY + r * (stH + bleedGap);
        items.push({
          id: count,
          row: r + 1,
          col: c + 1,
          x,
          y,
          width: stW,
          height: stH,
        });
      }
    }

    return {
      cols,
      rows,
      totalStickers,
      printableW,
      printableH,
      usedW,
      usedH,
      startX,
      startY,
      utilizationPct,
      items,
    };
  }, [sW, sH, stW, stH, margin, bleedGap]);

  // SVG coordinate scale (using viewBox corresponding to sheet inches with multiplier)
  const scale = 40; // 40 units per inch
  const svgWidth = sW * scale;
  const svgHeight = sH * scale;
  const marginUnits = margin * scale;
  const printableWUnits = (sW - 2 * margin) * scale;
  const printableHUnits = (sH - 2 * margin) * scale;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white flex flex-col space-y-4 shadow-xl border border-slate-800">
      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FiGrid className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Sheet Layout Preview
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {layout.totalStickers} Stickers / Sheet
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {layout.cols} Columns × {layout.rows} Rows &bull; Sheet: {sW}" × {sH}" &bull; 1 Sticker: {stW}" × {stH}"
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
            Efficiency: <strong className="text-blue-400">{layout.utilizationPct}%</strong>
          </span>
          <span className="bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
            Gap / Bleed: <strong className="text-amber-400">{bleedGap}"</strong>
          </span>
        </div>
      </div>

      {/* Visual Canvas Diagram */}
      <div className="relative w-full overflow-hidden bg-slate-950/80 rounded-xl p-3 sm:p-5 flex items-center justify-center border border-slate-800/80 min-h-[320px]">
        <div className="w-full max-w-[650px] aspect-[18/12] flex items-center justify-center">
          <svg
            viewBox={`-25 -25 ${svgWidth + 50} ${svgHeight + 50}`}
            className="w-full h-full drop-shadow-2xl select-none"
            style={{ maxHeight: "420px" }}
          >
            {/* Definitions */}
            <defs>
              <pattern
                id="grid-subtle"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>

            {/* Background Grid behind sheet */}
            <rect
              x="-25"
              y="-25"
              width={svgWidth + 50}
              height={svgHeight + 50}
              fill="url(#grid-subtle)"
            />

            {/* Main Sheet Outline (White paper sheet like user screenshot) */}
            <rect
              x="0"
              y="0"
              width={svgWidth}
              height={svgHeight}
              fill="#E2E8F0"
              rx="4"
              stroke="#94A3B8"
              strokeWidth="1.5"
            />

            {/* Margin / Non-Printable Gripper Area */}
            {margin > 0 && (
              <rect
                x={marginUnits}
                y={marginUnits}
                width={printableWUnits}
                height={printableHUnits}
                fill="#F8FAFC"
                stroke="#CBD5E1"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            )}

            {/* Sheet Center Marker (+) matching reference */}
            <g opacity="0.5">
              <line
                x1={svgWidth / 2 - 8}
                y1={svgHeight / 2}
                x2={svgWidth / 2 + 8}
                y2={svgHeight / 2}
                stroke="#334155"
                strokeWidth="1.5"
              />
              <line
                x1={svgWidth / 2}
                y1={svgHeight / 2 - 8}
                x2={svgWidth / 2}
                y2={svgHeight / 2 + 8}
                stroke="#334155"
                strokeWidth="1.5"
              />
            </g>

            {/* Stickers Grid */}
            {layout.items.map((item) => {
              const xPos = item.x * scale;
              const yPos = item.y * scale;
              const wPos = item.width * scale;
              const hPos = item.height * scale;
              const cx = xPos + wPos / 2;
              const cy = yPos + hPos / 2;
              const r = Math.min(wPos, hPos) / 2;

              return (
                <g key={item.id} className="group cursor-pointer">
                  {/* Sticker Base Rectangle (matching user image's clean sharp cell look) */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width={wPos}
                    height={hPos}
                    fill="#FFFFFF"
                    stroke="#1E293B"
                    strokeWidth="1"
                    className="transition-colors duration-150 group-hover:fill-blue-50"
                  />

                  {/* Specific shape cut line if selected */}
                  {shape === "round" && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r - 1.5}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                    />
                  )}
                  {shape === "rounded" && (
                    <rect
                      x={xPos + 2}
                      y={yPos + 2}
                      width={wPos - 4}
                      height={hPos - 4}
                      rx="6"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                    />
                  )}
                  {shape === "oval" && (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={wPos / 2 - 2}
                      ry={hPos / 2 - 2}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="1.2"
                      strokeDasharray="3 2"
                    />
                  )}

                  {/* Corner / Node Dot on top-left of each sticker just like user's grid screenshot */}
                  <circle
                    cx={xPos}
                    y={yPos}
                    r="1.75"
                    fill="#0F172A"
                    stroke="#FFFFFF"
                    strokeWidth="0.5"
                  />

                  {/* Sticker Index Label */}
                  {wPos > 24 && hPos > 18 && (
                    <text
                      x={cx}
                      y={cy + 3}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="9"
                      fontWeight="600"
                      className="select-none pointer-events-none group-hover:fill-blue-700"
                    >
                      {item.id}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Outer Selection Bounding Box Handles (matching user reference image) */}
            {layout.items.length > 0 && (
              <g pointerEvents="none">
                <rect
                  x={layout.startX * scale}
                  y={layout.startY * scale}
                  width={layout.usedW * scale}
                  height={layout.usedH * scale}
                  fill="none"
                  stroke="#0F172A"
                  strokeWidth="0.75"
                />

                {[
                  { x: layout.startX * scale, y: layout.startY * scale }, // TL
                  { x: (layout.startX + layout.usedW / 2) * scale, y: layout.startY * scale }, // TC
                  { x: (layout.startX + layout.usedW) * scale, y: layout.startY * scale }, // TR
                  { x: layout.startX * scale, y: (layout.startY + layout.usedH / 2) * scale }, // ML
                  { x: (layout.startX + layout.usedW) * scale, y: (layout.startY + layout.usedH / 2) * scale }, // MR
                  { x: layout.startX * scale, y: (layout.startY + layout.usedH) * scale }, // BL
                  { x: (layout.startX + layout.usedW / 2) * scale, y: (layout.startY + layout.usedH) * scale }, // BC
                  { x: (layout.startX + layout.usedW) * scale, y: (layout.startY + layout.usedH) * scale }, // BR
                ].map((handle, idx) => (
                  <rect
                    key={idx}
                    x={handle.x - 3}
                    y={handle.y - 3}
                    width="6"
                    height="6"
                    fill="#0F172A"
                    stroke="#FFFFFF"
                    strokeWidth="1"
                  />
                ))}
              </g>
            )}

            {/* Dimension Callouts on Outside */}
            <text
              x={svgWidth / 2}
              y="-8"
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="10"
              fontWeight="600"
            >
              Width: {sW}"
            </text>

            <text
              x="-8"
              y={svgHeight / 2}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="10"
              fontWeight="600"
              transform={`rotate(-90 -8 ${svgHeight / 2})`}
            >
              Height: {sH}"
            </text>
          </svg>
        </div>
      </div>

      {/* Footer Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 block text-[11px]">Total Yield</span>
          <span className="text-emerald-400 font-bold text-base">
            {layout.totalStickers} pcs <span className="text-xs text-slate-400 font-normal">/ sheet</span>
          </span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 block text-[11px]">Grid Layout</span>
          <span className="text-white font-bold text-base">
            {layout.cols} <span className="text-xs text-slate-400">cols</span> × {layout.rows} <span className="text-xs text-slate-400">rows</span>
          </span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 block text-[11px]">Total Area Used</span>
          <span className="text-blue-400 font-bold text-base">
            {layout.usedW.toFixed(2)}" × {layout.usedH.toFixed(2)}"
          </span>
        </div>
        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 block text-[11px]">Side Bleed Margin</span>
          <span className="text-amber-300 font-bold text-base">
            {margin}" <span className="text-xs text-slate-400 font-normal">border</span>
          </span>
        </div>
      </div>
    </div>
  );
}
