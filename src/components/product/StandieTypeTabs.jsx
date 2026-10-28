import React from "react";
import { FiTv, FiBox, FiLayers, FiCheck } from "react-icons/fi";

export default function StandieTypeTabs({ activeType = "rollup", onSelectType }) {
  const standeeTypes = [
    {
      id: "rollup",
      name: "Roll-Up Standee",
      code: "STD-001",
      subtitle: "Aluminium Cassette Base",
      tag: "2.5 & 3 Ft Width",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description:
        "Portable aluminium cassette with spring roller mechanism, custom height banner, and carry bag.",
      icon: FiTv,
      themeColor: "blue",
    },
    {
      id: "iron-frame",
      name: "Iron Frame Standee",
      code: "STD-002",
      subtitle: "Heavy-Duty Welded MS Pipe",
      tag: "Custom Height & Width",
      badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
      description:
        "Welded square MS iron rod frame with angle legs base, support rods, and double-sided Star Flex.",
      icon: FiBox,
      themeColor: "orange",
    },
    {
      id: "hut",
      name: "Standee Hut (A-Frame)",
      code: "STD-003",
      subtitle: "Dual-Sided Tent / Easel",
      tag: "Iron 3kg / 5kg / Wood",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      description:
        "Triangular A-board tent display with top hinges, heavy-duty wind resistance, and double-sided flex.",
      icon: FiLayers,
      themeColor: "purple",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">
            Select Standee Model
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Choose Standee Structure &amp; Hardware
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
          Switch between portable roll-up, welded iron frame, and A-frame tent models
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {standeeTypes.map((item) => {
          const Icon = item.icon;
          const isActive = activeType === item.id;

          let activeClasses = "border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 text-slate-700";
          if (isActive) {
            if (item.themeColor === "blue") {
              activeClasses = "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 shadow-xs";
            } else if (item.themeColor === "orange") {
              activeClasses = "border-orange-600 bg-orange-50/60 ring-2 ring-orange-500/20 text-orange-900 shadow-xs";
            } else if (item.themeColor === "purple") {
              activeClasses = "border-purple-600 bg-purple-50/60 ring-2 ring-purple-500/20 text-purple-900 shadow-xs";
            }
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectType && onSelectType(item.id)}
              className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${activeClasses}`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs">
                  <FiCheck className="w-3 h-3" />
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`p-2 rounded-lg ${
                      isActive
                        ? "bg-white text-slate-900 shadow-xs"
                        : "bg-white text-slate-500 border border-slate-200 group-hover:text-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.badgeColor}`}
                  >
                    #{item.code}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 leading-snug">
                  {item.name}
                </h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {item.subtitle}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-600">{item.tag}</span>
                <span
                  className={`font-bold ${
                    isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {isActive ? "Active Calculator" : "Select Model →"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
