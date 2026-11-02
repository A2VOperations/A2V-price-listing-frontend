import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import EmptyState from "@/components/common/EmptyState";
import FlexBoardOrderForm from "@/components/product/FlexBoardOrderForm";
import StandieOrderForm from "@/components/product/StandieOrderForm";
import RollUpStandieOrderForm from "@/components/product/RollUpStandieOrderForm";
import StandieHutOrderForm from "@/components/product/StandieHutOrderForm";
import StickerCalculator from "@/components/product/StickerCalculator";
import {
  FiMaximize2,
  FiTv,
  FiTag,
  FiBox,
  FiLayers,
  FiCheck,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { TbCalculator } from "react-icons/tb";

export default function CalculatorsPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getProductBySlug, loading } = useData();

  // Active section: 'flex-board' | 'standee' | 'stickers'
  const validSections = ["flex-board", "standee", "stickers"];
  const currentSection =
    type && validSections.includes(type.toLowerCase())
      ? type.toLowerCase()
      : searchParams.get("tab") || "standee";

  // Standee model filter: 'rollup' | 'iron-frame' | 'hut'
  const currentStandeeModel = searchParams.get("model") || "rollup";

  const handleSelectStandeeModel = (modelId) => {
    setSearchParams({ model: modelId });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">
          Loading price calculators from database...
        </p>
      </div>
    );
  }

  // Retrieve products from database / context
  const flexProduct =
    getProductBySlug("flex-board-printing") ||
    getProductBySlug("flex-board") || {
      id: "FB-001",
      code: "FB-001",
      name: "Flex Board Printing & Frame Calculator",
      categoryId: "flex-board",
      subCategory: "FLEX BOARD PRINTING",
      slug: "flex-board-printing",
      description:
        "Custom Flex Board printing & framing calculator with Iron/Wooden structure options, support rods, and fitting.",
    };

  const rollupProduct =
    getProductBySlug("rollup-standie") ||
    getProductBySlug("STD-001") || {
      id: "STD-001",
      code: "STD-001",
      name: "Roll-Up Standee (Machine + Custom Height Banner)",
      categoryId: "flex-board",
      subCategory: "STANDIE",
      slug: "rollup-standie",
      isRollUpStandie: true,
    };

  const ironStandieProduct =
    getProductBySlug("iron-frame-standie") ||
    getProductBySlug("STD-002") || {
      id: "STD-002",
      code: "STD-002",
      name: "Iron Frame Standee & Flex Display Calculator",
      categoryId: "flex-board",
      subCategory: "STANDIE",
      slug: "iron-frame-standie",
      isStandie: true,
    };

  const hutStandieProduct =
    getProductBySlug("standee-hut") ||
    getProductBySlug("STD-003") || {
      id: "STD-003",
      code: "STD-003",
      name: "Standee Hut (A-Frame Tent Display)",
      categoryId: "flex-board",
      subCategory: "STANDIE",
      slug: "standee-hut",
      isHutStandie: true,
    };

  const stickerProduct =
    getProductBySlug("waterproof-vinyl-die-cut-sticker") ||
    getProductBySlug("SL-001") || {
      id: "SL-001",
      code: "SL-001",
      name: "Sticker Sheet Calculator (12×18 & 13×19)",
      categoryId: "stickers-labels",
      subCategory: "STICKERS & LABELS",
      slug: "waterproof-vinyl-die-cut-sticker",
      isSticker: true,
    };

  // 3 Standee categories / models definition
  const standeeCategories = [
    {
      id: "rollup",
      code: "STD-001",
      name: "Roll-Up Standee",
      subtitle: "Aluminium Cassette Base",
      tag: "2.5 & 3 Ft Width",
      description:
        "Portable aluminium cassette with spring roller mechanism, Star Flex media, and padded carry bag included.",
      icon: FiTv,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      activeClasses:
        "border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20 text-blue-900 shadow-sm",
    },
    {
      id: "iron-frame",
      code: "STD-002",
      name: "Iron Frame Standee",
      subtitle: "Heavy-Duty Welded MS Pipe",
      tag: "Custom Height & Width",
      description:
        "Welded square MS iron pipe frame with angle leg base, support rods, and double-sided Star Flex display.",
      icon: FiBox,
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      activeClasses:
        "border-orange-600 bg-orange-50/70 ring-2 ring-orange-500/20 text-orange-900 shadow-sm",
    },
    {
      id: "hut",
      code: "STD-003",
      name: "Standee Hut (A-Frame)",
      subtitle: "Dual-Sided Tent / Easel Display",
      tag: "Iron 3kg / 5kg / Wood",
      description:
        "Triangular A-board tent structure with top hinges, high wind resistance, and dual-sided branding for pavements.",
      icon: FiLayers,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      activeClasses:
        "border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20 text-purple-900 shadow-sm",
    },
  ];

  // =========================================================================
  // VIEW 1: FLEX BOARD CALCULATOR (DEDICATED - ONLY FLEX BOARD SHOWS)
  // =========================================================================
  if (currentSection === "flex-board") {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Flex Board Calculator" }]} />

        {/* Dedicated Page Header for Flex Board */}
        <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-600 text-white shadow-xs">
                <FiMaximize2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Flex Board Printing &amp; Frame Calculator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Calculate exact square feet rates, Star &amp; Normal flex materials, welded MS iron / wooden batten framing, support rods, and on-site fitting.
            </p>
          </div>

          
        </div>

        {/* Dedicated Flex Board Calculator Form */}
        <FlexBoardOrderForm product={flexProduct} />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: STICKER SHEET CALCULATOR (DEDICATED - ONLY STICKERS SHOW)
  // =========================================================================
  if (currentSection === "stickers") {
    return (
      <div className="space-y-6">
        <Breadcrumb items={[{ label: "Sticker Sheet Calculator" }]} />

        {/* Dedicated Page Header for Stickers */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                <FiTag className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Sticker Sheet Calculator (12×18 &amp; 13×19)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Automatic sheet nesting calculation for custom sticker dimensions, Chromo paper, waterproof Vinyl (Gloss/Matte), and precision die-cutting.
            </p>
          </div>

          
        </div>

        {/* Dedicated Sticker Calculator Form */}
        <StickerCalculator product={stickerProduct} />
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: STANDEE DISPLAYS & DEDICATED CALCULATOR SYSTEM
  // Shows the 3 Standee categories FIRST, then opens the selected calculator!
  // =========================================================================
  const activeModelDetails =
    standeeCategories.find((m) => m.id === currentStandeeModel) ||
    standeeCategories[0];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Standee Displays", href: "/calculators/standee" },
          { label: activeModelDetails.name },
        ]}
      />

      {/* Standee Hub Header */}
      <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <FiTv className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Standee Displays &amp; Calculator System
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Select one of the 3 Standee categories below to view its hardware specifications and use its dedicated calculator system.
          </p>
        </div>

       
      </div>

      {/* STEP 1: PROMINENT DISPLAY OF THE 3 STANDEE CATEGORIES FIRST */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
              Standee Categories
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Choose Standee Structure &amp; Model
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            3 Categories Available • Click to switch calculator system
          </span>
        </div>

        {/* 3 Categories Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standeeCategories.map((item) => {
            const Icon = item.icon;
            const isSelected = currentStandeeModel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectStandeeModel(item.id)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? item.activeClasses
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50 text-slate-700"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs">
                    <FiCheck className="w-3 h-3" />
                  </span>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`p-2 rounded-lg ${
                        isSelected
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

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                    {item.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-600">{item.tag}</span>
                  <span
                    className={`font-bold ${
                      isSelected
                        ? "text-blue-700 font-extrabold"
                        : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  >
                    {isSelected ? "Active Calculator System" : "Open System →"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: DEDICATED CALCULATOR SYSTEM FOR THE SELECTED STANDEE MODEL */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Active Calculator: {activeModelDetails.name} (#{activeModelDetails.code})
            </h3>
          </div>
        </div>

        {currentStandeeModel === "rollup" && (
          <RollUpStandieOrderForm product={rollupProduct} />
        )}
        {currentStandeeModel === "iron-frame" && (
          <StandieOrderForm product={ironStandieProduct} />
        )}
        {currentStandeeModel === "hut" && (
          <StandieHutOrderForm product={hutStandieProduct} />
        )}
      </div>
    </div>
  );
}
