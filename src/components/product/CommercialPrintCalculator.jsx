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
import {
  fetchPaperMastersApi,
  fetchPrintingRatesApi,
  fetchBindingRatesApi,
  fetchFinishingRatesApi,
} from "@/services/api";
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

/**
 * Maximized Guillotine Combination Cutting Optimizer
 * Computes the maximum possible pieces from a raw sheet by testing:
 * 1. Pure vertical layout
 * 2. Pure horizontal layout
 * 3. Horizontal primary split with combination orientations (matching Image 1)
 * 4. Vertical primary split with combination orientations
 */
function calculateSheetCuttingLayout(rawW, rawH, finishedW, finishedH) {
  const sW = Number(rawW);
  const sH = Number(rawH);
  const pW = Number(finishedW);
  const pH = Number(finishedH);

  if (!sW || !sH || !pW || !pH || sW <= 0 || sH <= 0 || pW <= 0 || pH <= 0) {
    return {
      bestYield: 1,
      selectedLayout: "vertical",
      cutType: "single-grid",
      grid: { cols: 1, rows: 1 },
      blocks: [],
      cards: [],
      efficiency: 0,
      cuttingSheetDimensions: { width: sW || 18, height: sH || 22 },
    };
  }

  const eps = 0.001;

  // 1. Pure Vertical Layout on given sheet (sW x sH)
  const vCols = Math.floor((sW + eps) / pW);
  const vRows = Math.floor((sH + eps) / pH);
  const verticalYield = vCols * vRows;

  // 2. Pure Horizontal Layout on given sheet (sW x sH)
  const hCols = Math.floor((sW + eps) / pH);
  const hRows = Math.floor((sH + eps) / pW);
  const horizontalYield = hCols * hRows;

  // Commercial Print Shop Standard Rule: A4 (8.27" x 11.69" ± 0.3") on 18" x 22" quarters into 4 pieces
  const isA4 =
    (Math.abs(pW - 8.27) <= 0.3 && Math.abs(pH - 11.69) <= 0.3) ||
    (Math.abs(pH - 8.27) <= 0.3 && Math.abs(pW - 11.69) <= 0.3);

  // Commercial Print Shop Standard Rule: A5 (5.83" x 8.27" ± 0.3") on 18" x 22" divides into 8 pieces
  const isA5 =
    (Math.abs(pW - 5.83) <= 0.3 && Math.abs(pH - 8.27) <= 0.3) ||
    (Math.abs(pH - 5.83) <= 0.3 && Math.abs(pW - 8.27) <= 0.3);

  const is18x22 = (sW === 18 && sH === 22) || (sW === 22 && sH === 18);

  if (isA4 && is18x22 && 4 * pW * pH <= sW * sH) {
    const cards = [];
    let cNum = 1;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        cards.push({
          num: cNum++,
          dims: `${pW}" × ${pH}"`,
          xPct: ((c * 9) / 18) * 100,
          yPct: ((r * 11) / 22) * 100,
          wPct: (9 / 18) * 100,
          hPct: (11 / 22) * 100,
          orientation: "vertical",
        });
      }
    }
    return {
      bestYield: 4,
      selectedLayout: "vertical",
      cutType: "single-grid",
      grid: { cols: 2, rows: 2 },
      blocks: [
        {
          id: "Block 1",
          label: "A4 Standard Cut (4-Out)",
          count: 4,
          cols: 2,
          rows: 2,
          itemW: 9,
          itemH: 11,
          orientation: "vertical",
          x: 0,
          y: 0,
          width: 18,
          height: 22,
        },
      ],
      cards,
      efficiency: Math.round(((4 * pW * pH) / (sW * sH)) * 1000) / 10,
      cuttingSheetDimensions: { width: 18, height: 22 },
    };
  }

  if (isA5 && is18x22 && 8 * pW * pH <= sW * sH) {
    const isV = pW === 4.5 || pH === 4.5;
    const cols = isV ? 4 : 2;
    const rows = isV ? 2 : 4;
    const itemW = isV ? 4.5 : 5.5;
    const itemH = isV ? 11 : 9;
    const cards = [];
    let cNum = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cards.push({
          num: cNum++,
          dims: `${pW}" × ${pH}"`,
          xPct: ((c * itemW) / 18) * 100,
          yPct: ((r * itemH) / 22) * 100,
          wPct: (itemW / 18) * 100,
          hPct: (itemH / 22) * 100,
          orientation: isV ? "vertical" : "horizontal",
        });
      }
    }
    return {
      bestYield: 8,
      selectedLayout: isV ? "vertical" : "horizontal",
      cutType: "single-grid",
      grid: { cols, rows },
      blocks: [
        {
          id: "Block 1",
          label: "A5 Standard Cut (8-Out)",
          count: 8,
          cols,
          rows,
          itemW,
          itemH,
          orientation: isV ? "vertical" : "horizontal",
          x: 0,
          y: 0,
          width: 18,
          height: 22,
        },
      ],
      cards,
      efficiency: Math.round(((8 * pW * pH) / (sW * sH)) * 1000) / 10,
      cuttingSheetDimensions: { width: 18, height: 22 },
    };
  }

  // 3. Maximized Guillotine Combination Cutting Optimizer
  const isHorizBetter = horizontalYield > verticalYield;
  let best = {
    yield: isHorizBetter ? horizontalYield : verticalYield,
    selectedLayout: isHorizBetter ? "horizontal" : "vertical",
    cutType: "single-grid",
    grid: isHorizBetter ? { cols: hCols, rows: hRows } : { cols: vCols, rows: vRows },
    sheetW: sW,
    sheetH: sH,
    blocks: [
      {
        id: "Block 1",
        label: isHorizBetter ? "Horizontal Grid" : "Vertical Grid",
        count: isHorizBetter ? horizontalYield : verticalYield,
        cols: isHorizBetter ? hCols : vCols,
        rows: isHorizBetter ? hRows : vRows,
        itemW: isHorizBetter ? pH : pW,
        itemH: isHorizBetter ? pW : pH,
        orientation: isHorizBetter ? "horizontal" : "vertical",
        x: 0,
        y: 0,
        width: isHorizBetter ? hCols * pH : vCols * pW,
        height: isHorizBetter ? hRows * pW : vRows * pH,
      },
    ],
  };

  const sheetOrientations = [
    { w: Math.max(sW, sH), h: Math.min(sW, sH) },
    { w: Math.min(sW, sH), h: Math.max(sW, sH) },
  ];

  for (const s of sheetOrientations) {
    const W = s.w;
    const H = s.h;

    for (let orient = 0; orient < 2; orient++) {
      const wA = orient === 0 ? pW : pH;
      const hA = orient === 0 ? pH : pW;
      const wB = hA;
      const hB = wA;

      // Pattern A: Horizontal Primary Cut across W at y = H1
      const maxR1 = Math.floor((H + eps) / hA);
      for (let r1 = 1; r1 <= maxR1; r1++) {
        const H1 = r1 * hA;
        const c1 = Math.floor((W + eps) / wA);
        const count1 = r1 * c1;

        const remH = H - H1;
        const r2 = Math.floor((remH + eps) / hB);
        const c2 = Math.floor((W + eps) / wB);
        const count2 = r2 * c2;

        const total = count1 + count2;
        if (total > best.yield) {
          best = {
            yield: total,
            selectedLayout: count2 > 0 ? "combination" : (orient === 0 ? "vertical" : "horizontal"),
            cutType: count2 > 0 ? "horizontal-split" : "single-grid",
            grid: { cols: Math.max(c1, c2), rows: r1 + r2 },
            sheetW: W,
            sheetH: H,
            blocks: [
              {
                id: "Block 1 (Top)",
                label: `Top: ${count1} Pcs (${orient === 0 ? "Vertical" : "Horizontal"} ${wA}×${hA}")`,
                count: count1,
                cols: c1,
                rows: r1,
                itemW: wA,
                itemH: hA,
                orientation: orient === 0 ? "vertical" : "horizontal",
                x: 0,
                y: 0,
                width: c1 * wA,
                height: H1,
              },
              ...(count2 > 0
                ? [
                    {
                      id: "Block 2 (Bottom)",
                      label: `Bottom: ${count2} Pcs (${orient === 0 ? "Horizontal" : "Vertical"} ${wB}×${hB}")`,
                      count: count2,
                      cols: c2,
                      rows: r2,
                      itemW: wB,
                      itemH: hB,
                      orientation: orient === 0 ? "horizontal" : "vertical",
                      x: 0,
                      y: H1,
                      width: c2 * wB,
                      height: r2 * hB,
                    },
                  ]
                : []),
            ],
          };
        }
      }

      // Pattern B: Vertical Primary Cut down H at x = W1
      const maxC1 = Math.floor((W + eps) / wA);
      for (let c1 = 1; c1 <= maxC1; c1++) {
        const W1 = c1 * wA;
        const r1 = Math.floor((H + eps) / hA);
        const count1 = c1 * r1;

        const remW = W - W1;
        const c2 = Math.floor((remW + eps) / wB);
        const r2 = Math.floor((H + eps) / hB);
        const count2 = c2 * r2;

        const total = count1 + count2;
        if (total > best.yield) {
          best = {
            yield: total,
            selectedLayout: count2 > 0 ? "combination" : (orient === 0 ? "vertical" : "horizontal"),
            cutType: count2 > 0 ? "vertical-split" : "single-grid",
            grid: { cols: c1 + c2, rows: Math.max(r1, r2) },
            sheetW: W,
            sheetH: H,
            blocks: [
              {
                id: "Block 1 (Left)",
                label: `Left: ${count1} Pcs (${orient === 0 ? "Vertical" : "Horizontal"} ${wA}×${hA}")`,
                count: count1,
                cols: c1,
                rows: r1,
                itemW: wA,
                itemH: hA,
                orientation: orient === 0 ? "vertical" : "horizontal",
                x: 0,
                y: 0,
                width: W1,
                height: r1 * hA,
              },
              ...(count2 > 0
                ? [
                    {
                      id: "Block 2 (Right)",
                      label: `Right: ${count2} Pcs (${orient === 0 ? "Horizontal" : "Vertical"} ${wB}×${hB}")`,
                      count: count2,
                      cols: c2,
                      rows: r2,
                      itemW: wB,
                      itemH: hB,
                      orientation: orient === 0 ? "horizontal" : "vertical",
                      x: W1,
                      y: 0,
                      width: c2 * wB,
                      height: r2 * hB,
                    },
                  ]
                : []),
            ],
          };
        }
      }
    }
  }

  // Generate discrete card positions
  const cards = [];
  let cardNum = 1;
  const sheetW = best.sheetW;
  const sheetH = best.sheetH;

  (best.blocks || []).forEach((block) => {
    for (let r = 0; r < block.rows; r++) {
      for (let c = 0; c < block.cols; c++) {
        const x = block.x + c * block.itemW;
        const y = block.y + r * block.itemH;
        cards.push({
          num: cardNum++,
          dims: `${block.itemW}" × ${block.itemH}"`,
          xPct: (x / sheetW) * 100,
          yPct: (y / sheetH) * 100,
          wPct: (block.itemW / sheetW) * 100,
          hPct: (block.itemH / sheetH) * 100,
          orientation: block.orientation,
        });
      }
    }
  });

  const efficiency = Math.round(((best.yield * pW * pH) / (sW * sH)) * 1000) / 10;

  return {
    bestYield: best.yield,
    selectedLayout: best.selectedLayout,
    cutType: best.cutType,
    grid: best.grid,
    blocks: best.blocks,
    cards,
    efficiency,
    cuttingSheetDimensions: {
      width: best.sheetW,
      height: best.sheetH,
    },
  };
}

