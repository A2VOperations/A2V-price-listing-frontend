import React, { useState, useMemo, useEffect } from "react";
import {
  FiBookOpen,
  FiLayers,
  FiTag,
  FiGrid,
  FiDownload,
  FiUser,
  FiPhone,
  FiScissors,
  FiShield,
  FiDollarSign,
  FiCheck,
  FiAlertTriangle,
  FiPlus,
  FiMinus,
  FiTruck,
  FiLock,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import { useAuth } from "@/context/AuthContext";
import { fetchPaperMastersApi } from "@/services/api";
import { generateGeneralProductQuotationPdf } from "@/lib/generateQuotationPdf";

// Standard commercial finished sizes (calibrated for Indian commercial print shops)
const PRESET_SIZES = [
  {
    id: "4.5x11",
    name: '4.5" × 11" (Standard Bill Book - 8 Out of 18×22)',
    w: 4.5,
    h: 11,
    popular: true,
  },
  {
    id: "a4",
    name: 'A4 (8.27" × 11.69" - 4 Out of 18×22)',
    w: 8.27,
    h: 11.69,
    popular: true,
  },
  {
    id: "a5",
    name: 'A5 / A4 Half (5.83" × 8.27" - 8 Out of 18×22)',
    w: 5.83,
    h: 8.27,
    popular: true,
  },
  { id: "legal", name: 'Legal (8.5" × 14.0")', w: 8.5, h: 14.0 },
  { id: "1/4-demy", name: '1/4 Demy (9" × 11" - 4 Out of 18×22)', w: 9, h: 11 },
  { id: "1/8-demy", name: '1/8 Demy (4.5" × 11" - 8 Out of 18×22)', w: 4.5, h: 11 },
  { id: "1/6-demy", name: '1/6 Demy (5.5" × 6.0" - 6 Out)', w: 5.5, h: 6.0 },
  { id: "custom", name: "Custom Dimensions", w: 4.5, h: 11 },
];

const BINDING_OPTIONS = [
  {
    id: "normal",
    name: "Normal Binding (Includes Cover, Gatta & Finishing)",
    rate: 25,
    tag: "Standard Popular",
  },
  {
    id: "stapler",
    name: "Stapler / Wire Stitch Binding",
    rate: 12,
    tag: "Economy",
  },
  {
    id: "gumming",
    name: "Top Gumming Pad (Writing / Memo)",
    rate: 10,
    tag: "Pads",
  },
  { id: "glue", name: "Hot Melt Glue Spine Binding", rate: 20, tag: "Books" },
  {
    id: "premium",
    name: "Premium Hardbound with Rexine",
    rate: 35,
    tag: "Luxury",
  },
];

export default function CommercialPrintCalculator({
  product,
  onVariantSelect,
}) {
  const { addToQuote, clientInfo, updateClientInfo } = useQuote();
  const { isManagerOrAdmin } = useAuth();

  // Backend Paper Inventory / Sheets Master
  const [backendSheets, setBackendSheets] = useState([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(true);

  useEffect(() => {
    async function loadBackendPapers() {
      try {
        setIsLoadingPapers(true);
        const data = await fetchPaperMastersApi();
        if (Array.isArray(data) && data.length > 0) {
          setBackendSheets(data);
        }
      } catch (err) {
        console.warn("Could not fetch paper masters from backend:", err);
      } finally {
        setIsLoadingPapers(false);
      }
    }
    loadBackendPapers();
  }, []);

  // Master Raw Sheet Size - Dictated by Layer 1 (Layers 2, 3, 4 are strictly locked to this size)
  const [layer1SheetSize, setLayer1SheetSize] = useState({ width: 18, height: 22 });

  // Unique raw sheet sizes available in backend database
  const availableSheetSizes = useMemo(() => {
    if (!backendSheets || backendSheets.length === 0) {
      return [{ width: 18, height: 22, label: '18" × 22"', key: "18x22" }];
    }
    const map = new Map();
    backendSheets.forEach((s) => {
      const w = Number(s.rawWidthInch) || 18;
      const h = Number(s.rawHeightInch) || 22;
      const key = `${w}x${h}`;
      if (!map.has(key)) {
        map.set(key, {
          width: w,
          height: h,
          label: `${w}" × ${h}"`,
          key,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.width - b.width);
  }, [backendSheets]);

  // Extract unique Paper Types directly from backend sheets
  const backendPaperTypes = useMemo(() => {
    if (!backendSheets || backendSheets.length === 0) {
      return ["Newsprint", "Maplitho", "Art Paper", "Bond Paper"];
    }
    const types = new Set();
    backendSheets.forEach((p) => {
      if (p.paperType) types.add(p.paperType.trim());
    });
    return Array.from(types).sort();
  }, [backendSheets]);

  // Sheets accessible by layer:
  // Layer 1 can access all or size-matched sheets.
  // Layers 2, 3, 4 are STRICTLY locked to Layer 1's sheet size!
  const getSheetsForLayer = (layerIndex) => {
    if (!backendSheets || backendSheets.length === 0) return [];
    if (layerIndex === 0) {
      return backendSheets;
    }
    return backendSheets.filter(
      (b) =>
        Number(b.rawWidthInch) === Number(layer1SheetSize.width) &&
        Number(b.rawHeightInch) === Number(layer1SheetSize.height)
    );
  };

  // Unique Paper Types for a specific layer
  const getPaperTypesForLayer = (layerIndex) => {
    const sheets = getSheetsForLayer(layerIndex);
    if (!sheets || sheets.length === 0) return backendPaperTypes;
    const types = new Set();
    sheets.forEach((p) => {
      if (p.paperType) types.add(p.paperType.trim());
    });
    return Array.from(types).sort();
  };

  // Available GSMs for a given paper type in that layer's locked size
  const getGSMsForLayerAndType = (layerIndex, type) => {
    const sheets = getSheetsForLayer(layerIndex);
    if (!sheets || sheets.length === 0) return [49, 58, 64, 70, 80, 90, 100, 115];
    const filtered = sheets.filter(
      (p) =>
        !type ||
        (p.paperType || "").trim().toLowerCase() === (type || "").trim().toLowerCase() ||
        (/news/i.test(p.paperType) && /news/i.test(type))
    );
    const gsms = new Set(filtered.map((p) => Number(p.gsm)).filter(Boolean));
    if (gsms.size === 0) {
      sheets.forEach((p) => {
        if (p.gsm) gsms.add(Number(p.gsm));
      });
    }
    return Array.from(gsms).sort((a, b) => a - b);
  };

  // Available Colours for a given layer, type, and GSM in that layer's locked size
  const getColoursForLayerTypeAndGsm = (layerIndex, type, gsm) => {
    const sheets = getSheetsForLayer(layerIndex);
    if (!sheets || sheets.length === 0) return ["Yellow", "Pink", "Green", "White"];
    const filtered = sheets.filter((p) => {
      const typeMatch =
        !type ||
        (p.paperType || "").trim().toLowerCase() === (type || "").trim().toLowerCase() ||
        (/news/i.test(p.paperType) && /news/i.test(type));
      const gsmMatch = !gsm || Number(p.gsm) === Number(gsm);
      return typeMatch && gsmMatch;
    });
    const colours = new Set(filtered.map((p) => p.colour?.trim()).filter(Boolean));
    if (colours.size === 0) {
      sheets.forEach((p) => {
        if (p.colour) colours.add(p.colour.trim());
      });
    }
    return Array.from(colours).sort();
  };

  // Handler when Layer 1 Sheet Size is updated (auto-aligns all plies to the new size)
  const handleLayer1SheetSizeChange = (newWidth, newHeight) => {
    const w = Number(newWidth);
    const h = Number(newHeight);
    setLayer1SheetSize({ width: w, height: h });

    setPlyConfigs((prev) => {
      return prev.map((ply, idx) => {
        const sheetsForSize = backendSheets.filter(
          (b) => Number(b.rawWidthInch) === w && Number(b.rawHeightInch) === h
        );
        if (sheetsForSize.length === 0) return ply;

        const typesForSize = Array.from(
          new Set(sheetsForSize.map((s) => s.paperType).filter(Boolean))
        );
        const matchedType =
          typesForSize.find(
            (t) =>
              t.toLowerCase() === (ply.paperType || "").toLowerCase() ||
              (/news/i.test(t) && /news/i.test(ply.paperType))
          ) || typesForSize[0] || ply.paperType;

        const gsmsForType = sheetsForSize
          .filter((s) => (s.paperType || "").toLowerCase() === matchedType.toLowerCase())
          .map((s) => Number(s.gsm));
        const matchedGsm = gsmsForType.includes(Number(ply.gsm))
          ? Number(ply.gsm)
          : (gsmsForType[0] || ply.gsm);

        let matchedColour = ply.colour;
        if (idx === 0) {
          matchedColour = "White";
        } else {
          const colours = sheetsForSize
            .filter(
              (s) =>
                (s.paperType || "").toLowerCase() === matchedType.toLowerCase() &&
                Number(s.gsm) === matchedGsm
            )
            .map((s) => s.colour);
          if (colours.length > 0 && !colours.map((c) => c?.toLowerCase()).includes(ply.colour.toLowerCase())) {
            const nonWhite = colours.find((c) => c?.toLowerCase() !== "white");
            matchedColour = nonWhite || colours[0] || ply.colour;
          }
        }

        return {
          ...ply,
          paperType: matchedType,
          gsm: matchedGsm,
          colour: matchedColour,
        };
      });
    });
  };

  // Auto-sync initial ply configs when backend papers load
  useEffect(() => {
    if (backendSheets.length > 0) {
      setPlyConfigs((prev) => {
        const types = Array.from(new Set(backendSheets.map((p) => p.paperType).filter(Boolean)));
        const defaultType = types.find((t) => /news/i.test(t)) || types[0] || "Maplitho";
        const availableGsms = backendSheets
          .filter((p) => (p.paperType || "").toLowerCase() === defaultType.toLowerCase())
          .map((p) => Number(p.gsm));
        const defaultGsm = availableGsms[0] || 58;

        return prev.map((ply, idx) => {
          const matchedType =
            types.find(
              (t) =>
                t.toLowerCase() === (ply.paperType || "").toLowerCase() ||
                (/news/i.test(t) && /news/i.test(ply.paperType))
            ) || defaultType;

          const gsmsForType = backendSheets
            .filter((p) => (p.paperType || "").toLowerCase() === matchedType.toLowerCase())
            .map((p) => Number(p.gsm));
          const matchedGsm = gsmsForType.includes(Number(ply.gsm))
            ? Number(ply.gsm)
            : (gsmsForType[0] || defaultGsm);

          let matchedColour = ply.colour;
          if (idx === 0) {
            matchedColour = "White";
          } else {
            const coloursForTypeGsm = backendSheets
              .filter(
                (p) =>
                  (p.paperType || "").toLowerCase() === matchedType.toLowerCase() &&
                  Number(p.gsm) === matchedGsm
              )
              .map((p) => p.colour);
            if (coloursForTypeGsm.length > 0 && !coloursForTypeGsm.map((c) => c?.toLowerCase()).includes(ply.colour.toLowerCase())) {
              const nonWhite = coloursForTypeGsm.find((c) => c?.toLowerCase() !== "white");
              matchedColour = nonWhite || coloursForTypeGsm[0] || ply.colour;
            }
          }

          return {
            ...ply,
            paperType: matchedType,
            gsm: matchedGsm,
            colour: matchedColour,
          };
        });
      });
    }
  }, [backendSheets]);

  // 1. Basic Product & Finished Size
  const [productType, setProductType] = useState(product?.name || "Bill Book");
  const [sizePreset, setSizePreset] = useState("4.5x11");
  const [customWidth, setCustomWidth] = useState(4.5);
  const [customHeight, setCustomHeight] = useState(11);

  // 2. Quantity & Volume (Rule: Min 10, Step 5)
  const [quantity, setQuantity] = useState(10);

  // 3. Pages / Sets per Book (Rule: 100, 150, 200, 250... step 50)
  const [pagesPerBook, setPagesPerBook] = useState(100);

  // 4. Number of Plies: 1-Ply, 2-Ply, 3-Ply, 4-Ply
  const [plyCount, setPlyCount] = useState(2);

  // 5. Printing Sides & Inks
  const [printSides, setPrintSides] = useState("single"); // "single" (Front) | "both" (Front & Back)

  // Per-Ply Configurations (1, 2, 3, 4 Plies)
  // Layer 1 is always White paper as specified
  const [plyConfigs, setPlyConfigs] = useState([
    {
      plyIndex: 1,
      colour: "White",
      paperType: "Newspaper",
      gsm: 58,
      inkColour: "Black",
      differentDesign: false, // does this ply have different plate text?
    },
    {
      plyIndex: 2,
      colour: "Yellow",
      paperType: "Newspaper",
      gsm: 58,
      inkColour: "Black",
      differentDesign: false,
    },
    {
      plyIndex: 3,
      colour: "Pink",
      paperType: "Newspaper",
      gsm: 58,
      inkColour: "Black",
      differentDesign: false,
    },
    {
      plyIndex: 4,
      colour: "Green",
      paperType: "Newspaper",
      gsm: 58,
      inkColour: "Black",
      differentDesign: false,
    },
  ]);

  // Client Details
  const [clientName, setClientName] = useState(clientInfo?.clientName || "");
  const [clientPhone, setClientPhone] = useState(clientInfo?.phone || "");
  const [companyName, setCompanyName] = useState(clientInfo?.companyName || "");

  useEffect(() => {
    if (clientInfo?.clientName && !clientName) setClientName(clientInfo.clientName);
    if (clientInfo?.phone && !clientPhone) setClientPhone(clientInfo.phone);
    if (clientInfo?.companyName && !companyName) setCompanyName(clientInfo.companyName);
  }, [clientInfo]);

  // Binding & Finishing States
  const [selectedBinding, setSelectedBinding] = useState("normal");
  const [hasNumbering, setHasNumbering] = useState(true);
  const [startNumber, setStartNumber] = useState(1);
  const [hasPunching, setHasPunching] = useState(false);

  // Bargaining & Commercial States
  const [manualSellingPrice, setManualSellingPrice] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Determine Active Finished Dimensions
  const selectedSizeObj =
    PRESET_SIZES.find((s) => s.id === sizePreset) || PRESET_SIZES[0];
  const finishedW =
    sizePreset === "custom"
      ? Math.max(1, parseFloat(customWidth) || 4.5)
      : selectedSizeObj.w;
  const finishedH =
    sizePreset === "custom"
      ? Math.max(1, parseFloat(customHeight) || 11)
      : selectedSizeObj.h;

  // Active Binding Rate
  const activeBindingObj =
    BINDING_OPTIONS.find((b) => b.id === selectedBinding) || BINDING_OPTIONS[0];
  const bindingRate = activeBindingObj.rate;

  // Helper to adjust quantity in multiples of 5 (min 10)
  const handleQuantityStep = (delta) => {
    setQuantity((prev) => Math.max(10, Math.round((Number(prev) + delta) / 5) * 5));
  };

  // Helper to adjust pages in steps of 50 (min 50)
  const handlePagesStep = (delta) => {
    setPagesPerBook((prev) => Math.max(50, Number(prev) + delta));
  };

  // Update a single ply attribute
  const handleUpdatePly = (index, field, value) => {
    setPlyConfigs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // -------------------------------------------------------------
  // AUTOMATIC OPTIMAL RAW SHEET SELECTION & COMPLETE COSTING ENGINE
  // -------------------------------------------------------------
  const calculation = useMemo(() => {
    const qty = Math.max(10, Math.round((Number(quantity) || 10) / 5) * 5);
    const pages = Math.max(50, Number(pagesPerBook) || 100);
    const activePlies = plyConfigs.slice(0, plyCount);

    // 1. Raw Sheet Size is strictly governed by Layer 1 (Layers 2, 3, 4 are fixed with Layer 1)
    const rawW = Number(layer1SheetSize.width) || 18;
    const rawH = Number(layer1SheetSize.height) || 22;
    const optimalRawSheet = {
      width: rawW,
      height: rawH,
      name: `${rawW}" × ${rawH}" (${rawW === 18 && rawH === 22 ? "Standard Mini Offset" : "Commercial Sheet"})`,
    };

    let bestYield = 1;
    let selectedLayout = "vertical";
    let grid = { cols: 2, rows: 2 };

    // Standard A4 on 18x22 sheet quarters into 4 pieces
    const isA4 = (finishedW >= 8.0 && finishedW <= 9.0 && finishedH >= 10.5 && finishedH <= 12.0) ||
                 (finishedH >= 8.0 && finishedH <= 9.0 && finishedW >= 10.5 && finishedW <= 12.0);

    // Half of A4 (A5) on 18x22 sheet divides into 8 pieces
    const isA5 = (finishedW >= 4.0 && finishedW <= 6.0 && finishedH >= 8.0 && finishedH <= 9.5) ||
                 (finishedH >= 4.0 && finishedH <= 6.0 && finishedW >= 8.0 && finishedW <= 9.5);

    if (isA4 && ((rawW === 18 && rawH === 22) || (rawW === 22 && rawH === 18))) {
      bestYield = 4;
      selectedLayout = "vertical";
      grid = { cols: 2, rows: 2 };
    } else if (isA5 && ((rawW === 18 && rawH === 22) || (rawW === 22 && rawH === 18))) {
      bestYield = 8;
      selectedLayout = (finishedW === 4.5 || finishedH === 4.5) ? "vertical" : "horizontal";
      grid = (finishedW === 4.5 || finishedH === 4.5) ? { cols: 4, rows: 2 } : { cols: 2, rows: 4 };
    } else {
      // Pure mathematical cutting with 0 cutting margin (epsilon protection for exact divisions)
      const eps = 0.001;
      const vCols = Math.floor((rawW + eps) / finishedW);
      const vRows = Math.floor((rawH + eps) / finishedH);
      const vYield = vCols * vRows;

      const hCols = Math.floor((rawW + eps) / finishedH);
      const hRows = Math.floor((rawH + eps) / finishedW);
      const hYield = hCols * hRows;

      const isHoriz = hYield > vYield;
      bestYield = Math.max(1, isHoriz ? hYield : vYield);
      selectedLayout = isHoriz ? "horizontal" : "vertical";
      grid = isHoriz ? { cols: hCols, rows: hRows } : { cols: vCols, rows: vRows };
    }

    // 2. Paper Requirements & Costs (Strict Ream & Loose Sheet Purchasing Rule)
    // Rule:
    // - Every layer has +5 extra sheets added for production/press make-ready wastage buffer.
    // - Every full 500 sheets is purchased at the Rim Price (reamRate).
    // - Any remaining loose sheets (< 500) are purchased at Loose Price (loosePrice).
    // - If plies use the SAME paper sheet (same type, GSM, colour, size), their sheet quantities are combined together.
    const totalPagesPerPly = qty * pages; // e.g. 10 books * 100 pages = 1000 sheets
    const netRawSheets = Math.ceil(totalPagesPerPly / bestYield);
    const wastage = 5; // +5 extra sheets per layer for wastage
    const grossRawSheets = netRawSheets + wastage;

    // Group active plies by exact paper identity to combine purchase of the same sheet
    const paperGroups = new Map();

    const resolvedPlies = activePlies.map((ply, idx) => {
      // Look up loose price directly from backend sheet master matching Layer 1's exact size
      const matchingSheet = backendSheets.find((bs) => {
        const sizeMatch =
          Number(bs.rawWidthInch) === rawW && Number(bs.rawHeightInch) === rawH;
        const typeMatch =
          (bs.paperType || "").trim().toLowerCase() === (ply.paperType || "").trim().toLowerCase() ||
          (/news/i.test(bs.paperType) && /news/i.test(ply.paperType));
        const gsmMatch = Number(bs.gsm) === Number(ply.gsm);
        const colMatch =
          (bs.colour || "").trim().toLowerCase() === (ply.colour || "").trim().toLowerCase();
        return sizeMatch && typeMatch && gsmMatch && colMatch;
      });

      const loosePrice =
        matchingSheet?.looseSheetRate !== undefined && Number(matchingSheet.looseSheetRate) > 0
          ? Number(matchingSheet.looseSheetRate)
          : Number(
              matchingSheet?.currentRate?.looseRatePerSheet ??
              matchingSheet?.activeRate?.looseSheetRate ??
              (Number(ply.gsm) >= 70 ? 1.75 : 1.25)
            );

      const reamRate =
        matchingSheet?.reamRate !== undefined && Number(matchingSheet.reamRate) > 0
          ? Number(matchingSheet.reamRate)
          : Number(
              matchingSheet?.currentRate?.reamRate ??
              matchingSheet?.activeRate?.reamRate ??
              600
            );

      const paperKey = `${(ply.paperType || "").trim().toLowerCase()}_${ply.gsm}_${(ply.colour || "").trim().toLowerCase()}_${rawW}x${rawH}`;

      if (!paperGroups.has(paperKey)) {
        paperGroups.set(paperKey, {
          paperKey,
          label: `${ply.paperType} ${ply.gsm} GSM ${ply.colour}`,
          paperType: ply.paperType,
          gsm: ply.gsm,
          colour: ply.colour,
          loosePrice,
          reamRate,
          matchingSheet,
          totalSheets: 0,
          pliesCount: 0,
        });
      }

      const grp = paperGroups.get(paperKey);
      grp.totalSheets += grossRawSheets;
      grp.pliesCount += 1;

      return {
        ...ply,
        matchingSheet,
        loosePrice,
        reamRate,
        paperKey,
        bestYield,
        selectedLayout,
        grid,
        netRawSheets,
        wastage,
        grossRawSheets,
      };
    });

    // Calculate purchasing cost for each grouped paper (Full 500s = Reams @ reamRate; Remainder = Loose @ loosePrice)
    let totalPaperCost = 0;
    const paperPurchasingBreakdown = [];

    paperGroups.forEach((grp) => {
      const fullReams = Math.floor(grp.totalSheets / 500);
      const remainingLooseSheets = grp.totalSheets % 500;
      const reamsCost = fullReams * grp.reamRate;
      const looseCost = remainingLooseSheets * grp.loosePrice;
      const groupCost = Math.round(reamsCost + looseCost);

      totalPaperCost += groupCost;

      paperPurchasingBreakdown.push({
        ...grp,
        fullReams,
        remainingLooseSheets,
        reamsCost,
        looseCost,
        groupCost,
      });
    });

    // Allocate cost to each ply calculation
    const plyCalculations = resolvedPlies.map((p) => {
      const grp = paperPurchasingBreakdown.find((g) => g.paperKey === p.paperKey);
      const plyCostShare =
        grp && grp.pliesCount > 0
          ? Math.round(grp.groupCost / grp.pliesCount)
          : Math.round(p.grossRawSheets * p.loosePrice);

      return {
        ...p,
        plyPaperCost: plyCostShare,
      };
    });

    // 3. Mini Offset Machine Printing Slabs (₹70 per 1,000 sheets per run)
    // Slabs: 1000 sheets = 1 slab (₹70); 1100 to 2000 = 2 slabs (₹140); 2001 to 3000 = 3 slabs (₹210)
    const slabCount = Math.max(1, Math.ceil(totalPagesPerPly / 1000));
    const sidesCount = printSides === "both" ? 2 : 1;
    const totalRuns = plyCount * sidesCount;
    const totalOffsetRunCost = totalRuns * slabCount * 70;

    // 4. Master Plates (₹30 per unique plate / ink colour / design)
    // Rule:
    // - Same ink colour across all plies = 1 Master (₹30)
    // - Different ink colour = +₹30 per unique colour (e.g. 2 colours = ₹60, into 2)
    // - Different design on copy ply = +₹30 per different design
    // - Both sides = +1 master for back side (+₹30)
    const uniqueFrontMasters = new Set();
    const uniqueInkColoursSet = new Set();

    activePlies.forEach((p, idx) => {
      const ink = (p.inkColour || "Black").trim().toUpperCase();
      uniqueInkColoursSet.add(ink);
      const designTag = idx > 0 && p.differentDesign ? `DIFF_DESIGN_${idx + 1}` : "COMMON_DESIGN";
      uniqueFrontMasters.add(`${designTag}_${ink}`);
    });

    let masterCount = uniqueFrontMasters.size;
    if (printSides === "both") {
      masterCount += 1; // +1 back master plate
    }
    const masterCost = masterCount * 30;
    const uniqueInkColoursCount = uniqueInkColoursSet.size;

    // 5. Binding & Finishing
    const bindingCost = qty * bindingRate;
    const numberingCost = hasNumbering ? qty * 2 : 0;
    const punchingCost = hasPunching ? qty * 2 : 0;
    const totalFinishingCost = bindingCost + numberingCost + punchingCost;

    // 6. Fixed Transportation Cost (Always ₹50 as instructed)
    const transportationCost = 50;

    // 7. Total Internal Vendor Cost
    const totalVendorCost = Math.round(
      totalPaperCost +
        masterCost +
        totalOffsetRunCost +
        totalFinishingCost +
        transportationCost
    );

    // 8. Selling Price = Directly Vendor Cost (0% Margin - Margin removed as instructed)
    const recommendedSellingPrice = totalVendorCost;

    // Final Selling Price (with Salesperson Bargaining Override if manually entered)
    const finalSellingPrice =
      manualSellingPrice && !isNaN(Number(manualSellingPrice))
        ? Number(manualSellingPrice)
        : recommendedSellingPrice;

    // Margin & Profit (0% by default since margin is removed)
    const netProfit = Math.round(finalSellingPrice - totalVendorCost);
    const profitMarginPercent =
      finalSellingPrice > 0
        ? Number(((netProfit / finalSellingPrice) * 100).toFixed(1))
        : 0;

    const grandTotal = finalSellingPrice;

    // Continuous Numbering Range
    const totalSets = qty * pages;
    const endNumber = parseInt(startNumber, 10) + totalSets - 1;
    const numberingRange = hasNumbering
      ? `${String(startNumber).padStart(4, "0")} – ${String(endNumber).padStart(4, "0")}`
      : "None";

    const totalNetRawSheetsAllPlies = netRawSheets * plyCount;
    const totalGrossRawSheetsAllPlies = grossRawSheets * plyCount;

    return {
      qty,
      pages,
      totalPagesPerPly,
      optimalRawSheet,
      bestYield,
      selectedLayout,
      grid,
      netRawSheets,
      grossRawSheets,
      totalNetRawSheetsAllPlies,
      totalGrossRawSheetsAllPlies,
      wastage,
      plyCalculations,
      slabCount,
      sidesCount,
      totalRuns,
      totalOffsetRunCost,
      masterCount,
      masterCost,
      uniqueInkColoursCount,
      totalPaperCost,
      paperPurchasingBreakdown,
      bindingCost,
      numberingCost,
      punchingCost,
      totalFinishingCost,
      transportationCost,
      totalVendorCost,
      recommendedSellingPrice,
      finalSellingPrice,
      netProfit,
      profitMarginPercent,
      isLossMaking: netProfit < 0,
      grandTotal,
      numberingRange,
    };
  }, [
    quantity,
    pagesPerBook,
    plyCount,
    plyConfigs,
    printSides,
    sizePreset,
    finishedW,
    finishedH,
    bindingRate,
    hasNumbering,
    startNumber,
    hasPunching,
    manualSellingPrice,
    backendSheets,
    layer1SheetSize,
  ]);

  // Handle Add to Quotation Cart
  const handleAddToQuote = () => {
    const plySummaryStr = calculation.plyCalculations
      .map((p, idx) => `Layer ${idx + 1}: ${p.colour} (${p.paperType || "Paper"}, ${p.gsm} GSM)`)
      .join(" | ");

    addToQuote(
      {
        id: `billbook-${Date.now()}`,
        name: `${productType} (${plyCount}-Ply)`,
        category: "commercial-printing",
        image: product?.image || "",
        price: Math.round(calculation.finalSellingPrice / calculation.qty),
      },
      calculation.qty,
      {
        size: `${finishedW}" × ${finishedH}"`,
        pagesPerBook: `${calculation.pages} Sets`,
        plies: `${plyCount} Ply`,
        plySummary: plySummaryStr,
        printingSides: printSides === "both" ? "Both Sides (Front & Back)" : "Front Side Only",
        binding: activeBindingObj.name,
        numbering: calculation.numberingRange,
        punching: hasPunching ? "Included" : "None",
        totalAmount: calculation.grandTotal,
        unitPrice: Math.round(calculation.finalSellingPrice / calculation.qty),
      }
    );

    if (clientName || clientPhone || companyName) {
      updateClientInfo({ clientName, phone: clientPhone, companyName });
    }

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3500);
  };

  // Instant PDF Download
  const handleDownloadPdf = () => {
    try {
      setIsGeneratingPdf(true);
      const docUrl = generateGeneralProductQuotationPdf({
        productName: `${productType} (${plyCount}-Ply)`,
        productCode: "BB-001",
        selectedVariant: `${finishedW}" × ${finishedH}"`,
        selectedOptions: {
          "Finished Dimensions": `${finishedW}" × ${finishedH}"`,
          "Ply Layers": `${plyCount} Ply (${calculation.plyCalculations.map((p) => p.colour).join(", ")})`,
          "Pages / Book": `${calculation.pages} Sets`,
          "Printing Sides": printSides === "both" ? "Front & Back (Both Sides)" : "Front Side Only",
          "Binding Type": activeBindingObj.name,
          "Serial Numbering": calculation.numberingRange,
          "Perforation / Punching": hasPunching ? "Yes (Included)" : "No",
        },
        quantity: calculation.qty,
        unitName: "Books",
        applicableCost: calculation.finalSellingPrice,
        validDiscount: 0,
        totalAmount: calculation.grandTotal,
        clientInfo: {
          clientName: clientName || "Valued Customer",
          phone: clientPhone || "N/A",
          companyName: companyName || "",
        },
      });

      if (docUrl) {
        window.open(docUrl, "_blank");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF quotation.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-600 text-white shadow-xs">
              <FiBookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Bill Book, Receipt Book &amp; Writing Pad Calculator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Configure 1, 2, 3 or 4-Ply Bill Books, Pads &amp; Slips. Automatically selects optimal paper sheets, calculates machine impressions, binding, and serial numbering.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: SALESPERSON CONFIGURATION CONTROLS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: PRODUCT & FINISHED SIZE */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiTag className="text-orange-600" />
                1. Product &amp; Finished Size
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                Step 1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Type
                </label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Bill Book">Bill Book</option>
                  <option value="Receipt Book">Receipt Book</option>
                  <option value="Cash Memo">Cash Memo</option>
                  <option value="Delivery Challan">Delivery Challan</option>
                  <option value="Bilty Book">Bilty Book</option>
                  <option value="Order Book">Order Book</option>
                  <option value="Writing Pad">Writing Pad</option>
                  <option value="Gumming Pad">Gumming Pad</option>
                  <option value="Donation Receipt">Donation Receipt</option>
                  <option value="Jagran Slip">Jagran Slip</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Finished Size Preset
                </label>
                <select
                  value={sizePreset}
                  onChange={(e) => setSizePreset(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-orange-500"
                >
                  {PRESET_SIZES.map((sz) => (
                    <option key={sz.id} value={sz.id}>
                      {sz.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {sizePreset === "custom" && (
              <div className="grid grid-cols-2 gap-4 p-3.5 bg-orange-50/50 rounded-xl border border-orange-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Custom Width (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Custom Height (Inches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="14"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: QUANTITY & PAGES (STRICT MULTIPLES) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiLayers className="text-orange-600" />
                2. Quantity &amp; Pages per Book
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                Step 2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* QUANTITY CONTROL: MIN 10, STEP 5 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    Quantity (Books / Pads) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                    Multiples of 5 (Min 10)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityStep(-5)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    min="10"
                    step="5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onBlur={(e) => {
                      const val = Math.max(10, Math.round((Number(e.target.value) || 10) / 5) * 5);
                      setQuantity(val);
                    }}
                    className="flex-1 h-10 text-center font-bold text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />

                  <button
                    type="button"
                    onClick={() => handleQuantityStep(5)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 15, 20, 25, 30, 50, 100].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        Number(quantity) === q
                          ? "bg-orange-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* PAGES PER BOOK: STEP 50 (100, 150, 200, 250...) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    Pages / Sets per Book <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Increments of 50
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePagesStep(-50)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>

                  <select
                    value={pagesPerBook}
                    onChange={(e) => setPagesPerBook(Number(e.target.value))}
                    className="flex-1 h-10 text-center font-bold text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                  >
                    {[50, 100, 150, 200, 250, 300, 350, 400, 500].map((pg) => (
                      <option key={pg} value={pg}>
                        {pg} Sets / Book {pg === 100 ? "(Standard)" : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handlePagesStep(50)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[100, 150, 200, 250, 300].map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setPagesPerBook(pg)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        Number(pagesPerBook) === pg
                          ? "bg-orange-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      {pg}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: NUMBER OF PLIES & LAYER PAPERS (1, 2, 3, 4 PLIES) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiLayers className="text-orange-600" />
                3. Number of Plies &amp; Paper Layers
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                Step 3
              </span>
            </div>

            {/* PLY SELECTION BUTTONS: 1, 2, 3, 4 */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Ply Count
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { ply: 1, label: "1-Ply", desc: "Single" },
                  { ply: 2, label: "2-Ply", desc: "Duplicate" },
                  { ply: 3, label: "3-Ply", desc: "Triplicate" },
                  { ply: 4, label: "4-Ply", desc: "Quadruplicate" },
                ].map((item) => (
                  <button
                    key={item.ply}
                    type="button"
                    onClick={() => setPlyCount(item.ply)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      plyCount === item.ply
                        ? "bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-extrabold text-sm">{item.label}</div>
                    <div className={`text-[10px] ${plyCount === item.ply ? "text-orange-100" : "text-slate-400"}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>

              {/* COMMERCIAL PAPER MULTIPLIER (1-Ply = 250, 2-Ply = 500, 3-Ply = 750, 4-Ply = 1,000) */}
              <div className="mt-2.5 p-3 rounded-xl bg-orange-50/80 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="text-slate-800">
                  <span className="font-extrabold text-orange-950">
                    {calculation.totalPagesPerPly.toLocaleString("en-IN")} Finished Pcs
                  </span>{" "}
                  ÷ {calculation.bestYield} yield ={" "}
                  <span className="font-bold text-orange-900">
                    {calculation.netRawSheets} Raw Sheets / Ply
                  </span>
                </div>
                <div className="font-bold text-orange-950 bg-white px-2.5 py-1 rounded-lg border border-orange-200 shadow-2xs">
                  Total Order:{" "}
                  <span className="text-orange-600 font-extrabold">
                    {calculation.totalNetRawSheetsAllPlies} Raw Sheets
                  </span>{" "}
                  ({calculation.netRawSheets} × {plyCount} {plyCount > 1 ? "Plies" : "Ply"})
                </div>
              </div>
            </div>

            {/* PRINT SIDES: SINGLE VS BOTH SIDES */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Printing Sides
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrintSides("single")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    printSides === "single"
                      ? "bg-orange-50 border-orange-600 ring-2 ring-orange-500/20 text-orange-950 font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold">Front Side Only</div>
                  <div className="text-[10px] text-slate-500 font-normal">Standard 1-side printing</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintSides("both")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    printSides === "both"
                      ? "bg-orange-50 border-orange-600 ring-2 ring-orange-500/20 text-orange-950 font-bold"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold">Both Sides (Front &amp; Back)</div>
                  <div className="text-[10px] text-slate-500 font-normal">Terms, rules or receipt on back side</div>
                </button>
              </div>
            </div>

            {/* INDIVIDUAL LAYER CARDS */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-800 block">
                Paper Quality &amp; Colours for Each Layer:
              </span>

              {plyConfigs.slice(0, plyCount).map((ply, idx) => {
                const isLayerOne = idx === 0;
                const plyCalc = calculation?.plyCalculations?.[idx];
                const matchingSheet = plyCalc?.matchingSheet;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border ${
                            ply.colour.toLowerCase() === "white"
                              ? "bg-white border-slate-400"
                              : ply.colour.toLowerCase() === "yellow"
                              ? "bg-amber-300 border-amber-400"
                              : ply.colour.toLowerCase() === "pink"
                              ? "bg-pink-300 border-pink-400"
                              : ply.colour.toLowerCase() === "green"
                              ? "bg-emerald-300 border-emerald-400"
                              : "bg-blue-300 border-blue-400"
                          }`}
                        />
                        Layer {idx + 1}: {ply.colour} Paper {isLayerOne ? "(Original Copy)" : "(Carbonless Duplicate)"}
                      </span>

                      <div className="flex items-center gap-2">
                        {plyCalc?.loosePrice ? (
                          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            ₹{plyCalc.loosePrice.toFixed(2)} / loose sheet
                          </span>
                        ) : null}
                        <span className="text-[10px] font-bold text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded-md">
                          {calculation.netRawSheets} raw sheets
                        </span>
                      </div>
                    </div>

                    {/* SHEET SIZE CONTROL: LAYER 1 CONTROLS SIZE, LAYERS 2-4 ARE STRICTLY LOCKED */}
                    {isLayerOne ? (
                      <div className="p-2.5 bg-orange-50/70 rounded-lg border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <FiGrid className="text-orange-600 w-4 h-4" />
                          <span>Layer 1 Raw Sheet Size (Master Size):</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={`${layer1SheetSize.width}x${layer1SheetSize.height}`}
                            onChange={(e) => {
                              const [w, h] = e.target.value.split("x").map(Number);
                              handleLayer1SheetSizeChange(w, h);
                            }}
                            className="text-xs font-bold bg-white border border-orange-300 rounded-lg px-2.5 py-1 text-orange-950 focus:ring-2 focus:ring-orange-500"
                          >
                            {availableSheetSizes.map((s) => (
                              <option key={s.key} value={s.key}>
                                {s.label} {s.width === 18 && s.height === 22 ? "(Standard Mini Offset)" : ""}
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded font-bold">
                            Locks all plies
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-slate-100/90 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <FiLock className="text-amber-600 w-3.5 h-3.5" />
                          <span>Sheet Size: {layer1SheetSize.width}" × {layer1SheetSize.height}"</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                          <FiLock className="w-3 h-3 text-amber-700" />
                          Fixed with Layer 1 (Size Locked)
                        </span>
                      </div>
                    )}

                    {/* QUICK SELECT FROM BACKEND SHEETS (Filtered strictly by Layer 1 sheet size) */}
                    {backendSheets.length > 0 && (
                      <div className="p-2 bg-white rounded-lg border border-orange-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <span>
                              ⚡ Quick Select from Backend Sheet Inventory ({getSheetsForLayer(idx).length} sheets in {layer1SheetSize.width}"×{layer1SheetSize.height}"):
                            </span>
                          </label>
                          <span className="text-[9px] font-semibold text-slate-400">
                            Auto-fills Quality, GSM &amp; Colour from DB
                          </span>
                        </div>
                        <select
                          value={matchingSheet?._id || ""}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const found = backendSheets.find((b) => b._id === selectedId);
                            if (found) {
                              if (isLayerOne) {
                                handleLayer1SheetSizeChange(found.rawWidthInch, found.rawHeightInch);
                              }
                              handleUpdatePly(idx, "paperType", found.paperType);
                              handleUpdatePly(idx, "gsm", Number(found.gsm));
                              if (!isLayerOne) {
                                handleUpdatePly(idx, "colour", found.colour);
                              }
                            }
                          }}
                          className="w-full text-xs bg-orange-50/40 border border-orange-200 rounded-lg p-1.5 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">-- Choose exact sheet from backend DB --</option>
                          {getSheetsForLayer(idx)
                            .filter((b) => (isLayerOne ? (b.colour || "").toLowerCase() === "white" : true))
                            .map((b) => (
                              <option key={b._id} value={b._id}>
                                {b.paperType} • {b.gsm} GSM • {b.colour} ({b.rawWidthInch}"×{b.rawHeightInch}") — Loose: ₹{(b.looseSheetRate ?? b.currentRate?.looseRatePerSheet ?? 0).toFixed(2)} | Ream: ₹{b.reamRate ?? b.currentRate?.reamRate ?? 0}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      {/* Paper Quality / Type */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Paper Quality <span className="text-orange-600 font-semibold">(DB)</span>
                        </label>
                        <select
                          value={ply.paperType}
                          onChange={(e) => {
                            const newType = e.target.value;
                            handleUpdatePly(idx, "paperType", newType);
                            const validGsms = getGSMsForLayerAndType(idx, newType);
                            if (!validGsms.includes(Number(ply.gsm)) && validGsms.length > 0) {
                              handleUpdatePly(idx, "gsm", validGsms[0]);
                            }
                          }}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                        >
                          {getPaperTypesForLayer(idx).map((pt) => (
                            <option key={pt} value={pt}>
                              {pt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* GSM */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          GSM <span className="text-orange-600 font-semibold">(DB)</span>
                        </label>
                        <select
                          value={ply.gsm}
                          onChange={(e) => handleUpdatePly(idx, "gsm", Number(e.target.value))}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                        >
                          {getGSMsForLayerAndType(idx, ply.paperType).map((g) => (
                            <option key={g} value={g}>
                              {g} GSM
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Paper Colour (Layer 1 is always White as required) */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Sheet Colour <span className="text-orange-600 font-semibold">(DB)</span>
                        </label>
                        {isLayerOne ? (
                          <div className="w-full text-xs bg-slate-100 border border-slate-300 rounded-lg p-1.5 font-bold text-slate-700 flex items-center justify-between">
                            <span>White (Fixed)</span>
                            <span className="text-[9px] text-slate-500 font-normal">Original Copy</span>
                          </div>
                        ) : (
                          <select
                            value={ply.colour}
                            onChange={(e) => handleUpdatePly(idx, "colour", e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                          >
                            {getColoursForLayerTypeAndGsm(idx, ply.paperType, ply.gsm).map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Ink Colour */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Ink Colour
                        </label>
                        <select
                          value={ply.inkColour}
                          onChange={(e) => handleUpdatePly(idx, "inkColour", e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-medium"
                        >
                          <option value="Black">Black Ink</option>
                          <option value="Red">Red Ink</option>
                          <option value="Blue">Blue Ink</option>
                          <option value="Green">Green Ink</option>
                        </select>
                        {idx > 0 && (
                          <span className="text-[9px] block mt-1 font-semibold leading-tight">
                            {(ply.inkColour || "Black").toLowerCase() === (plyConfigs[0]?.inkColour || "Black").toLowerCase() ? (
                              <span className="text-emerald-700">✓ Same ink as Layer 1 (Shares Master Plate ₹30)</span>
                            ) : (
                              <span className="text-amber-800 font-bold">⚡ Different ink (+₹30 Master Plate)</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Master Plate Checkbox if design differs from layer 1 */}
                    {!isLayerOne && (
                      <div className="pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
                          <input
                            type="checkbox"
                            checked={ply.differentDesign}
                            onChange={(e) => handleUpdatePly(idx, "differentDesign", e.target.checked)}
                            className="w-3.5 h-3.5 text-orange-600 rounded"
                          />
                          <span>Different text/design on this copy (+₹30 Master Plate)</span>
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: BINDING, NUMBERING & PUNCHING */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiScissors className="text-orange-600" />
                4. Binding, Numbering &amp; Punching
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">
                Step 4
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Binding Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BINDING_OPTIONS.map((bind) => {
                  const isSelected = selectedBinding === bind.id;
                  return (
                    <button
                      key={bind.id}
                      type="button"
                      onClick={() => setSelectedBinding(bind.id)}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange-50/70 border-orange-600 ring-2 ring-orange-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-900">{bind.name}</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {bind.tag}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-orange-600">
                        ₹{bind.rate} / Book
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* SERIAL NUMBERING */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNumbering}
                    onChange={(e) => setHasNumbering(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Serial Numbering (+₹2 / Book)
                  </span>
                </label>
                {hasNumbering && (
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Starting Serial Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={startNumber}
                      onChange={(e) => setStartNumber(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Range: {calculation.numberingRange}
                    </span>
                  </div>
                )}
              </div>

              {/* PUNCHING / PERFORATION */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPunching}
                    onChange={(e) => setHasPunching(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Punching / Perforation (+₹2 / Book)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Tear-off line perforation along the margin across all plies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME COMMERCIALS & ORDERS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SHEET OPTIMIZATION (Confidential to Manager/Admin) */}
          {isManagerOrAdmin ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FiGrid className="text-orange-600" />
                  Auto-Selected Optimal Raw Sheet
                </span>
                <span className="text-orange-600 font-extrabold text-xs">
                  {calculation.bestYield} Pcs / Sheet
                </span>
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300">
                  Best Cut: {calculation.optimalRawSheet.name} ({calculation.selectedLayout} layout)
                </div>
                <div
                  className="grid gap-1 p-2 bg-slate-800/80 rounded-lg border border-slate-700 max-w-full overflow-hidden"
                  style={{
                    gridTemplateColumns: `repeat(${calculation.grid?.cols || 2}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: calculation.bestYield || 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-10 sm:w-12 h-14 sm:h-16 bg-orange-600/20 border border-orange-500/50 rounded flex items-center justify-center text-[10px] font-mono font-bold text-orange-400"
                    >
                      #{i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  Finished Size: {finishedW}" × {finishedH}"
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Net Sheets / Ply</span>
                  <span className="font-bold text-slate-900">{calculation.netRawSheets}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Wastage / Layer</span>
                  <span className="font-bold text-amber-600">+{calculation.wastage} Sheets</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Total Sheets / Ply</span>
                  <span className="font-bold text-slate-900">{calculation.grossRawSheets}</span>
                </div>
              </div>

              {/* Total Order Raw Sheets across All Plies (1-ply=250, 2-ply=500, 3-ply=750, 4-ply=1000) */}
              <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-orange-950">
                  <span>Total Order Raw Sheets ({plyCount}-Ply):</span>
                  <span className="text-sm font-extrabold text-orange-600">
                    {calculation.totalGrossRawSheetsAllPlies} Sheets ({calculation.totalNetRawSheetsAllPlies} Net + {calculation.wastage * plyCount} Wastage)
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 divide-y divide-orange-100">
                  {calculation.plyCalculations.map((p, idx) => (
                    <div key={idx} className="flex justify-between py-1">
                      <span className="font-medium text-slate-700">
                        • Layer {idx + 1} ({p.colour}):
                      </span>
                      <span className="font-bold text-slate-900">
                        {p.netRawSheets} net (+{p.wastage} wastage = {p.grossRawSheets} gross)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Paper Purchasing Cost Breakdown (500s @ Rim Price, remainder @ Loose Price) */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <FiTag className="text-orange-600 w-3.5 h-3.5" />
                    Paper Purchase Breakdown (Ream &amp; Loose):
                  </span>
                  <span className="font-extrabold text-orange-600">
                    Total: ₹{calculation.totalPaperCost}
                  </span>
                </div>
                <div className="space-y-2 text-[11px]">
                  {calculation.paperPurchasingBreakdown?.map((item, idx) => (
                    <div key={idx} className="p-2 bg-slate-50/80 rounded-lg border border-slate-200/80 space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{item.label}:</span>
                        <span className="font-black text-slate-900">₹{item.groupCost}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-600">
                        <span>
                          {item.fullReams > 0 && (
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mr-1">
                              {item.fullReams} Ream ({item.fullReams * 500} sheets) @ ₹{item.reamRate}
                            </span>
                          )}
                          {item.remainingLooseSheets > 0 && (
                            <span className="font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {item.remainingLooseSheets} Loose sheets @ ₹{item.loosePrice}
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.totalSheets} Total
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Order Specifications Summary for Salesperson */
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FiBookOpen className="text-orange-600" />
                  Order Specifications
                </span>
                <span className="text-orange-600 font-extrabold text-xs">
                  {quantity} Books
                </span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Product:</span>
                  <span className="font-bold text-slate-900">{productType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Finished Size:</span>
                  <span className="font-bold text-slate-900">{finishedW}" × {finishedH}"</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Volume:</span>
                  <span className="font-bold text-slate-900">{quantity} Books × {pagesPerBook} Sets</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Plies:</span>
                  <span className="font-bold text-slate-900">{plyCount} Ply ({calculation.plyCalculations.map((p) => p.colour).join(" + ")})</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Printing:</span>
                  <span className="font-bold text-slate-900">
                    {printSides === "both" ? "Front & Back (Both Sides)" : "Front Side Only"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Binding:</span>
                  <span className="font-bold text-slate-900">{activeBindingObj.name}</span>
                </div>
                {hasNumbering && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Serial Numbering:</span>
                    <span className="font-bold text-slate-900">{calculation.numberingRange}</span>
                  </div>
                )}
                {hasPunching && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Punching / Perforation:</span>
                    <span className="font-bold text-emerald-600">Included</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FINANCIAL SUMMARY & BARGAINING PANEL */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                Vendor Cost &amp; Pricing
              </span>
              <div className="flex justify-between items-baseline">
                <div>
                  <h4 className="text-2xl font-black text-white">
                    ₹{calculation.grandTotal.toLocaleString("en-IN")}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Vendor Production Cost (0% Margin)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Unit Cost</span>
                  <span className="text-sm font-bold text-orange-400">
                    ₹{Math.round(calculation.finalSellingPrice / calculation.qty)} / Book
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Salesperson Negotiated Selling Price Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Quotation Amount (Vendor Cost)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Vendor Cost: ₹${calculation.recommendedSellingPrice}`}
                    value={manualSellingPrice}
                    onChange={(e) => setManualSellingPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Direct Vendor Cost: ₹{calculation.recommendedSellingPrice.toLocaleString("en-IN")} (0% Margin)
                </span>
              </div>

              {/* Client Info Inputs */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Client Information (For Quotation):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Phone / WhatsApp"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleAddToQuote}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  {addedSuccess ? "Added to Quote Cart!" : "Add to Client Quote Cart"}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf}
                  className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiDownload className="w-4 h-4 text-orange-600" />
                  {isGeneratingPdf ? "Generating PDF..." : "Download Official PDF Quote"}
                </button>
              </div>
            </div>

            {/* MANAGER / ADMIN PRODUCTION AUDIT (CONFIDENTIAL FIREWALL) */}
            {isManagerOrAdmin && (
              <div className="p-4 bg-amber-50/70 border-t border-amber-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <FiShield className="w-4 h-4 text-amber-600" />
                    Manager Production Audit (Confidential)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      calculation.isLossMaking
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {calculation.profitMarginPercent}% Margin
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500 block">Total Paper Cost:</span>
                    <span className="font-bold text-slate-900">₹{calculation.totalPaperCost}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Master Plates ({calculation.masterCount} × ₹30):</span>
                    <span className="font-bold text-slate-900">₹{calculation.masterCost}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {calculation.uniqueInkColoursCount === 1
                        ? "Same ink colour across plies (1 Master ₹30)"
                        : `${calculation.uniqueInkColoursCount} unique ink colours (${calculation.uniqueInkColoursCount} Masters)`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Offset Runs ({calculation.totalRuns} runs × {calculation.slabCount} slab × ₹70):
                    </span>
                    <span className="font-bold text-slate-900">₹{calculation.totalOffsetRunCost}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Binding &amp; Finishing:</span>
                    <span className="font-bold text-slate-900">₹{calculation.totalFinishingCost}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block flex items-center gap-1">
                      <FiTruck className="w-3 h-3 text-slate-400" /> Transportation:
                    </span>
                    <span className="font-bold text-slate-900">₹{calculation.transportationCost}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Vendor Cost:</span>
                    <span className="font-extrabold text-slate-900">₹{calculation.totalVendorCost}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200 flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-950">Net Company Profit:</span>
                  <span
                    className={`font-black ${
                      calculation.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    ₹{calculation.netProfit.toLocaleString("en-IN")}
                  </span>
                </div>

                {calculation.isLossMaking && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[10px] font-bold flex items-center gap-1.5 mt-2">
                    <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Warning: Selling price is below vendor production cost!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
