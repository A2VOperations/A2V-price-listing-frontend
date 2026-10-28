import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useData } from "@/context/DataContext";
import Breadcrumb from "@/components/common/Breadcrumb";
import EmptyState from "@/components/common/EmptyState";
import FlexBoardOrderForm from "@/components/product/FlexBoardOrderForm";
import StandieOrderForm from "@/components/product/StandieOrderForm";
import RollUpStandieOrderForm from "@/components/product/RollUpStandieOrderForm";
import StandieHutOrderForm from "@/components/product/StandieHutOrderForm";
import StickerCalculator from "@/components/product/StickerCalculator";
import StandieTypeTabs from "@/components/product/StandieTypeTabs";
import {
  FiMaximize2,
  FiTv,
  FiTag,
  FiSliders,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import { TbCalculator } from "react-icons/tb";

export default function CalculatorsPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getProductBySlug, loading } = useData();

  // Normalize active section from route or query: 'flex-board' | 'standee' | 'stickers'
  const validSections = ["flex-board", "standee", "stickers"];
  const initialSection =
    type && validSections.includes(type.toLowerCase())
      ? type.toLowerCase()
      : searchParams.get("tab") || "flex-board";

  const [activeSection, setActiveSection] = useState(initialSection);

  // Standee model sub-tab: 'rollup' | 'iron-frame' | 'hut'
  const initialModel = searchParams.get("model") || "rollup";
  const [standeeModel, setStandeeModel] = useState(initialModel);

  // Synchronize state when URL param changes
  useEffect(() => {
    if (type && validSections.includes(type.toLowerCase())) {
      setActiveSection(type.toLowerCase());
    }
  }, [type]);

  const handleSelectSection = (sec) => {
    setActiveSection(sec);
    navigate(`/calculators/${sec}`);
  };

  const handleSelectStandeeModel = (model) => {
    setStandeeModel(model);
    setSearchParams({ model });
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

  // Calculator sections configuration
  const calculatorTabs = [
    {
      id: "flex-board",
      name: "Flex Board Calculator",
      shortTitle: "Flex Board",
      badge: "Custom Sq.Ft & Frame",
      desc: "Iron / Wooden Structure, Support Rods & Fitting",
      icon: FiMaximize2,
      accentColor: "border-orange-600 text-orange-600 bg-orange-50/50",
    },
    {
      id: "standee",
      name: "Standee Calculator",
      shortTitle: "Standee Displays",
      badge: "Roll-Up / Iron / Hut",
      desc: "Aluminium Cassette, Welded MS Frame & A-Frame Tents",
      icon: FiTv,
      accentColor: "border-blue-600 text-blue-600 bg-blue-50/50",
    },
    {
      id: "stickers",
      name: "Sticker Calculator",
      shortTitle: "Stickers & Labels",
      badge: "12×18 & 13×19 Sheets",
      desc: "Automatic Sheet Nesting, Die-Cuts, Half & Full Cuts",
      icon: FiTag,
      accentColor: "border-emerald-600 text-emerald-600 bg-emerald-50/50",
    },
  ];

  const currentTab = calculatorTabs.find((t) => t.id === activeSection) || calculatorTabs[0];

  const breadcrumbItems = [
    { label: "Price Calculators", href: "/calculators" },
    { label: currentTab.name },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Section Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 font-mono">
                <TbCalculator className="w-3.5 h-3.5 text-orange-400" />
                Custom Price Calculators
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• Live Dimensions &amp; Estimates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Printing &amp; Hardware Price Calculators
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Calculate exact custom dimension pricing, structure materials, hardware specifications,
              and sheet nesting layouts with instant PDF quotation downloads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-3 flex items-center gap-3 shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Active Tool
                </p>
                <p className="text-xs font-black text-orange-400">
                  {currentTab.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Level Section Switcher Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {calculatorTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectSection(tab.id)}
                className={`p-3.5 rounded-xl text-left transition-all border flex items-start gap-3 cursor-pointer ${
                  isActive
                    ? "bg-slate-800 border-orange-500 text-white shadow-md ring-1 ring-orange-500/40"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600"
                }`}
              >
                <span
                  className={`p-2 rounded-lg mt-0.5 ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : "bg-slate-700/80 text-slate-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold truncate">
                      {tab.shortTitle}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        isActive
                          ? "bg-orange-500/20 text-orange-300"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {tab.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Standee Sub-Tabs (Roll-Up, Iron Frame, Standee Hut) */}
      {activeSection === "standee" && (
        <StandieTypeTabs
          activeType={standeeModel}
          onSelectType={handleSelectStandeeModel}
        />
      )}

      {/* Main Interactive Calculator Container */}
      <div className="min-w-0">
        {activeSection === "flex-board" && (
          <FlexBoardOrderForm product={flexProduct} />
        )}

        {activeSection === "standee" && (
          <>
            {standeeModel === "rollup" && (
              <RollUpStandieOrderForm product={rollupProduct} />
            )}
            {standeeModel === "iron-frame" && (
              <StandieOrderForm product={ironStandieProduct} />
            )}
            {standeeModel === "hut" && (
              <StandieHutOrderForm product={hutStandieProduct} />
            )}
          </>
        )}

        {activeSection === "stickers" && (
          <StickerCalculator product={stickerProduct} />
        )}
      </div>
    </div>
  );
}
