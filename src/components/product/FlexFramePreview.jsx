import React from "react";

export default function FlexFramePreview({
  height,
  width,
  boardType,
  supportRodType,
  supportRodCount,
  customRodLength,
  runningFeetDetails,
}) {
  const h = Number(height) || 0;
  const w = Number(width) || 0;
  const rodCount = Number(supportRodCount) || 0;
  const isBoardActive = boardType !== "None" && boardType !== "";
  const isSupportActive = isBoardActive && supportRodType !== "None" && rodCount > 0;

  // Compute SVG aspect ratio limits
  const maxCanvasWidth = 320;
  const maxCanvasHeight = 180;
  const padding = 40;

  const flexRatio = w > 0 && h > 0 ? w / h : 16 / 9;

  let rectWidth = maxCanvasWidth - padding * 2;
  let rectHeight = rectWidth / flexRatio;

  if (rectHeight > maxCanvasHeight - padding * 2) {
    rectHeight = maxCanvasHeight - padding * 2;
    rectWidth = rectHeight * flexRatio;
  }

  const startX = (maxCanvasWidth - rectWidth) / 2;
  const startY = (maxCanvasHeight - rectHeight) / 2;

  // Support rod lines coordinates
  const supportLines = [];
  if (isSupportActive) {
    if (supportRodType === "Horizontal") {
      const step = rectHeight / (rodCount + 1);
      for (let i = 1; i <= rodCount; i++) {
        const y = startY + step * i;
        supportLines.push({
          x1: startX,
          y1: y,
          x2: startX + rectWidth,
          y2: y,
          label: `${w} ft`,
        });
      }
    } else if (supportRodType === "Vertical") {
      const step = rectWidth / (rodCount + 1);
      for (let i = 1; i <= rodCount; i++) {
        const x = startX + step * i;
        supportLines.push({
          x1: x,
          y1: startY,
          x2: x,
          y2: startY + rectHeight,
          label: `${h} ft`,
        });
      }
    } else if (supportRodType === "Custom") {
      const step = rectHeight / (rodCount + 1);
      for (let i = 1; i <= rodCount; i++) {
        const y = startY + step * i;
        supportLines.push({
          x1: startX,
          y1: y,
          x2: startX + rectWidth,
          y2: y,
          label: `${customRodLength} ft`,
        });
      }
    }
  }

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 shadow-md border border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Frame Diagram Preview
          </h4>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
          {h} ft × {w} ft ({h * w} sqft)
        </span>
      </div>

      {/* SVG Frame Graphic */}
      <div className="relative flex justify-center items-center py-2 bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-hidden">
        <svg
          viewBox={`0 0 ${maxCanvasWidth} ${maxCanvasHeight}`}
          className="w-full max-h-48 drop-shadow-md"
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Flex Banner Fill Background */}
          <rect
            x={startX}
            y={startY}
            width={rectWidth}
            height={rectHeight}
            className="fill-blue-600/10 stroke-blue-500/30"
            strokeWidth="1"
          />

          {/* Outer Frame Perimeter (Iron / Wooden Frame) */}
          {isBoardActive ? (
            <rect
              x={startX}
              y={startY}
              width={rectWidth}
              height={rectHeight}
              fill="none"
              stroke={boardType === "Iron Board" ? "#38bdf8" : "#f59e0b"}
              strokeWidth="3"
              strokeDasharray="0"
            />
          ) : (
            <rect
              x={startX}
              y={startY}
              width={rectWidth}
              height={rectHeight}
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Support Rods Lines */}
          {supportLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={boardType === "Iron Board" ? "#0284c7" : "#d97706"}
                strokeWidth="2.5"
                strokeDasharray="2 2"
              />
              <text
                x={(line.x1 + line.x2) / 2}
                y={(line.y1 + line.y2) / 2 - 4}
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="10"
                fontWeight="bold"
                className="select-none font-mono drop-shadow-md"
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Outer Dimension Labels */}
          {/* Top Width */}
          <text
            x={startX + rectWidth / 2}
            y={Math.max(16, startY - 8)}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="11"
            fontWeight="bold"
            className="select-none font-mono"
          >
            {w} ft
          </text>

          {/* Bottom Width */}
          <text
            x={startX + rectWidth / 2}
            y={Math.min(maxCanvasHeight - 6, startY + rectHeight + 16)}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="11"
            fontWeight="bold"
            className="select-none font-mono"
          >
            {w} ft
          </text>

          {/* Left Height */}
          <text
            x={Math.max(12, startX - 12)}
            y={startY + rectHeight / 2 + 4}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="11"
            fontWeight="bold"
            className="select-none font-mono"
          >
            {h} ft
          </text>

          {/* Right Height */}
          <text
            x={Math.min(maxCanvasWidth - 12, startX + rectWidth + 12)}
            y={startY + rectHeight / 2 + 4}
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="11"
            fontWeight="bold"
            className="select-none font-mono"
          >
            {h} ft
          </text>

          {/* Outer Corner Nodes */}
          <circle cx={startX} cy={startY} r="3" fill="#38bdf8" />
          <circle cx={startX + rectWidth} cy={startY} r="3" fill="#38bdf8" />
          <circle cx={startX} cy={startY + rectHeight} r="3" fill="#38bdf8" />
          <circle cx={startX + rectWidth} cy={startY + rectHeight} r="3" fill="#38bdf8" />
        </svg>
      </div>

      {/* Frame Running Feet Formula Display */}
      {isBoardActive ? (
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
          <div className="text-slate-400 font-semibold flex justify-between">
            <span>Running Feet Calculation:</span>
            <span className="text-amber-400 font-bold">
              {runningFeetDetails.totalRunningFeet} Running Feet
            </span>
          </div>
          <div className="text-blue-300 font-bold tracking-tight">
            {runningFeetDetails.formula} = {runningFeetDetails.totalRunningFeet} ft
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-400 text-[11px] italic py-1">
          No Board Structure Selected (Flex Banner Only)
        </div>
      )}
    </div>
  );
}
