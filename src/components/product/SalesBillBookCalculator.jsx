import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiBookOpen,
  FiLayers,
  FiTag,
  FiCheck,
  FiDownload,
  FiCopy,
  FiPhone,
  FiUser,
  FiBriefcase,
  FiShield,
  FiRefreshCw,
  FiPercent,
  FiPrinter,
  FiSliders,
  FiCheckCircle,
  FiInfo,
  FiChevronDown,
  FiTruck,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import { useAuth } from "@/context/AuthContext";
import {
  fetchPaperMastersApi,
  fetchPrintingRatesApi,
  fetchBindingRatesApi,
  fetchFinishingRatesApi,
} from "@/services/api";
import {
  SALES_BOOK_SIZE_RULES,
  SALES_BINDING_OPTIONS,
  getPapersForSizeRule,
  getAvailablePaperTypes,
  getAvailableGsms,
  getAvailableColours,
  selectLeastWastageSheetFromDb,
  calculateSalesBillBookQuote,
} from "@/utils/salesBillBookEngine";
import { generateGeneralProductQuotationPdf } from "@/lib/generateQuotationPdf";

export default function SalesBillBookCalculator() {
  const { addToQuote } = useQuote();
  const { isManagerOrAdmin } = useAuth();

  // ---------------------------------------------------------------------------
  // 1. MASTER DATA STATE (Fetched from Admin Master Collections)
  // ---------------------------------------------------------------------------
  const [papers, setPapers] = useState([]);
  const [printingRates, setPrintingRates] = useState([]);
  const [bindingRates, setBindingRates] = useState([]);
  const [finishingRates, setFinishingRates] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);

  // Load live admin rates
  const loadAdminMasters = useCallback(async () => {
    try {
      setLoadingMasters(true);
      const [papersRes, printRes, bindRes, finishRes] =
        await Promise.allSettled([
          fetchPaperMastersApi(),
          fetchPrintingRatesApi(),
          fetchBindingRatesApi(),
          fetchFinishingRatesApi(),
        ]);

      if (papersRes.status === "fulfilled" && Array.isArray(papersRes.value)) {
        setPapers(papersRes.value);
        setDbConnected(true);
      }
      if (printRes.status === "fulfilled" && Array.isArray(printRes.value)) {
        setPrintingRates(printRes.value);
      }
      if (bindRes.status === "fulfilled" && Array.isArray(bindRes.value)) {
        setBindingRates(bindRes.value);
      }
      if (finishRes.status === "fulfilled" && Array.isArray(finishRes.value)) {
        setFinishingRates(finishRes.value);
      }
    } catch (err) {
      console.warn(
        "Could not fetch some master rates, using calibrated defaults:",
        err,
      );
    } finally {
      setLoadingMasters(false);
    }
  }, []);

  useEffect(() => {
    loadAdminMasters();
  }, [loadAdminMasters]);

  // ---------------------------------------------------------------------------
  // 2. SALESPERSON ORDER REQUIREMENTS STATE
  // ---------------------------------------------------------------------------
  // Size selection (Defaults to A4)
  const [selectedSizeId, setSelectedSizeId] = useState("a4");

  // Quantity of Books
  const [quantity, setQuantity] = useState(10);
  const [customQuantity, setCustomQuantity] = useState("");

  // Sets / Pages per book
  const [setsPerBook, setSetsPerBook] = useState(100);
  const [customSets, setCustomSets] = useState("");

  // Copy / Ply count: 1 to 4 plies
  const [plyCount, setPlyCount] = useState(2); // Default Duplicate (2-ply)

  // Configuration for each ply
  const [pliesConfig, setPliesConfig] = useState([
    {
      paperType: "Maplitho",
      gsm: 70,
      colour: "White",
      inkColour: "Black",
      inkColours: ["Black"],
      printRequired: true,
    },
    {
      paperType: "Maplitho",
      gsm: 70,
      colour: "Yellow",
      inkColour: "Black",
      inkColours: ["Black"],
      printRequired: true,
    },
    {
      paperType: "Maplitho",
      gsm: 70,
      colour: "Pink",
      inkColour: "Black",
      inkColours: ["Black"],
      printRequired: true,
    },
    {
      paperType: "Maplitho",
      gsm: 70,
      colour: "Blue",
      inkColour: "Black",
      inkColours: ["Black"],
      printRequired: true,
    },
  ]);

  // Printing & Inking
  const [printProcess, setPrintProcess] = useState("single_color_offset");
  const [inkColour, setInkColour] = useState("Black");

  // Binding
  const [bindingType, setBindingType] = useState("normal");

  // Serial Numbering & Punching
  const [numbering, setNumbering] = useState(false);
  const [startNumber, setStartNumber] = useState("0001");
  const [punching, setPunching] = useState(false);

  // Sales Margin & GST (50% Margin by default)
  const [salesMarginPercent, setSalesMarginPercent] = useState(50);
  const [includeGst, setIncludeGst] = useState(false);

  // Customer Contact for Quotation
  const [clientInfo, setClientInfo] = useState({
    name: "",
    phone: "",
    company: "",
  });

  // UI Feedback
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);

  // ---------------------------------------------------------------------------
  // 3. DYNAMIC OPTIONS RESOLUTION FOR SELECTED SIZE RULE
  // ---------------------------------------------------------------------------
  const currentSizeRule = useMemo(() => {
    return (
      SALES_BOOK_SIZE_RULES.find((r) => r.id === selectedSizeId) ||
      SALES_BOOK_SIZE_RULES[0]
    );
  }, [selectedSizeId]);

  // Auto-select the least-wastage raw sheet from backend PaperMaster using finished width & height
  const optimalSheet = useMemo(() => {
    return selectLeastWastageSheetFromDb(
      papers,
      currentSizeRule.widthInch,
      currentSizeRule.heightInch,
      currentSizeRule,
    );
  }, [papers, currentSizeRule]);

  // Papers matching the auto-selected least-wastage raw sheet (e.g. 18x22 or 23x36)
  const sizePapers = useMemo(() => {
    return getPapersForSizeRule(papers, {
      ...currentSizeRule,
      rawSheetWidth: optimalSheet.rawWidthInch,
      rawSheetHeight: optimalSheet.rawHeightInch,
    });
  }, [papers, currentSizeRule, optimalSheet]);

  // Dynamic dropdown options for plies
  const availablePaperTypes = useMemo(() => {
    return getAvailablePaperTypes(sizePapers);
  }, [sizePapers]);

  // Auto-sync ply configs to valid backend PaperMaster entries when DB papers load or size changes
  useEffect(() => {
    if (
      !Array.isArray(papers) ||
      papers.length === 0 ||
      sizePapers.length === 0
    )
      return;
    setPliesConfig((prev) =>
      prev.map((ply) => {
        const validType = availablePaperTypes.includes(ply.paperType)
          ? ply.paperType
          : availablePaperTypes[0] || ply.paperType;
        const validGsms = getAvailableGsms(sizePapers, validType);
        const validGsm = validGsms.includes(Number(ply.gsm))
          ? Number(ply.gsm)
          : validGsms[0] || ply.gsm;
        const validColours = getAvailableColours(
          sizePapers,
          validType,
          validGsm,
        );
        const validColour = validColours.includes(ply.colour)
          ? ply.colour
          : validColours[0] || ply.colour;
        if (
          validType === ply.paperType &&
          validGsm === Number(ply.gsm) &&
          validColour === ply.colour
        ) {
          return ply;
        }
        return {
          ...ply,
          paperType: validType,
          gsm: validGsm,
          colour: validColour,
        };
      }),
    );
  }, [papers, sizePapers, availablePaperTypes]);

  // Toggle an ink colour (1 to 4 colours) independently on any layer
  const handleTogglePlyInk = (index, colour) => {
    setPliesConfig((prev) => {
      const updated = [...prev];
      const ply = updated[index];
      const current =
        Array.isArray(ply?.inkColours) && ply.inkColours.length > 0
          ? ply.inkColours
          : [ply?.inkColour || "Black"];
      let nextInks;
      if (current.includes(colour)) {
        if (current.length === 1) return prev;
        nextInks = current.filter((c) => c !== colour);
      } else {
        nextInks = [...current, colour];
      }
      updated[index] = {
        ...ply,
        inkColours: nextInks,
        inkColour: nextInks.join(" + "),
      };
      return updated;
    });
  };

  // Handle ply field update & auto-sync valid GSM / Colour from backend PaperMaster
  const handlePlyChange = (index, field, value) => {
    setPliesConfig((prev) => {
      const updated = [...prev];
      const nextPly = { ...updated[index], [field]: value };

      if (field === "paperType") {
        const validGsms = getAvailableGsms(sizePapers, value);
        if (validGsms.length > 0 && !validGsms.includes(Number(nextPly.gsm))) {
          nextPly.gsm = validGsms[0];
        }
        const validColours = getAvailableColours(
          sizePapers,
          value,
          nextPly.gsm,
        );
        if (validColours.length > 0 && !validColours.includes(nextPly.colour)) {
          nextPly.colour = validColours[0];
        }
      } else if (field === "gsm") {
        const validColours = getAvailableColours(
          sizePapers,
          nextPly.paperType,
          Number(value),
        );
        if (validColours.length > 0 && !validColours.includes(nextPly.colour)) {
          nextPly.colour = validColours[0];
        }
      }

      updated[index] = nextPly;
      return updated;
    });
  };

  // ---------------------------------------------------------------------------
  // 4. PRICE QUOTATION CALCULATION
  // ---------------------------------------------------------------------------
  const activePlies = useMemo(() => {
    return pliesConfig.slice(0, plyCount);
  }, [pliesConfig, plyCount]);

  const activeQuantity = customQuantity
    ? Number(customQuantity) || 1
    : quantity;
  const activeSets = customSets ? Number(customSets) || 100 : setsPerBook;

  const quote = useMemo(() => {
    return calculateSalesBillBookQuote(
      {
        sizeId: selectedSizeId,
        quantity: activeQuantity,
        setsPerBook: activeSets,
        plies: activePlies,
        printProcess,
        inkColour,
        numbering,
        punching,
        bindingType,
        includeGst,
        salesMarginPercent: Number(salesMarginPercent ?? 0),
      },
      {
        papers,
        printingRates,
        bindingRates,
        finishingRates,
      },
    );
  }, [
    selectedSizeId,
    activeQuantity,
    activeSets,
    activePlies,
    printProcess,
    inkColour,
    numbering,
    punching,
    bindingType,
    includeGst,
    salesMarginPercent,
    papers,
    printingRates,
    bindingRates,
    finishingRates,
  ]);

  // ---------------------------------------------------------------------------
  // 5. ACTIONS: WHATSAPP QUOTE, ADD TO CART, PDF QUOTATION
  // ---------------------------------------------------------------------------

  const handleCopyWhatsApp = () => {
    const plySummary = quote.plyBreakdown
      .map((p) => `${p.layerName}: ${p.colour} ${p.paperType} ${p.gsm} GSM`)
      .join("\n• ");

    const text = `*A2V PRINTS - BILL BOOK QUOTATION*
📄 *Book Size:* ${quote.finishedSizeName} (${quote.finishedDimensions})
📦 *Quantity:* ${quote.numBooks} Books (${quote.numSets} Sets / Book)
📑 *Copy Type:* ${quote.numPlies}-Ply
• ${plySummary}
🎨 *Print:* ${printProcess === "two_color_offset" ? "2-Color Offset" : "Single Color Offset"} (${inkColour} Ink)
📚 *Binding:* ${quote.bindingName}
🔢 *Numbering:* ${numbering ? `Yes (Starting ${startNumber})` : "No"}
----------------------------------------
💰 *Price Per Book:* ₹${quote.pricePerBook.toFixed(2)}
💵 *Total Amount:* ₹${includeGst ? quote.grandTotalWithGst.toLocaleString("en-IN") : quote.finalOrderPrice.toLocaleString("en-IN")} ${includeGst ? "(Incl. 18% GST)" : "(Excl. GST)"}
🚚 *Turnaround:* ${quote.turnaroundDays}
----------------------------------------
_A2V Commercial Printing & Design Hub_`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handleAddToCart = () => {
    const product = {
      id: `sales-bill-book-${selectedSizeId}`,
      code: `BB-${selectedSizeId.toUpperCase()}-${activeQuantity}`,
      name: `Bill Book (${quote.finishedSizeName} - ${quote.numPlies}-Ply)`,
      slug: "sales-bill-book",
      unitName: "Books",
      image: "/src/assets/images/categories (8).webp",
    };

    const selectedOptions = {
      Size: `${quote.finishedSizeName} (${quote.finishedDimensions})`,
      "Copies (Ply)": `${quote.numPlies}-Ply (${quote.numSets} Sets/Book)`,
      Paper: quote.plyBreakdown
        .map((p) => `${p.layerName}: ${p.paperType} ${p.gsm} GSM (${p.colour})`)
        .join(" | "),
      Printing: `${printProcess === "two_color_offset" ? "2-Color" : "Single Color"} (${inkColour})`,
      Binding: quote.bindingName,
      Numbering: numbering ? `Yes (${startNumber}+)` : "No",
    };

    const calculation = {
      pricePerUnit: quote.pricePerBook,
      totalAmount: includeGst ? quote.grandTotalWithGst : quote.finalOrderPrice,
      isGstIncluded: includeGst,
    };

    addToQuote(product, selectedOptions, activeQuantity, calculation);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2500);
  };

  const handleDownloadPdf = () => {
    const specDetails = {
      "Finished Size": `${quote.finishedSizeName} (${quote.finishedDimensions})`,
      "Quantity Ordered": `${quote.numBooks} Books`,
      "Sets per Book": `${quote.numSets} Sets (${quote.numSets * quote.numPlies} Leaves per Book)`,
      "Copies / Ply Count": `${quote.numPlies}-Ply`,
      "Paper Specifications": quote.plyBreakdown
        .map((p) => `${p.layerName}: ${p.paperType} ${p.gsm} GSM ${p.colour}`)
        .join("; "),
      "Printing Ink": `${printProcess === "two_color_offset" ? "2-Color Offset" : "Single Color Offset"} (${inkColour} Ink)`,
      "Book Binding": quote.bindingName,
      "Serial Numbering": numbering
        ? `Consecutive (${startNumber} onwards)`
        : "Not Included",
      "Production Turnaround": quote.turnaroundDays,
    };

    const pdfData = {
      productName: `Bill Book Printing (${quote.finishedSizeName} - ${quote.numPlies} Ply)`,
      productCode: `A2V-BB-${selectedSizeId.toUpperCase()}`,
      selectedVariant: `${quote.finishedSizeName} | ${quote.numSets} Sets | ${quote.numPlies}-Ply`,
      selectedOptions: specDetails,
      quantity: quote.numBooks,
      unitName: "Books",
      applicableCost: quote.pricePerBook,
      totalAmount: includeGst ? quote.grandTotalWithGst : quote.finalOrderPrice,
      clientInfo: {
        clientName: clientInfo.name || "Valued Customer",
        phone: clientInfo.phone || "",
        companyName: clientInfo.company || "",
      },
      specifications: specDetails,
    };

    const pdfUrl = generateGeneralProductQuotationPdf(pdfData);
    if (pdfUrl) {
      const a = document.createElement("a");
      a.href = pdfUrl;
      a.download = `A2V_BillBook_Quote_${selectedSizeId.toUpperCase()}_${quote.numBooks}Books.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold tracking-wide uppercase">
              <FiBookOpen className="w-3.5 h-3.5" />
              Sales Counter Estimator
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bill Book &amp; Cash Memo Calculator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Fast, accurate customer quotations for Invoices, Receipts,
              Challans, and Pads. Raw paper sizes and sheet cutting are
              automated behind the scenes using live Admin Masters.
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Select Finished Book Size (Dropdown Way) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Select Finished Book Size
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                13 Standard Sizes
              </span>
            </div>

            {/* Main Dropdown Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Choose Size from Dropdown:</span>
                <span className="text-orange-600 font-semibold">
                  Selected: {currentSizeRule.name} ({currentSizeRule.dimensions}
                  )
                </span>
              </label>

              <div className="relative">
                <select
                  value={selectedSizeId}
                  onChange={(e) => setSelectedSizeId(e.target.value)}
                  className="w-full text-sm font-bold pl-4 pr-10 py-3 bg-white border-2 border-orange-500/40 hover:border-orange-500 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all shadow-xs appearance-none cursor-pointer"
                >
                  <optgroup label="⭐ Popular & Most Ordered">
                    {SALES_BOOK_SIZE_RULES.filter((r) => r.popular).map(
                      (rule) => (
                        <option key={`pop-${rule.id}`} value={rule.id}>
                          {rule.name} — {rule.dimensions} ({rule.tag})
                        </option>
                      ),
                    )}
                  </optgroup>

                  <optgroup label="📄 ISO Standard A-Series">
                    {SALES_BOOK_SIZE_RULES.filter(
                      (r) => r.group === "ISO A-Series",
                    ).map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name} — {rule.dimensions} ({rule.tag})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="🏢 Office & US Letter Sizes">
                    {SALES_BOOK_SIZE_RULES.filter(
                      (r) => r.group === "Office & Letter",
                    ).map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name} — {rule.dimensions} ({rule.tag})
                      </option>
                    ))}
                  </optgroup>

                  <optgroup label="📐 Fractional Demy Press Cuts">
                    {SALES_BOOK_SIZE_RULES.filter(
                      (r) => r.group === "Fractional Demy",
                    ).map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.name} — {rule.dimensions} ({rule.tag})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-orange-600">
                  <FiChevronDown className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Quantity & Structure (Books & Sets) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Quantity, Sets &amp; Copies (Plies)
              </h3>
            </div>

            {/* Book Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Number of Books</span>
                <span className="text-slate-500 font-normal">
                  Selected:{" "}
                  <strong className="text-slate-900">
                    {activeQuantity} Books
                  </strong>
                </span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[5, 10, 20, 50, 100, 200].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => {
                      setQuantity(qty);
                      setCustomQuantity("");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      !customQuantity && quantity === qty
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {qty} Books
                  </button>
                ))}
              </div>
              <div className="pt-1">
                <input
                  type="number"
                  placeholder="Or enter custom books count (e.g. 15, 30)..."
                  value={customQuantity}
                  onChange={(e) => setCustomQuantity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  min="1"
                />
              </div>
            </div>

            {/* Sets per Book */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Sets / Pages per Book</span>
                <span className="text-slate-500 font-normal">
                  Selected:{" "}
                  <strong className="text-slate-900">{activeSets} Sets</strong>
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[50, 100].map((sets) => (
                  <button
                    key={sets}
                    type="button"
                    onClick={() => {
                      setSetsPerBook(sets);
                      setCustomSets("");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      !customSets && setsPerBook === sets
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {sets} Sets / Book
                  </button>
                ))}
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Custom sets (e.g. 75, 120)..."
                    value={customSets}
                    onChange={(e) => setCustomSets(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Plies / Copies Count */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700">
                Number of Copies / Plies per Set:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { count: 1, label: "1-Ply", sub: "Single Copy" },
                  { count: 2, label: "2-Ply", sub: "Duplicate" },
                  { count: 3, label: "3-Ply", sub: "Triplicate" },
                  { count: 4, label: "4-Ply", sub: "Quadruplicate" },
                ].map((ply) => (
                  <button
                    key={ply.count}
                    type="button"
                    onClick={() => setPlyCount(ply.count)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      plyCount === ply.count
                        ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20 text-orange-900"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="text-xs font-black">{ply.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {ply.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 3: Paper Selection per Layer (Live Admin Master Rates) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Paper Quality &amp; Colour per Layer
                </h3>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                Admin Paper Masters
              </span>
            </div>

            <div className="space-y-4">
              {activePlies.map((ply, idx) => {
                const layerTitle =
                  idx === 0
                    ? "Layer 1 - Original (Top Copy)"
                    : idx === 1
                      ? "Layer 2 - Duplicate Copy"
                      : idx === 2
                        ? "Layer 3 - Triplicate Copy"
                        : "Layer 4 - Quadruplicate Copy";

                const layerAvailableGsms = getAvailableGsms(
                  sizePapers,
                  ply.paperType,
                );
                const layerAvailableColours = getAvailableColours(
                  sizePapers,
                  ply.paperType,
                  ply.gsm,
                );

                // Find matching breakdown info
                const breakdownItem = quote.plyBreakdown[idx] || {};

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full border ${
                            ply.colour === "Yellow"
                              ? "bg-amber-300 border-amber-400"
                              : ply.colour === "Pink"
                                ? "bg-pink-300 border-pink-400"
                                : ply.colour === "Blue"
                                  ? "bg-sky-300 border-sky-400"
                                  : "bg-white border-slate-300"
                          }`}
                        />
                        <span className="font-bold text-xs text-slate-800">
                          {layerTitle}
                        </span>
                      </div>

                      {/* Live Rate Pill */}
                      {breakdownItem.looseSheetRate && (
                        <span className="text-[10px] text-slate-600 font-medium">
                          ₹{breakdownItem.looseSheetRate}/sheet • ₹
                          {breakdownItem.reamRate}/ream
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {/* Paper Type */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Paper Type
                        </label>
                        <select
                          value={ply.paperType}
                          onChange={(e) =>
                            handlePlyChange(idx, "paperType", e.target.value)
                          }
                          className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                          {availablePaperTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* GSM */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          GSM Weight
                        </label>
                        <select
                          value={ply.gsm}
                          onChange={(e) =>
                            handlePlyChange(idx, "gsm", Number(e.target.value))
                          }
                          className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                          {layerAvailableGsms.map((g) => (
                            <option key={g} value={g}>
                              {g} GSM
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Colour */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Sheet Colour
                        </label>
                        <select
                          value={ply.colour}
                          onChange={(e) =>
                            handlePlyChange(idx, "colour", e.target.value)
                          }
                          className="w-full text-xs font-semibold px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        >
                          {layerAvailableColours.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ink Colour (Independent 1–4 colours per layer; unique colours across layers = Masters) */}
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                          Ink Colour (1–4 Colours)
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {["Black", "Red", "Blue", "Green"].map((col) => {
                            const selectedInks =
                              Array.isArray(ply.inkColours) && ply.inkColours.length > 0
                                ? ply.inkColours
                                : [ply.inkColour || "Black"];
                            const isSel = selectedInks.includes(col);
                            return (
                              <button
                                key={col}
                                type="button"
                                disabled={ply.printRequired === false}
                                onClick={() => handleTogglePlyInk(idx, col)}
                                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                  ply.printRequired === false
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : isSel
                                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                      : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>
                        {ply.printRequired === false && (
                          <span className="text-[9px] block mt-1 font-semibold text-slate-500 leading-tight">
                            No Print (Blank)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={ply.printRequired !== false}
                          onChange={(e) =>
                            handlePlyChange(
                              idx,
                              "printRequired",
                              e.target.checked,
                            )
                          }
                          className="w-3.5 h-3.5 text-orange-600 rounded"
                        />
                        <span>Print Required on this Layer</span>
                      </label>
                      {ply.printRequired === false && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                          No Print (Blank Sheet)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: Binding & Numbering */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                4
              </span>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Book Binding &amp; Numbering
              </h3>
            </div>

            {/* Binding Style */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                Book Binding Style:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SALES_BINDING_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBindingType(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      bindingType === opt.id
                        ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20 text-orange-900 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900">
                        {opt.name}
                      </div>
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                        ₹{opt.ratePerBook}/book
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                      {opt.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Serial Numbering Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Consecutive Serial Numbering
                </div>
                <div className="text-[11px] text-slate-500">
                  Red ink machine numbering on each bill leaf (+₹2/book)
                </div>
              </div>
              <div className="flex items-center gap-3">
                {numbering && (
                  <input
                    type="text"
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    placeholder="Start (0001)"
                    className="w-24 text-xs px-2 py-1.5 border border-slate-200 rounded-lg text-center font-mono font-bold"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setNumbering(!numbering)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                    numbering
                      ? "bg-orange-600 justify-end"
                      : "bg-slate-300 justify-start"
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md" />
                </button>
              </div>
            </div>

            {/* Punching / Perforation Toggle */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">
                  Punching / Perforation
                </div>
                <div className="text-[11px] text-slate-500">
                  Tear-off line perforation along the margin across all plies
                  (+₹2/book)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPunching(!punching)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                  punching
                    ? "bg-orange-600 justify-end"
                    : "bg-slate-300 justify-start"
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Quotation Card & Actions (5 Cols - Sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xl space-y-6">
            {/* Header: Quotation Summary */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                  Live Customer Quote
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-0.5">
                  Quotation Estimate
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                {quote.totalBooks} Books
              </span>
            </div>

            {/* Big Price Display */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                    Price Per Book
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white mt-1">
                    ₹{quote.pricePerBook.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-orange-300 font-bold">
                    Total Order Value
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-orange-400 mt-1">
                    ₹
                    {includeGst
                      ? quote.grandTotalWithGst.toLocaleString("en-IN")
                      : quote.finalOrderPrice.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>
                  {quote.finishedSizeName} • {quote.numPlies}-Ply
                </span>
                <span>{quote.turnaroundDays}</span>
              </div>
            </div>

            {/* Specification Summary Chips */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-700">
                Specification Details:
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  Size: {quote.finishedSizeName} ({quote.finishedDimensions})
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
                  Auto Sheet: {quote.rawSheetDimensions} ({quote.yieldPerSheet}
                  -Out • {quote.wastePercent}% waste)
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  {quote.numSets} Sets / Book
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  {quote.bindingName}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  {printProcess === "two_color_offset"
                    ? "2-Color Offset"
                    : "Single Color"}{" "}
                  ({inkColour})
                </span>
                {numbering && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium">
                    Serial Numbering ({startNumber}+)
                  </span>
                )}
              </div>
            </div>

            {/* Transparent Customer Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Finished Pages</span>
                <strong className="text-slate-900">
                  {quote.totalFinishedPages.toLocaleString()} Leaves
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paper &amp; Materials</span>
                <strong className="text-slate-900">
                  {quote.plyBreakdown
                    .map((p) => `${p.colour} ${p.paperType}`)
                    .join(", ")}
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Printing Technology</span>
                <strong className="text-slate-900">
                  Mini Offset High Speed
                </strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Binding &amp; Finishing</span>
                <strong className="text-slate-900">{quote.bindingName}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeGst}
                    onChange={(e) => setIncludeGst(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span>Include 18% GST in Total</span>
                </label>
                {includeGst && (
                  <span className="font-bold text-orange-600">
                    +₹{quote.gstAmount.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Optional Customer Contact for PDF */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700">
                Client Details (For PDF Quotation):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Client / Company Name"
                  value={clientInfo.name}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, name: e.target.value })
                  }
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={clientInfo.phone}
                  onChange={(e) =>
                    setClientInfo({ ...clientInfo, phone: e.target.value })
                  }
                  className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {/* WhatsApp Quote Button */}
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                {copiedSuccess ? (
                  <>
                    <FiCheck className="w-4 h-4" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <FiCopy className="w-4 h-4" /> Copy WhatsApp Quotation
                  </>
                )}
              </button>

              {/* Download PDF Quotation */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                <FiDownload className="w-4 h-4" /> Download Official Quotation
                PDF
              </button>

              {/* Add to Quote Cart */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-2.5 px-4 rounded-xl border border-orange-600 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                {cartSuccess ? (
                  <>
                    <FiCheck className="w-4 h-4" /> Added to Quote Cart!
                  </>
                ) : (
                  <>
                    <FiLayers className="w-4 h-4" /> Add to Quote Cart
                  </>
                )}
              </button>
            </div>

            {/* MANAGER / ADMIN PRODUCTION AUDIT (CONFIDENTIAL FIREWALL) */}
            {isManagerOrAdmin && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <FiShield className="w-4 h-4 text-amber-600" />
                    Manager Production Audit (Confidential)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    {salesMarginPercent}% Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">
                      Total Paper Cost:
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{Math.round(quote.totalPaperCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Master Plates ({quote.numMasters} × ₹{quote.masterRate}):
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{Math.round(quote.masterCost)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {quote.numMasters <= 1
                        ? `Same ink colour across plies (1 Master ₹${quote.masterRate})`
                        : `${quote.numMasters} unique ink masters`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Offset Runs ({quote.totalRuns} runs × {quote.slabCount}{" "}
                      slab × ₹{quote.runRatePer1000}):
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{Math.round(quote.runCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Binding &amp; Finishing:
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹
                      {Math.round(
                        quote.bindingCost +
                          quote.numberingCost +
                          (quote.punchingCost || 0) +
                          quote.coverGattaCost,
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block flex items-center gap-1">
                      <FiTruck className="w-3 h-3 text-slate-400" />{" "}
                      Transportation:
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{Math.round(quote.transportationCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Total Vendor Cost:
                    </span>
                    <span className="font-extrabold text-slate-900">
                      ₹{Math.round(quote.totalProductionCost)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/80 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">
                    Net Company Profit:
                  </span>
                  <span className="font-black text-emerald-700">
                    ₹
                    {Math.round(
                      quote.finalOrderPrice - quote.totalProductionCost,
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
