import React, { useState, useEffect, useCallback, useMemo } from "react";
import AdminLayout from "./AdminLayout";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPaperMastersApi,
  createPaperMasterApi,
  updatePaperMasterApi,
  deletePaperMasterApi,
  fetchPrintingRatesApi,
  updatePrintingRateApi,
  fetchBindingRatesApi,
  updateBindingRateApi,
  fetchFinishingRatesApi,
  updateFinishingRateApi,
} from "@/services/api";
import {
  FiSliders,
  FiFileText,
  FiLayers,
  FiScissors,
  FiHash,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiSearch,
  FiAlertCircle,
  FiInfo,
  FiFilter,
} from "react-icons/fi";

export default function PrintingRatesManager() {
  const { token, isManagerOrAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("papers"); // "papers" | "offset" | "digital" | "binding" | "finishing"

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Masters Data State
  const [papers, setPapers] = useState([]);
  const [printingRates, setPrintingRates] = useState([]);
  const [bindingRates, setBindingRates] = useState([]);
  const [finishingRates, setFinishingRates] = useState([]);

  // Search & Dynamic Filters for papers
  const [paperSearch, setPaperSearch] = useState("");
  const [sheetSizeFilter, setSheetSizeFilter] = useState("all");
  const [paperTypeFilter, setPaperTypeFilter] = useState("all");
  const [gsmFilter, setGsmFilter] = useState("all");
  const [paperColourFilter, setPaperColourFilter] = useState("all");

  // ADD NEW SHEET MODAL STATE
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [newSheetForm, setNewSheetForm] = useState({
    rawWidthInch: "18",
    rawHeightInch: "22",
    paperType: "Newspaper",
    gsm: "58",
    looseSheetRate: "1.20",
    reamRate: "520",
    colour: "White",
    description: "",
  });
  const [isAddingSheet, setIsAddingSheet] = useState(false);

  // EDIT SHEET MODAL STATE
  const [editingSheet, setEditingSheet] = useState(null);
  const [editSheetForm, setEditSheetForm] = useState({
    rawWidthInch: "",
    rawHeightInch: "",
    paperType: "",
    gsm: "",
    looseSheetRate: "",
    reamRate: "",
    colour: "",
    description: "",
  });
  const [isUpdatingSheet, setIsUpdatingSheet] = useState(false);

  // OTHER RATE MODALS
  const [editingPrintRate, setEditingPrintRate] = useState(null);
  const [printRateForm, setPrintRateForm] = useState({ rate: "", notes: "" });
  const [isSavingPrintRate, setIsSavingPrintRate] = useState(false);

  const [editingBindingRate, setEditingBindingRate] = useState(null);
  const [bindingRateForm, setBindingRateForm] = useState({ ratePerBook: "", notes: "" });
  const [isSavingBindingRate, setIsSavingBindingRate] = useState(false);

  const [editingFinishingRate, setEditingFinishingRate] = useState(null);
  const [finishingRateForm, setFinishingRateForm] = useState({ ratePerBook: "", notes: "" });
  const [isSavingFinishingRate, setIsSavingFinishingRate] = useState(false);

  // Load all rates
  const loadAllRates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [papersData, printData, bindData, finishData] = await Promise.all([
        fetchPaperMastersApi({}, token),
        fetchPrintingRatesApi(),
        fetchBindingRatesApi(),
        fetchFinishingRatesApi(),
      ]);

      setPapers(Array.isArray(papersData) ? papersData : []);
      setPrintingRates(Array.isArray(printData) ? printData : []);
      setBindingRates(Array.isArray(bindData) ? bindData : []);
      setFinishingRates(Array.isArray(finishData) ? finishData : []);
    } catch (err) {
      console.error("Failed to fetch printing masters:", err);
      setError(err.message || "Failed to load master rates from database.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAllRates();
  }, [loadAllRates]);

  // Handle Add New Sheet Submit
  const handleAddSheetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!newSheetForm.rawWidthInch || !newSheetForm.rawHeightInch || !newSheetForm.gsm) {
      setError("Sheet dimensions and GSM are required.");
      return;
    }

    try {
      setIsAddingSheet(true);
      await createPaperMasterApi(
        {
          rawWidthInch: Number(newSheetForm.rawWidthInch),
          rawHeightInch: Number(newSheetForm.rawHeightInch),
          paperType: newSheetForm.paperType.trim() || "Newspaper",
          gsm: Number(newSheetForm.gsm),
          looseSheetRate: Number(newSheetForm.looseSheetRate) || 0,
          reamRate: Number(newSheetForm.reamRate) || 0,
          colour: newSheetForm.colour.trim() || "White",
          description: newSheetForm.description,
        },
        token
      );
      setSuccessMsg(
        `Sheet '${newSheetForm.rawWidthInch} * ${newSheetForm.rawHeightInch}' (${newSheetForm.paperType}, ${newSheetForm.gsm} GSM, ${newSheetForm.colour}) added successfully!`
      );
      setIsAddSheetOpen(false);
      setNewSheetForm({
        rawWidthInch: "18",
        rawHeightInch: "22",
        paperType: "Newspaper",
        gsm: "58",
        looseSheetRate: "",
        reamRate: "",
        colour: "White",
        description: "",
      });
      loadAllRates();
    } catch (err) {
      setError(err.message || "Failed to add new sheet.");
    } finally {
      setIsAddingSheet(false);
    }
  };

  // Open Edit Sheet Modal
  const openEditSheetModal = (p) => {
    const loose = p.currentRate?.looseRatePerSheet ?? p.activeRate?.looseSheetRate ?? 0;
    const ream = p.currentRate?.reamRate ?? p.activeRate?.reamRate ?? 0;
    setEditingSheet(p);
    setEditSheetForm({
      rawWidthInch: p.rawSheetWidth || p.rawWidthInch,
      rawHeightInch: p.rawSheetHeight || p.rawHeightInch,
      paperType: p.paperType || "Newspaper",
      gsm: p.gsm,
      looseSheetRate: loose,
      reamRate: ream,
      colour: p.colour || "White",
      description: p.description || "",
    });
    setError("");
  };

  // Handle Edit Sheet Submit
  const handleEditSheetSubmit = async (e) => {
    e.preventDefault();
    if (!editingSheet) return;
    setError("");
    setSuccessMsg("");

    try {
      setIsUpdatingSheet(true);
      await updatePaperMasterApi(
        editingSheet._id || editingSheet.id,
        {
          rawWidthInch: Number(editSheetForm.rawWidthInch),
          rawHeightInch: Number(editSheetForm.rawHeightInch),
          paperType: editSheetForm.paperType.trim(),
          gsm: Number(editSheetForm.gsm),
          looseSheetRate: Number(editSheetForm.looseSheetRate),
          reamRate: Number(editSheetForm.reamRate),
          colour: editSheetForm.colour.trim(),
          description: editSheetForm.description,
        },
        token
      );
      setSuccessMsg(
        `Sheet '${editSheetForm.rawWidthInch} * ${editSheetForm.rawHeightInch}' (${editSheetForm.colour}) updated successfully!`
      );
      setEditingSheet(null);
      loadAllRates();
    } catch (err) {
      setError(err.message || "Failed to update sheet.");
    } finally {
      setIsUpdatingSheet(false);
    }
  };

  // Handle Delete Sheet
  const handleDeleteSheet = async (p) => {
    const sheetId = p._id || p.id;
    const size = `${p.rawSheetWidth || p.rawWidthInch} * ${p.rawSheetHeight || p.rawHeightInch}`;
    if (
      window.confirm(
        `Are you sure you want to delete/deactivate sheet "${size}" (${p.paperType || "Paper"}, ${p.gsm} GSM, ${p.colour})?`
      )
    ) {
      try {
        setError("");
        await deletePaperMasterApi(sheetId, token);
        setSuccessMsg(`Sheet '${size}' removed.`);
        loadAllRates();
      } catch (err) {
        setError(err.message || "Failed to delete sheet.");
      }
    }
  };

  // Handle Printing Rate Submit
  const handlePrintRateSubmit = async (e) => {
    e.preventDefault();
    if (!editingPrintRate) return;
    setError("");
    setSuccessMsg("");

    try {
      setIsSavingPrintRate(true);
      await updatePrintingRateApi(
        editingPrintRate.rateKey,
        {
          rate: Number(printRateForm.rate),
          notes: printRateForm.notes,
        },
        token
      );
      setSuccessMsg(`Rate for '${editingPrintRate.name}' updated to ₹${printRateForm.rate}!`);
      setEditingPrintRate(null);
      loadAllRates();
    } catch (err) {
      setError(err.message || "Failed to update printing rate.");
    } finally {
      setIsSavingPrintRate(false);
    }
  };

  // Handle Binding Rate Submit
  const handleBindingRateSubmit = async (e) => {
    e.preventDefault();
    if (!editingBindingRate) return;
    setError("");
    setSuccessMsg("");

    try {
      setIsSavingBindingRate(true);
      await updateBindingRateApi(
        editingBindingRate.bindingCode,
        {
          ratePerBook: Number(bindingRateForm.ratePerBook),
          notes: bindingRateForm.notes,
        },
        token
      );
      setSuccessMsg(`Binding rate for '${editingBindingRate.name}' updated!`);
      setEditingBindingRate(null);
      loadAllRates();
    } catch (err) {
      setError(err.message || "Failed to update binding rate.");
    } finally {
      setIsSavingBindingRate(false);
    }
  };

  // Handle Finishing Rate Submit
  const handleFinishingRateSubmit = async (e) => {
    e.preventDefault();
    if (!editingFinishingRate) return;
    setError("");
    setSuccessMsg("");

    try {
      setIsSavingFinishingRate(true);
      await updateFinishingRateApi(
        editingFinishingRate.serviceKey,
        {
          ratePerBook: Number(finishingRateForm.ratePerBook),
          notes: finishingRateForm.notes,
        },
        token
      );
      setSuccessMsg(`Finishing rate for '${editingFinishingRate.serviceName}' updated!`);
      setEditingFinishingRate(null);
      loadAllRates();
    } catch (err) {
      setError(err.message || "Failed to update finishing rate.");
    } finally {
      setIsSavingFinishingRate(false);
    }
  };

  // Dynamic filter options derived directly from fetched papers data
  const uniqueSheetSizes = useMemo(() => {
    const sizeMap = new Map();
    papers.forEach((p) => {
      const w = Number(p.rawSheetWidth || p.rawWidthInch || 0);
      const h = Number(p.rawSheetHeight || p.rawHeightInch || 0);
      if (w > 0 && h > 0) {
        const key = `${w}x${h}`;
        if (!sizeMap.has(key)) {
          sizeMap.set(key, { key, w, h, label: `${w}" × ${h}"` });
        }
      }
    });
    return Array.from(sizeMap.values()).sort((a, b) => a.w - b.w || a.h - b.h);
  }, [papers]);

  const uniquePaperTypes = useMemo(() => {
    const types = new Set();
    papers.forEach((p) => {
      const t = (p.paperType || "").trim();
      if (t) types.add(t);
    });
    return Array.from(types).sort();
  }, [papers]);

  const uniqueGsms = useMemo(() => {
    const gsms = new Set();
    papers.forEach((p) => {
      const g = Number(p.gsm);
      if (g > 0) gsms.add(g);
    });
    return Array.from(gsms).sort((a, b) => a - b);
  }, [papers]);

  const uniqueColours = useMemo(() => {
    const cols = new Set();
    papers.forEach((p) => {
      const c = (p.colour || "").trim();
      if (c) cols.add(c);
    });
    return Array.from(cols).sort();
  }, [papers]);

  const hasActiveFilters =
    paperSearch.trim() !== "" ||
    sheetSizeFilter !== "all" ||
    paperTypeFilter !== "all" ||
    gsmFilter !== "all" ||
    paperColourFilter !== "all";

  const clearFilters = () => {
    setPaperSearch("");
    setSheetSizeFilter("all");
    setPaperTypeFilter("all");
    setGsmFilter("all");
    setPaperColourFilter("all");
  };

  // Filtered papers matching all active criteria
  const filteredPapers = useMemo(() => {
    return papers.filter((p) => {
      const w = Number(p.rawSheetWidth || p.rawWidthInch || 0);
      const h = Number(p.rawSheetHeight || p.rawHeightInch || 0);
      const typeStr = (p.paperType || "").trim();
      const gsmNum = Number(p.gsm || 0);
      const colourStr = (p.colour || "").trim();

      const term = paperSearch.trim().toLowerCase();
      const sizeStr = `${w} * ${h}`.toLowerCase();
      const sizeStrX = `${w}x${h}`.toLowerCase();

      const matchesSearch =
        !term ||
        sizeStr.includes(term) ||
        sizeStrX.includes(term) ||
        typeStr.toLowerCase().includes(term) ||
        `${gsmNum}`.includes(term) ||
        colourStr.toLowerCase().includes(term) ||
        (p.description || "").toLowerCase().includes(term);

      const matchesSize =
        sheetSizeFilter === "all" || `${w}x${h}` === sheetSizeFilter;

      const matchesType =
        paperTypeFilter === "all" ||
        typeStr.toLowerCase() === paperTypeFilter.toLowerCase();

      const matchesGsm =
        gsmFilter === "all" || gsmNum === Number(gsmFilter);

      const matchesColour =
        paperColourFilter === "all" ||
        colourStr.toLowerCase() === paperColourFilter.toLowerCase();

      return matchesSearch && matchesSize && matchesType && matchesGsm && matchesColour;
    });
  }, [papers, paperSearch, sheetSizeFilter, paperTypeFilter, gsmFilter, paperColourFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <FiSliders className="w-5 h-5 text-orange-600" /> Printing Master &amp; Paper Sheet Control
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add and customize raw paper sheets, GSM, loose rates, and rim rates. Powers the live commercial price listing engine.
            </p>
          </div>

          <button
            onClick={loadAllRates}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-800">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-500 hover:text-emerald-800">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("papers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "papers"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FiFileText className="w-4 h-4 text-orange-500" />
            <span>Sheet Table &amp; Pricing ({papers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("offset")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "offset"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FiLayers className="w-4 h-4 text-orange-500" />
            <span>Mini Offset Rates</span>
          </button>

          <button
            onClick={() => setActiveTab("digital")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "digital"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FiSliders className="w-4 h-4 text-orange-500" />
            <span>Digital Printing Rates</span>
          </button>

          <button
            onClick={() => setActiveTab("binding")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "binding"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FiScissors className="w-4 h-4 text-orange-500" />
            <span>Binding Rates</span>
          </button>

          <button
            onClick={() => setActiveTab("finishing")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "finishing"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FiHash className="w-4 h-4 text-orange-500" />
            <span>Finishing Rates</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: PAPER SHEET TABLE & PRICING */}
        {/* ============================================================== */}
        {activeTab === "papers" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            {/* Table Action Bar with Dynamic Filters */}
            <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3.5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full lg:w-80">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={paperSearch}
                    onChange={(e) => setPaperSearch(e.target.value)}
                    placeholder="Search size, paper type, GSM, color..."
                    className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
                  />
                  {paperSearch && (
                    <button
                      type="button"
                      onClick={() => setPaperSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Add New Sheet Button */}
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setIsAddSheetOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <FiPlus className="w-4 h-4" /> Add New Sheet
                </button>
              </div>

              {/* Dynamic Filter Selectors (Fetched directly from database papers) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider mr-1">
                  <FiFilter className="w-3.5 h-3.5 text-orange-600" /> Filters:
                </span>

                {/* 1. Sheet Size Filter */}
                <select
                  value={sheetSizeFilter}
                  onChange={(e) => setSheetSizeFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="all">All Sheet Sizes ({uniqueSheetSizes.length})</option>
                  {uniqueSheetSizes.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>

                {/* 2. Paper Type Filter */}
                <select
                  value={paperTypeFilter}
                  onChange={(e) => setPaperTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="all">All Paper Types ({uniquePaperTypes.length})</option>
                  {uniquePaperTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* 3. GSM Filter */}
                <select
                  value={gsmFilter}
                  onChange={(e) => setGsmFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="all">All GSM ({uniqueGsms.length})</option>
                  {uniqueGsms.map((g) => (
                    <option key={g} value={g}>
                      {g} GSM
                    </option>
                  ))}
                </select>

                {/* 4. Color Filter */}
                <select
                  value={paperColourFilter}
                  onChange={(e) => setPaperColourFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="all">All Colours ({uniqueColours.length})</option>
                  {uniqueColours.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                    title="Reset all active filters"
                  >
                    <FiX className="w-3.5 h-3.5" /> Clear Filters
                  </button>
                )}

                {/* Result Count Badge */}
                <span className="text-[11px] text-slate-400 font-medium ml-auto">
                  Showing <strong className="text-slate-800">{filteredPapers.length}</strong> of {papers.length} sheets
                </span>
              </div>
            </div>

            {/* Exact 6-Column Format Sheet Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">1. Sheet Size</th>
                    <th className="py-3.5 px-4">2. Paper Type</th>
                    <th className="py-3.5 px-4">3. GSM</th>
                    <th className="py-3.5 px-4">4. Loose Price</th>
                    <th className="py-3.5 px-4">5. Rim Price</th>
                    <th className="py-3.5 px-4">6. Color Sheet</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && papers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-600 rounded-full animate-spin mx-auto mb-2" />
                        Loading sheets from database collection...
                      </td>
                    </tr>
                  ) : filteredPapers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <p className="font-semibold text-slate-600 mb-1">No sheets match your selected filter criteria.</p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-2 text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                          >
                            Clear all filters
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredPapers.map((p) => {
                      const width = p.rawSheetWidth || p.rawWidthInch || 18;
                      const height = p.rawSheetHeight || p.rawHeightInch || 22;
                      const sizeLabel = `${width} * ${height}`;
                      const paperType = p.paperType || "Maplitho";
                      const looseRate = Number(p.currentRate?.looseRatePerSheet ?? p.activeRate?.looseSheetRate ?? 0);
                      const reamRate = Number(p.currentRate?.reamRate ?? p.activeRate?.reamRate ?? 0);
                      const colour = p.colour || "White";

                      return (
                        <tr key={p._id || p.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* 1. Sheet Size */}
                          <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 font-mono text-[13px]">
                            {sizeLabel}
                            <span className="text-[10px] font-sans text-slate-400 block font-normal">
                              {width === 18 && height === 22 ? "Standard Mini Offset" : "Commercial Size"}
                            </span>
                          </td>

                          {/* 2. Paper Type */}
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-[11px]">
                              {paperType}
                            </span>
                          </td>

                          {/* 3. GSM */}
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            {p.gsm} GSM
                          </td>

                          {/* 4. Loose Price */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[13px]">
                            ₹{looseRate.toFixed(2)}
                            <span className="text-[10px] text-slate-400 block font-normal font-sans">
                              per sheet
                            </span>
                          </td>

                          {/* 5. Rim Price */}
                          <td className="py-3.5 px-4 font-mono font-bold text-orange-600 text-[13px]">
                            ₹{reamRate.toFixed(2)}
                            <span className="text-[10px] text-slate-400 block font-normal font-sans">
                              ₹{(reamRate / 500).toFixed(3)} / sheet
                            </span>
                          </td>

                          {/* 6. Color Sheet */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                colour.toLowerCase() === "white"
                                  ? "bg-slate-50 text-slate-800 border-slate-300"
                                  : colour.toLowerCase() === "yellow"
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : colour.toLowerCase() === "pink"
                                  ? "bg-pink-100 text-pink-900 border-pink-300"
                                  : colour.toLowerCase() === "blue"
                                  ? "bg-blue-100 text-blue-900 border-blue-300"
                                  : colour.toLowerCase() === "green"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                  : "bg-purple-100 text-purple-900 border-purple-300"
                              }`}
                            >
                              {colour}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditSheetModal(p)}
                                className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                title="Edit sheet dimensions, GSM, colour or pricing"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteSheet(p)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete sheet"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MINI OFFSET PRINTING RATES */}
        {/* ============================================================== */}
        {activeTab === "offset" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {printingRates
              .filter((r) => r.method === "mini_offset")
              .map((r) => (
                <div
                  key={r.rateKey}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        Mini Offset
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{r.name}</h3>
                    </div>
                    <button
                      onClick={() => {
                        setEditingPrintRate(r);
                        setPrintRateForm({ rate: r.rate, notes: "" });
                      }}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Current Vendor Rate
                      </span>
                      <span className="text-2xl font-black text-slate-900 font-mono">
                        ₹{r.rate}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {r.rateKey === "offset_master_legal"
                          ? "Per Unique Master Plate"
                          : "Per 1,000 Impressions Slab"}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-slate-500">
                      <span className="font-semibold block text-slate-700">Effective Date:</span>
                      {r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : "System Default"}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: DIGITAL PRINTING RATES */}
        {/* ============================================================== */}
        {activeTab === "digital" && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <FiInfo className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Important Specification:</strong> Digital printing is strictly valid on <strong>White paper only</strong> (prohibited on Yellow/Pink). Rates are per sheet impression.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {printingRates
                .filter((r) => r.method === "digital")
                .map((r) => (
                  <div
                    key={r.rateKey}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Digital Press
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{r.name}</h3>
                      </div>
                      <button
                        onClick={() => {
                          setEditingPrintRate(r);
                          setPrintRateForm({ rate: r.rate, notes: "" });
                        }}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Current Rate
                        </span>
                        <span className="text-2xl font-black text-slate-900 font-mono">
                          ₹{r.rate}
                        </span>
                        <span className="text-[11px] text-slate-500 block">per printed sheet</span>
                      </div>

                      <div className="text-right text-[11px] text-slate-500">
                        <span className="font-semibold block text-slate-700">Effective Date:</span>
                        {r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : "System Default"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: BINDING RATES */}
        {/* ============================================================== */}
        {activeTab === "binding" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Binding Style</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Vendor Rate / Book</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bindingRates.map((b) => (
                    <tr key={b.bindingCode} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                        {b.name}
                        {b.bindingCode === "normal" && (
                          <span className="ml-2 text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                            Bill Book Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{b.bindingCode}</td>
                      <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs truncate">
                        {b.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        ₹{b.ratePerBook}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => {
                            setEditingBindingRate(b);
                            setBindingRateForm({ ratePerBook: b.ratePerBook, notes: "" });
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-lg transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <FiEdit className="w-3.5 h-3.5" /> Edit Rate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: FINISHING RATES (NUMBERING & PUNCHING) */}
        {/* ============================================================== */}
        {activeTab === "finishing" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {finishingRates.map((f) => (
              <div
                key={f.serviceKey}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                      Post-Press Finishing
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{f.serviceName}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setEditingFinishingRate(f);
                      setFinishingRateForm({ ratePerBook: f.ratePerBook, notes: "" });
                    }}
                    className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{f.description}</p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Vendor Rate
                    </span>
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{f.ratePerBook}
                    </span>
                    <span className="text-[11px] text-slate-500 block">per completed book</span>
                  </div>

                  <div className="text-right text-[11px] text-slate-500">
                    <span className="font-semibold block text-slate-700">Billing Basis:</span>
                    Book Level (₹2.00 flat)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ADD NEW SHEET */}
      {/* ============================================================== */}
      {isAddSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-600 rounded-xl">
                  <FiPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add New Sheet</h3>
                  <p className="text-[11px] text-slate-400">Stores sheet in database collection for pricing engine</p>
                </div>
              </div>
              <button onClick={() => setIsAddSheetOpen(false)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSheetSubmit} className="p-6 space-y-4">
              {/* Row 1: Sheet Size (Width * Height) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Sheet Size (Inches) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Width (e.g. 18)</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="18"
                      value={newSheetForm.rawWidthInch}
                      onChange={(e) => setNewSheetForm({ ...newSheetForm, rawWidthInch: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Height (e.g. 22)</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      placeholder="22"
                      value={newSheetForm.rawHeightInch}
                      onChange={(e) => setNewSheetForm({ ...newSheetForm, rawHeightInch: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Paper Type & GSM */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. Paper Type / Quality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Newspaper, Maplitho, Bond"
                    value={newSheetForm.paperType}
                    onChange={(e) => setNewSheetForm({ ...newSheetForm, paperType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. GSM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45, 52, 58, 64, 70"
                    value={newSheetForm.gsm}
                    onChange={(e) => setNewSheetForm({ ...newSheetForm, gsm: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Loose Price & Rim Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Loose Price (₹ per sheet) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1.20"
                    value={newSheetForm.looseSheetRate}
                    onChange={(e) => setNewSheetForm({ ...newSheetForm, looseSheetRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5. Rim Price (₹ per 500s) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 520"
                    value={newSheetForm.reamRate}
                    onChange={(e) => setNewSheetForm({ ...newSheetForm, reamRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Color Sheet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6. Color Sheet <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["White", "Yellow", "Pink", "Green"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSheetForm({ ...newSheetForm, colour: c })}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        newSheetForm.colour.toLowerCase() === c.toLowerCase()
                          ? "bg-orange-50 border-orange-600 text-orange-700 ring-2 ring-orange-500/20"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or custom color (e.g. Buff, Ivory, Blue)"
                  value={newSheetForm.colour}
                  onChange={(e) => setNewSheetForm({ ...newSheetForm, colour: e.target.value })}
                  className="w-full mt-2 px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSheetOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingSheet}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isAddingSheet ? "Saving to Database..." : "Save & Add Sheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT SHEET */}
      {/* ============================================================== */}
      {editingSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-600 rounded-xl">
                  <FiEdit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Edit Sheet: {editSheetForm.rawWidthInch} * {editSheetForm.rawHeightInch} ({editSheetForm.colour})
                  </h3>
                  <p className="text-[11px] text-slate-400">Modify sheet dimensions, quality, GSM, or prices</p>
                </div>
              </div>
              <button onClick={() => setEditingSheet(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSheetSubmit} className="p-6 space-y-4">
              {/* Row 1: Dimensions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Sheet Size (Inches) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Width</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editSheetForm.rawWidthInch}
                      onChange={(e) => setEditSheetForm({ ...editSheetForm, rawWidthInch: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 mb-1 block">Height</span>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={editSheetForm.rawHeightInch}
                      onChange={(e) => setEditSheetForm({ ...editSheetForm, rawHeightInch: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Paper Type & GSM */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    2. Paper Type / Quality <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editSheetForm.paperType}
                    onChange={(e) => setEditSheetForm({ ...editSheetForm, paperType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    3. GSM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={editSheetForm.gsm}
                    onChange={(e) => setEditSheetForm({ ...editSheetForm, gsm: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Loose & Rim Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4. Loose Price (₹ per sheet) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editSheetForm.looseSheetRate}
                    onChange={(e) => setEditSheetForm({ ...editSheetForm, looseSheetRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    5. Rim Price (₹ per 500s) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editSheetForm.reamRate}
                    onChange={(e) => setEditSheetForm({ ...editSheetForm, reamRate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Color Sheet */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6. Color Sheet <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["White", "Yellow", "Pink", "Green"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditSheetForm({ ...editSheetForm, colour: c })}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        editSheetForm.colour.toLowerCase() === c.toLowerCase()
                          ? "bg-orange-50 border-orange-600 text-orange-700 ring-2 ring-orange-500/20"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={editSheetForm.colour}
                  onChange={(e) => setEditSheetForm({ ...editSheetForm, colour: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSheet(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSheet}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isUpdatingSheet ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: EDIT PRINTING RATE */}
      {/* ============================================================== */}
      {editingPrintRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Update Printing Rate</h3>
                <p className="text-[11px] text-slate-400">{editingPrintRate.name}</p>
              </div>
              <button onClick={() => setEditingPrintRate(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePrintRateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rate (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={printRateForm.rate}
                  onChange={(e) => setPrintRateForm({ ...printRateForm, rate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Master plate vendor revision"
                  value={printRateForm.notes}
                  onChange={(e) => setPrintRateForm({ ...printRateForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPrintRate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPrintRate}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSavingPrintRate ? "Saving..." : "Save Rate Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: EDIT BINDING RATE */}
      {/* ============================================================== */}
      {editingBindingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Update Binding Rate</h3>
                <p className="text-[11px] text-slate-400">{editingBindingRate.name}</p>
              </div>
              <button onClick={() => setEditingBindingRate(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBindingRateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rate Per Book (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bindingRateForm.ratePerBook}
                  onChange={(e) => setBindingRateForm({ ...bindingRateForm, ratePerBook: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Binding labour cost adjustment"
                  value={bindingRateForm.notes}
                  onChange={(e) => setBindingRateForm({ ...bindingRateForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingBindingRate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBindingRate}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSavingBindingRate ? "Saving..." : "Save Rate Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: EDIT FINISHING RATE */}
      {/* ============================================================== */}
      {editingFinishingRate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Update Finishing Rate</h3>
                <p className="text-[11px] text-slate-400">{editingFinishingRate.serviceName}</p>
              </div>
              <button onClick={() => setEditingFinishingRate(null)} className="text-slate-400 hover:text-white p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinishingRateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rate Per Book (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={finishingRateForm.ratePerBook}
                  onChange={(e) => setFinishingRateForm({ ...finishingRateForm, ratePerBook: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Serial numbering machine charges"
                  value={finishingRateForm.notes}
                  onChange={(e) => setFinishingRateForm({ ...finishingRateForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingFinishingRate(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFinishingRate}
                  className="px-5 py-2.5 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSavingFinishingRate ? "Saving..." : "Save Rate Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