export default function CommercialPrintCalculator({
  product,
  onVariantSelect,
}) {
  const { addToQuote, clientInfo, updateClientInfo } = useQuote();
  const { isManagerOrAdmin } = useAuth();

  // Backend Paper Inventory & Master Rates
  const [backendSheets, setBackendSheets] = useState([]);
  const [printingRates, setPrintingRates] = useState([]);
  const [bindingRates, setBindingRates] = useState([]);
  const [finishingRates, setFinishingRates] = useState([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(true);

  useEffect(() => {
    async function loadBackendMasters() {
      try {
        setIsLoadingPapers(true);
        const [papersRes, printRes, bindRes, finishRes] = await Promise.allSettled([
          fetchPaperMastersApi(),
          fetchPrintingRatesApi(),
          fetchBindingRatesApi(),
          fetchFinishingRatesApi(),
        ]);

        if (papersRes.status === "fulfilled" && Array.isArray(papersRes.value) && papersRes.value.length > 0) {
          setBackendSheets(papersRes.value);
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
        console.warn("Could not fetch master rates from backend:", err);
      } finally {
        setIsLoadingPapers(false);
      }
    }
    loadBackendMasters();
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
  // All layers (including Layer 1) strictly show only DB sheets matching Layer 1's selected sheet size.
  const getSheetsForLayer = (_layerIndex) => {
    if (!backendSheets || backendSheets.length === 0) return [];
    const targetW = Number(layer1SheetSize.width);
    const targetH = Number(layer1SheetSize.height);
    return backendSheets.filter(
      (b) =>
        (Number(b.rawWidthInch) === targetW && Number(b.rawHeightInch) === targetH) ||
        (Number(b.rawWidthInch) === targetH && Number(b.rawHeightInch) === targetW)
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
      printRequired: true,
      differentDesign: false, // does this ply have different plate text?
    },
    {
      plyIndex: 2,
      colour: "Yellow",
      paperType: "Newspaper",
      gsm: 58,
      inkColour: "Black",
      printRequired: true,
      differentDesign: false,
    },
    {
      plyIndex: 3,
      colour: "Pink",
      paperType: "Newspaper",
      gsm: 58,
      inkColour: "Black",
      printRequired: true,
      differentDesign: false,
    },
    {
      plyIndex: 4,
      colour: "Green",
      paperType: "Newspaper",
      gsm: 58,
      inkColour: "Black",
      printRequired: true,
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

  // Resolve live Master Rates from MongoDB (with safe fallbacks)
  const resolvedBindingOptions = useMemo(() => {
    const codeMap = {
      normal: "BIND_NORMAL_A4",
      stapler: "BIND_STAPLER",
      gumming: "BIND_GUMMING_PAD",
      glue: "BIND_GLUE",
      premium: "BIND_PREMIUM",
    };
    return BINDING_OPTIONS.map((opt) => {
      const code = codeMap[opt.id];
      const dbMatch = bindingRates.find(
        (b) => b.bindingCode === code || b.bindingType?.toLowerCase().includes(opt.id)
      );
      const liveRate = dbMatch?.ratePerUnit ?? dbMatch?.ratePerBook;
      return {
        ...opt,
        rate: liveRate !== undefined ? Number(liveRate) : opt.rate,
      };
    });
  }, [bindingRates]);

  // Active Binding Rate
  const activeBindingObj =
    resolvedBindingOptions.find((b) => b.id === selectedBinding) || resolvedBindingOptions[0];
  const bindingRate = activeBindingObj.rate;

  const liveMasterRates = useMemo(() => {
    const printMap = Object.fromEntries(
      printingRates.map((r) => [r.rateKey, Number(r.rate)])
    );
    const finishMap = Object.fromEntries(
      finishingRates.map((f) => [f.serviceKey, Number(f.ratePerBook)])
    );
    return {
      masterRate: printMap.OFFSET_MASTER_LEGAL ?? 30,
      runRate: printMap.OFFSET_RUN_PER_1000 ?? 70,
      numberingRate: finishMap.FINISH_NUMBERING ?? finishMap.FINISH_NUMBERING_PER_BOOK ?? 2,
      punchingRate: finishMap.FINISH_PUNCHING ?? 2,
      transportationRate:
        finishMap.FINISH_TRANSPORTATION ??
        printMap.TRANSPORTATION_COST ??
        50,
    };
  }, [printingRates, finishingRates]);

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

    // Use Maximized Guillotine Combination Cutting Optimizer
    const cutting = calculateSheetCuttingLayout(rawW, rawH, finishedW, finishedH);
    const bestYield = cutting.bestYield;
    const selectedLayout = cutting.selectedLayout;
    const grid = cutting.grid;
    const blocks = cutting.blocks;
    const cards = cutting.cards;
    const efficiency = cutting.efficiency;
    const cuttingSheetDimensions = cutting.cuttingSheetDimensions;
    const cutType = cutting.cutType;

    // 2. Paper Requirements & Costs (Approved Wastage & Ream/Loose Rule)
    // - Sum NET sheets per normalized paper group within the order
    // - Apply wastage ONCE per paper group: 0 -> 0, <500 -> +5, >=500 -> flat +10
    // - Full 500 sheets = Reams @ reamRate; Remainder = Loose @ loosePrice
    const totalPagesPerPly = qty * pages; // e.g. 10 books * 100 pages = 1000 sheets
    const netRawSheets = totalPagesPerPly === 0 ? 0 : Math.ceil(totalPagesPerPly / bestYield);

    // Group active plies by exact normalized paper identity
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

      const normType = (ply.paperType || "Maplitho").trim().replace(/\s+/g, " ");
      const normColour = (ply.colour || "White").trim().replace(/\s+/g, " ");
      const paperKey = `${rawW}x${rawH}|${normType.toLowerCase()}|${Number(ply.gsm) || 70}|${normColour.toLowerCase()}`;

      if (!paperGroups.has(paperKey)) {
        paperGroups.set(paperKey, {
          paperKey,
          label: `${normType} ${ply.gsm} GSM ${normColour}`,
          paperType: normType,
          gsm: Number(ply.gsm) || 70,
          colour: normColour,
          loosePrice,
          reamRate,
          matchingSheet,
          netSheets: 0,
          wastage: 0,
          totalSheets: 0,
          pliesCount: 0,
        });
      }

      const grp = paperGroups.get(paperKey);
      grp.netSheets += netRawSheets;
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
        wastage: 0,
        grossRawSheets: netRawSheets,
      };
    });

    // Apply wastage ONCE per paper group (0 -> 0, <500 -> +5, >=500 -> flat +10), then compute Ream + Loose cost
    let totalPaperCost = 0;
    const paperPurchasingBreakdown = [];

    paperGroups.forEach((grp) => {
      const groupWastage = grp.netSheets === 0 ? 0 : grp.netSheets >= 500 ? 10 : 5;
      const groupGross = grp.netSheets + groupWastage;
      const fullReams = Math.floor(groupGross / 500);
      const remainingLooseSheets = groupGross % 500;
      const reamsCost = fullReams * grp.reamRate;
      const looseCost = remainingLooseSheets * grp.loosePrice;
      const groupCost = Math.round(reamsCost + looseCost);

      grp.wastage = groupWastage;
      grp.totalSheets = groupGross;
      totalPaperCost += groupCost;

      paperPurchasingBreakdown.push({
        ...grp,
        wastage: groupWastage,
        totalSheets: groupGross,
        fullReams,
        remainingLooseSheets,
        reamsCost,
        looseCost,
        groupCost,
      });
    });

    // Allocate cost & wastage share to each ply calculation
    const plyCalculations = resolvedPlies.map((p) => {
      const grp = paperPurchasingBreakdown.find((g) => g.paperKey === p.paperKey);
      const isSingle = !grp || grp.pliesCount === 1;
      const plyWastage = isSingle ? (grp?.wastage ?? 0) : Number((grp.wastage / grp.pliesCount).toFixed(2));
      const plyGross = isSingle ? (grp?.totalSheets ?? p.netRawSheets) : p.netRawSheets + plyWastage;
      const plyCostShare =
        grp && grp.pliesCount > 0
          ? Math.round(grp.groupCost / grp.pliesCount)
          : Math.round(p.netRawSheets * p.loosePrice);

      return {
        ...p,
        wastage: plyWastage,
        grossRawSheets: plyGross,
        plyPaperCost: plyCostShare,
      };
    });

    // 3. Mini Offset Machine Printing Slabs (Live Master Rate per 1,000 sheets per run)
    const printedPlies = activePlies.filter((p) => p.printRequired !== false);
    const printedPliesCount = printedPlies.length;
    const slabCount = printedPliesCount > 0 ? Math.max(1, Math.ceil(totalPagesPerPly / 1000)) : 0;
    const sidesCount = printSides === "both" ? 2 : 1;
    const totalRuns = printedPliesCount * sidesCount;
    const runRate = liveMasterRates.runRate;
    const totalOffsetRunCost = totalRuns * slabCount * runRate;

    // 4. Master Plates (Live Master Rate per unique plate / ink colour / design)
    const uniqueFrontMasters = new Set();
    const uniqueInkColoursSet = new Set();

    printedPlies.forEach((p, idx) => {
      const ink = (p.inkColour || "Black").trim().toUpperCase();
      uniqueInkColoursSet.add(ink);
      const designTag = idx > 0 && p.differentDesign ? `DIFF_DESIGN_${idx + 1}` : "COMMON_DESIGN";
      uniqueFrontMasters.add(`${designTag}_${ink}`);
    });

    let masterCount = uniqueFrontMasters.size;
    if (printSides === "both" && printedPliesCount > 0) {
      masterCount += 1; // +1 back master plate
    }
    const masterRate = liveMasterRates.masterRate;
    const masterCost = masterCount * masterRate;
    const uniqueInkColoursCount = uniqueInkColoursSet.size;

    // 5. Binding & Finishing (Live Master Rates)
    const bindingCost = qty * bindingRate;
    const numberingCost = hasNumbering ? qty * liveMasterRates.numberingRate : 0;
    const punchingCost = hasPunching ? qty * liveMasterRates.punchingRate : 0;
    const totalFinishingCost = bindingCost + numberingCost + punchingCost;

    // 6. Transportation Cost (Live Master Rate)
    const transportationCost = liveMasterRates.transportationRate;

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

    const totalWastageSheets = paperPurchasingBreakdown.reduce(
      (sum, g) => sum + (g.wastage || 0),
      0
    );
    const totalNetRawSheetsAllPlies = netRawSheets * plyCount;
    const totalGrossRawSheetsAllPlies = totalNetRawSheetsAllPlies + totalWastageSheets;
    const wastage = totalWastageSheets;
    const grossRawSheets = netRawSheets + (paperPurchasingBreakdown[0]?.wastage ?? 0);

    return {
      qty,
      pages,
      totalPagesPerPly,
      optimalRawSheet,
      bestYield,
      selectedLayout,
      cutType,
      grid,
      blocks,
      cards,
      efficiency,
      cuttingSheetDimensions,
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
      masterRate,
      runRate,
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
    liveMasterRates,
  ]);

  // Handle Add to Quotation Cart
  const handleAddToQuote = () => {
    const plySummaryStr = calculation.plyCalculations
      .map((p, idx) => `Layer ${idx + 1}: ${p.colour} (${p.paperType || "Paper"}, ${p.gsm} GSM)`)
      .join(" | ");

    addToQuote(
      {
        id: `billbook-${Date.now()}`,
        code: product?.code || "BB-001",
        name: `${productType} (${plyCount}-Ply)`,
        slug: product?.slug || "bill-books",
        category: "commercial-printing",
        image: product?.image || "",
        unitName: "Books",
      },
      {
        size: `${finishedW}" × ${finishedH}"`,
        pagesPerBook: `${calculation.pages} Sets`,
        plies: `${plyCount} Ply`,
        plySummary: plySummaryStr,
        printingSides: printSides === "both" ? "Both Sides (Front & Back)" : "Front Side Only",
        binding: activeBindingObj.name,
        numbering: calculation.numberingRange,
        punching: hasPunching ? "Included" : "None",
      },
      calculation.qty,
      {
        subtotal: calculation.finalSellingPrice,
        gstAmount: 0,
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
                            const nextGsm =
                              !validGsms.includes(Number(ply.gsm)) && validGsms.length > 0
                                ? validGsms[0]
                                : Number(ply.gsm);
                            if (nextGsm !== Number(ply.gsm)) {
                              handleUpdatePly(idx, "gsm", nextGsm);
                            }
                            if (!isLayerOne) {
                              const validColours = getColoursForLayerTypeAndGsm(idx, newType, nextGsm);
                              if (validColours.length > 0 && !validColours.includes(ply.colour)) {
                                handleUpdatePly(idx, "colour", validColours[0]);
                              }
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
                          onChange={(e) => {
                            const newGsm = Number(e.target.value);
                            handleUpdatePly(idx, "gsm", newGsm);
                            if (!isLayerOne) {
                              const validColours = getColoursForLayerTypeAndGsm(idx, ply.paperType, newGsm);
                              if (validColours.length > 0 && !validColours.includes(ply.colour)) {
                                handleUpdatePly(idx, "colour", validColours[0]);
                              }
                            }
                          }}
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
                          disabled={ply.printRequired === false}
                          onChange={(e) => handleUpdatePly(idx, "inkColour", e.target.value)}
                          className={`w-full text-xs border border-slate-300 rounded-lg p-1.5 font-medium ${
                            ply.printRequired === false
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-white"
                          }`}
                        >
                          <option value="Black">Black Ink</option>
                          <option value="Red">Red Ink</option>
                          <option value="Blue">Blue Ink</option>
                          <option value="Green">Green Ink</option>
                        </select>
                        {ply.printRequired === false ? (
                          <span className="text-[9px] block mt-1 font-semibold text-slate-500 leading-tight">
                            No Print (Blank Sheet — ₹0 Printing)
                          </span>
                        ) : idx > 0 ? (
                          <span className="text-[9px] block mt-1 font-semibold leading-tight">
                            {(ply.inkColour || "Black").toLowerCase() === (plyConfigs[0]?.inkColour || "Black").toLowerCase() ? (
                              <span className="text-emerald-700">✓ Same ink as Layer 1 (Shares Master Plate ₹{calculation.masterRate})</span>
                            ) : (
                              <span className="text-amber-800 font-bold">⚡ Different ink (+₹{calculation.masterRate} Master Plate)</span>
                            )}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Print Required Toggle + Master Plate Checkbox */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={ply.printRequired !== false}
                          onChange={(e) => handleUpdatePly(idx, "printRequired", e.target.checked)}
                          className="w-3.5 h-3.5 text-orange-600 rounded"
                        />
                        <span>
                          Print Required on Layer {idx + 1}{" "}
                          {ply.printRequired === false && (
                            <span className="text-[10px] font-bold text-slate-500">(Blank / No Print)</span>
                          )}
                        </span>
                      </label>

                      {!isLayerOne && ply.printRequired !== false && (
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-600">
                          <input
                            type="checkbox"
                            checked={ply.differentDesign}
                            onChange={(e) => handleUpdatePly(idx, "differentDesign", e.target.checked)}
                            className="w-3.5 h-3.5 text-orange-600 rounded"
                          />
                          <span>Different text/design than Layer 1</span>
                        </label>
                      )}
                    </div>
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
                {resolvedBindingOptions.map((bind) => {
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

              <div className="p-4 bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-slate-800 space-y-3">
                <div className="text-center space-y-1">
                  <div className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 flex-wrap">
                    <span>
                      Best Cut: {calculation.cuttingSheetDimensions?.width || rawW}" × {calculation.cuttingSheetDimensions?.height || rawH}"
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-extrabold uppercase ${
                        calculation.selectedLayout === "combination"
                          ? "bg-purple-900/80 text-purple-300 border border-purple-700"
                          : "bg-orange-950 text-orange-400 border border-orange-800"
                      }`}
                    >
                      {calculation.selectedLayout === "combination"
                        ? "Combination Layout"
                        : `${calculation.selectedLayout} layout`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Maximized Yield: <strong className="text-orange-400 font-bold">{calculation.bestYield} Pcs / Sheet</strong> ({calculation.efficiency || 0}% Sheet Utilization)
                  </div>
                </div>

                {/* Proportional Sheet Cutting Visualizer matching Image 1 */}
                <div className="w-full max-w-sm bg-slate-900/90 rounded-xl p-3 border border-slate-800 relative">
                  {/* Sheet Dimension Header */}
                  <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 mb-1 px-1">
                    <span>↔ Width: {calculation.cuttingSheetDimensions?.width || rawW} Inch</span>
                    <span>↕ Height: {calculation.cuttingSheetDimensions?.height || rawH} Inch</span>
                  </div>

                  {/* Proportional Sheet Canvas Area */}
                  <div
                    className="relative w-full bg-[#111c33] rounded-lg border-2 border-dashed border-slate-600 overflow-hidden shadow-inner my-1"
                    style={{
                      aspectRatio: `${(calculation.cuttingSheetDimensions?.width || rawW) / (calculation.cuttingSheetDimensions?.height || rawH)}`,
                      minHeight: "180px",
                      maxHeight: "260px",
                    }}
                  >
                    {/* Rendered Individual Cards */}
                    {(calculation.cards || []).map((card) => (
                      <div
                        key={card.num}
                        className={`absolute border rounded flex flex-col items-center justify-center p-0.5 transition-all shadow-xs overflow-hidden ${
                          card.orientation === "vertical"
                            ? "bg-emerald-900/60 border-emerald-500/80 text-emerald-300"
                            : "bg-sky-900/60 border-sky-500/80 text-sky-300"
                        }`}
                        style={{
                          left: `${card.xPct}%`,
                          top: `${card.yPct}%`,
                          width: `${card.wPct}%`,
                          height: `${card.hPct}%`,
                        }}
                      >
                        <span className="text-[10px] sm:text-xs font-black font-mono leading-tight">
                          Card #{card.num}
                        </span>
                        <span className="text-[8px] sm:text-[9px] opacity-85 font-mono leading-none mt-0.5 whitespace-nowrap">
                          {card.dims}
                        </span>
                      </div>
                    ))}

                    {/* Unused Waste Watermark Indicator */}
                    <div className="absolute right-1 bottom-1 text-[8px] text-amber-500/70 font-mono uppercase tracking-wider pointer-events-none select-none bg-black/60 px-1.5 py-0.5 rounded border border-amber-900/40">
                      Offcut / Waste
                    </div>
                  </div>

                  {/* Block / Section Legend */}
                  {calculation.blocks && calculation.blocks.length > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-[10px]">
                      {calculation.blocks.map((b, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-xs border ${
                              b.orientation === "vertical"
                                ? "bg-emerald-500/40 border-emerald-400"
                                : "bg-sky-500/40 border-sky-400"
                            }`}
                          />
                          <span className="text-slate-300">
                            {b.id}: <strong>{b.count} Pcs</strong> ({b.itemW}" × {b.itemH}")
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Finished Size: <strong>{finishedW}" × {finishedH}"</strong></span>
                  <span>•</span>
                  <span>Zero Cutting Margin</span>
                </div>
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
                    <span className="text-slate-500 block">Master Plates ({calculation.masterCount} × ₹{calculation.masterRate}):</span>
                    <span className="font-bold text-slate-900">₹{calculation.masterCost}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {calculation.uniqueInkColoursCount === 1
                        ? `Same ink colour across plies (1 Master ₹${calculation.masterRate})`
                        : `${calculation.uniqueInkColoursCount} unique ink colours (${calculation.uniqueInkColoursCount} Masters)`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">
                      Offset Runs ({calculation.totalRuns} runs × {calculation.slabCount} slab × ₹{calculation.runRate}):
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
