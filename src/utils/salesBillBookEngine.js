/**
 * Salesperson Bill Book Calculation Engine
 * 
 * Rules & Requirements:
 * 1. Fixed Sheet Rules: Finished book sizes (A4, A5, 4.5"x11", Legal, 1/6 Demy, 1/8 Demy)
 *    are automatically mapped to standard raw sheets (18x22, 23x36) and pre-calibrated yields.
 * 2. Salespersons do NOT need to manually select raw sheets or calculate cutting layouts.
 * 3. Dynamic Master Data: Fetches live paper rates (loose & ream), GSMs, paper types,
 *    and colours from Admin Masters.
 * 4. Wastage Sheets: Every layer adds 5 sheets extra for cutting margin and includes its cost.
 * 5. Transparent Sales Quotation: Produces clear customer pricing (per book & total order)
 *    without exposing sensitive internal supplier details.
 */

// ============================================================================
// 1. FIXED BOOK SIZE TO RAW SHEET RULES
// Includes all 13 standard commercial sizes requested:
// A4, A5, A6, Letter, Half Letter, Legal, 1/4, 1/5, 1/6, 1/8, 1/10, 1/12, 1/16
// ============================================================================
export const SALES_BOOK_SIZE_RULES = [
  // --- A-Series (ISO Standard) ---
  {
    id: "a4",
    name: "A4",
    dimensions: '8.27" × 11.69"',
    widthInch: 8.27,
    heightInch: 11.69,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 4, // 4 finished pages per 18x22 raw sheet
    group: "ISO A-Series",
    tag: "Office Invoice",
    description: "Standard Office Invoice & Order Book (4 out of 18×22 Sheet)",
    popular: true,
  },
  {
    id: "a5",
    name: "A5",
    dimensions: '5.83" × 8.27"',
    widthInch: 5.83,
    heightInch: 8.27,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 8, // 8 finished pages per 18x22 raw sheet
    group: "ISO A-Series",
    tag: "Cash Memo",
    description: "Standard Retail Cash Memo & Receipt Book (8 out of 18×22 Sheet)",
    popular: true,
  },
  {
    id: "a6",
    name: "A6",
    dimensions: '4.13" × 5.83"',
    widthInch: 4.13,
    heightInch: 5.83,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 16, // 16 finished pages per 18x22 raw sheet
    group: "ISO A-Series",
    tag: "Pocket Slip / Token",
    description: "Pocket Receipt, Delivery Slip & Token Book (16 out of 18×22 Sheet)",
    popular: false,
  },

  // --- Office & US Standard ---
  {
    id: "letter",
    name: "Letter",
    dimensions: '8.50" × 11.00"',
    widthInch: 8.5,
    heightInch: 11.0,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 4, // 4 finished pages per 18x22 raw sheet
    group: "Office & Letter",
    tag: "US Letter Invoice",
    description: "US Letter Format Corporate Invoice Book (4 out of 18×22 Sheet)",
    popular: true,
  },
  {
    id: "half-letter",
    name: "Half Letter",
    dimensions: '5.50" × 8.50"',
    widthInch: 5.5,
    heightInch: 8.5,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 8, // 8 finished pages per 18x22 raw sheet
    group: "Office & Letter",
    tag: "Half Letter Memo",
    description: "Half Letter Memo & Counter Voucher Book (8 out of 18×22 Sheet)",
    popular: false,
  },
  {
    id: "legal",
    name: "Legal",
    dimensions: '8.50" × 14.00"',
    widthInch: 8.5,
    heightInch: 14.0,
    rawSheetWidth: 23,
    rawSheetHeight: 36,
    yieldPerSheet: 6, // 6 finished pages per 23x36 raw sheet (combination layout)
    group: "Office & Letter",
    tag: "Legal Agreement",
    description: "Full Size Agreement & Advocate Form Book (6 out of 23×36 Sheet)",
    popular: true,
  },

  // --- Fractional Demy Press Cuts ---
  {
    id: "1-4",
    name: "1/4",
    dimensions: '8.50" × 10.50"',
    widthInch: 8.5,
    heightInch: 10.5,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 4, // 4 finished pages per 18x22 raw sheet
    group: "Fractional Demy",
    tag: "1/4th Demy Book",
    description: "Quarter Demy Commercial Ledger & Invoice Book (4 out of 18×22 Sheet)",
    popular: true,
  },
  {
    id: "1-5",
    name: "1/5",
    dimensions: '6.00" × 7.90"',
    widthInch: 6.0,
    heightInch: 7.9,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 6, // 6 finished pages per 18x22 raw sheet
    group: "Fractional Demy",
    tag: "1/5th Demy Slip",
    description: "Fifth Demy Delivery & Estimate Book (6 out of 18×22 Sheet)",
    popular: false,
  },
  {
    id: "1-6",
    name: "1/6",
    dimensions: '7.00" × 8.50"',
    widthInch: 7.0,
    heightInch: 8.5,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 6, // 6 finished pages per 18x22 raw sheet
    group: "Fractional Demy",
    tag: "1/6th Demy Slip",
    description: "Sixth Demy Service & Gate Pass Book (6 out of 18×22 Sheet)",
    popular: false,
  },
  {
    id: "1-8",
    name: "1/8",
    dimensions: '5.50" × 7.00"',
    widthInch: 5.5,
    heightInch: 7.0,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 8, // 8 finished pages per 18x22 raw sheet
    group: "Fractional Demy",
    tag: "1/8th Demy Standard",
    description: "Traditional 1/8 Demy Retail Counter Bill Book (8 out of 18×22 Sheet)",
    popular: true,
  },
  {
    id: "1-10",
    name: "1/10",
    dimensions: '3.60" × 6.00"',
    widthInch: 3.6,
    heightInch: 6.0,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 10, // 10 finished pages per 18x22 raw sheet
    group: "Fractional Demy",
    tag: "1/10th Demy Memo",
    description: "Compact 1/10 Demy Cash Slip & Token Book (10 out of 18×22 Sheet)",
    popular: false,
  },
  {
    id: "1-12",
    name: "1/12",
    dimensions: '4.13" × 7.09"',
    widthInch: 4.13,
    heightInch: 7.09,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 12, // 12 finished pages per 18x22 raw sheet
    group: "Fractional Demy",
    tag: "1/12th Demy Challan",
    description: "Slim 1/12 Demy Delivery Challan Book (12 out of 18×22 Sheet)",
    popular: false,
  },
  {
    id: "1-16",
    name: "1/16",
    dimensions: '4.13" × 5.12"',
    widthInch: 4.13,
    heightInch: 5.12,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 16, // 16 finished pages per 18x22 raw sheet
    group: "Fractional Demy",
    tag: "1/16th Demy Token",
    description: "Mini 1/16 Demy Token & Coupon Book (16 out of 18×22 Sheet)",
    popular: false,
  },
  // Compatibility alias for traditional 4.5x11
  {
    id: "4.5x11",
    name: '4.5" × 11"',
    dimensions: '4.50" × 11.00"',
    widthInch: 4.5,
    heightInch: 11.0,
    rawSheetWidth: 18,
    rawSheetHeight: 22,
    yieldPerSheet: 8,
    group: "Specialty",
    tag: "Slim Counter Book",
    description: "Slim Counter Bill Book (8 out of 18×22 Sheet)",
    popular: false,
  },
];

// ============================================================================
// 2. STANDARD DEFAULT RATES (Used if server data is offline or initializing)
// ============================================================================
export const DEFAULT_PAPER_MASTERS = [
  // 18x22 Papers
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Newspaper", gsm: 58, colour: "White", looseSheetRate: 1.20, reamRate: 520 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Newspaper", gsm: 58, colour: "Yellow", looseSheetRate: 1.25, reamRate: 545 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Newspaper", gsm: 58, colour: "Pink", looseSheetRate: 1.25, reamRate: 545 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "White", looseSheetRate: 1.50, reamRate: 700 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "Yellow", looseSheetRate: 1.55, reamRate: 725 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "Pink", looseSheetRate: 1.55, reamRate: 725 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "Blue", looseSheetRate: 1.55, reamRate: 725 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Bond", gsm: 70, colour: "White", looseSheetRate: 2.10, reamRate: 950 },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Bond", gsm: 80, colour: "White", looseSheetRate: 2.40, reamRate: 1100 },
  // 23x36 Papers
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 70, colour: "White", looseSheetRate: 3.10, reamRate: 1400 },
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 70, colour: "Yellow", looseSheetRate: 3.15, reamRate: 1425 },
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 70, colour: "Pink", looseSheetRate: 3.15, reamRate: 1425 },
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 80, colour: "White", looseSheetRate: 3.50, reamRate: 1600 },
];

export const SALES_BINDING_OPTIONS = [
  {
    id: "normal",
    name: "Normal Binding (Gatta + Cover + Tape)",
    description: "Hardboard back gatta, cover page, cloth tape spine with heavy wire stitching",
    ratePerBook: 25,
    tag: "Most Popular",
  },
  {
    id: "stapler",
    name: "Stapler / Wire Stitch Binding",
    description: "Simple economy stapler bind with light kraft paper cover",
    ratePerBook: 12,
    tag: "Economy",
  },
  {
    id: "gumming",
    name: "Top Gumming Pad (Tear-off Writing Pad)",
    description: "Pressure sensitive top glued spine for smooth tear-off sheets",
    ratePerBook: 10,
    tag: "Pads / Slip",
  },
  {
    id: "hardbound",
    name: "Hardbound Register (Rexine Spine)",
    description: "Heavy millboard bound with golden foil printing & leatherette/rexine spine",
    ratePerBook: 45,
    tag: "Heavy Duty",
  },
  {
    id: "spiral",
    name: "Spiral / Wire-O Bound",
    description: "360-degree lay-flat plastic or metal wire-o binding",
    ratePerBook: 30,
    tag: "Specialty",
  },
];

// ============================================================================
// 3. MASTER DATA QUERY HELPERS
// ============================================================================

/**
 * Compute cutting yield for a raw sheet (sW x sH) and finished product (pW x pH)
 * Aligned with backend calculateCuttingYield() in printingCalcEngine.js
 */
export function computeCuttingYieldForSheet(sheetW, sheetH, productW, productH) {
  const sW = Number(sheetW);
  const sH = Number(sheetH);
  const pW = Number(productW);
  const pH = Number(productH);
  if (!sW || !sH || !pW || !pH || sW <= 0 || sH <= 0 || pW <= 0 || pH <= 0) {
    return { bestYield: 0, selectedLayout: "none" };
  }
  const eps = 0.05;
  const isA4 =
    (Math.abs(pW - 8.27) <= 0.3 && Math.abs(pH - 11.69) <= 0.3) ||
    (Math.abs(pH - 8.27) <= 0.3 && Math.abs(pW - 11.69) <= 0.3);
  const isA5 =
    (Math.abs(pW - 5.83) <= 0.3 && Math.abs(pH - 8.27) <= 0.3) ||
    (Math.abs(pH - 5.83) <= 0.3 && Math.abs(pW - 8.27) <= 0.3);
  const is18x22 = (sW === 18 && sH === 22) || (sW === 22 && sH === 18);

  if (isA4 && is18x22 && 4 * pW * pH <= sW * sH) {
    return { bestYield: 4, selectedLayout: "vertical" };
  }
  if (isA5 && is18x22 && 8 * pW * pH <= sW * sH) {
    return { bestYield: 8, selectedLayout: pW === 4.5 || pH === 4.5 ? "vertical" : "horizontal" };
  }

  let bestYield = 0;
  let selectedLayout = "vertical";

  const orientations = [
    [sW, sH],
    [sH, sW],
  ];
  orientations.forEach(([W, H]) => {
    for (let orient = 0; orient < 2; orient++) {
      const wA = orient === 0 ? pW : pH;
      const hA = orient === 0 ? pH : pW;
      const wB = orient === 0 ? pH : pW;
      const hB = orient === 0 ? pW : pH;

      const maxRows1 = Math.floor((H + eps) / hA);
      for (let r1 = 1; r1 <= maxRows1; r1++) {
        const H1 = r1 * hA;
        const c1 = Math.floor((W + eps) / wA);
        const count1 = c1 * r1;
        const remH = H - H1;
        const c2 = Math.floor((W + eps) / wB);
        const r2 = Math.floor((remH + eps) / hB);
        const total = count1 + c2 * r2;
        if (total > bestYield) {
          bestYield = total;
          selectedLayout = c2 * r2 > 0 ? "combination" : orient === 0 ? "vertical" : "horizontal";
        }
      }

      const maxCols1 = Math.floor((W + eps) / wA);
      for (let c1 = 1; c1 <= maxCols1; c1++) {
        const W1 = c1 * wA;
        const r1 = Math.floor((H + eps) / hA);
        const count1 = c1 * r1;
        const remW = W - W1;
        const c2 = Math.floor((remW + eps) / wB);
        const r2 = Math.floor((H + eps) / hB);
        const total = count1 + c2 * r2;
        if (total > bestYield) {
          bestYield = total;
          selectedLayout = c2 * r2 > 0 ? "combination" : orient === 0 ? "vertical" : "horizontal";
        }
      }
    }
  });

  return { bestYield, selectedLayout };
}

/**
 * Automatically pick the least-wastage raw sheet from the database PaperMaster list
 * based on finished book width & height.
 */
export function selectLeastWastageSheetFromDb(
  papers = [],
  finishedW,
  finishedH,
  fallbackRule = null
) {
  const pW = Number(finishedW) || 8.27;
  const pH = Number(finishedH) || 11.69;
  const sourceList =
    Array.isArray(papers) && papers.length > 0 ? papers : DEFAULT_PAPER_MASTERS;

  const uniqueSizes = new Map();
  sourceList.forEach((p) => {
    const sW = Number(p.rawWidthInch || p.rawSheetWidth || 0);
    const sH = Number(p.rawHeightInch || p.rawSheetHeight || 0);
    if (!sW || !sH) return;
    const key = `${Math.min(sW, sH)}x${Math.max(sW, sH)}`;
    if (!uniqueSizes.has(key)) {
      uniqueSizes.set(key, {
        rawWidthInch: sW,
        rawHeightInch: sH,
        looseSheetRate: Number(p.looseSheetRate ?? p.currentRate?.looseRatePerSheet ?? 1.5),
      });
    }
  });

  let best = null;
  let minWaste = Infinity;
  let maxYield = -1;

  uniqueSizes.forEach((s) => {
    const cut = computeCuttingYieldForSheet(s.rawWidthInch, s.rawHeightInch, pW, pH);
    if (cut.bestYield <= 0) return;
    const sheetArea = s.rawWidthInch * s.rawHeightInch;
    const usedArea = cut.bestYield * pW * pH;
    const wasteRatio = sheetArea > 0 ? Math.max(0, (sheetArea - usedArea) / sheetArea) : 1;

    if (
      wasteRatio < minWaste - 0.001 ||
      (Math.abs(wasteRatio - minWaste) <= 0.001 && cut.bestYield > maxYield)
    ) {
      minWaste = wasteRatio;
      maxYield = cut.bestYield;
      best = {
        rawWidthInch: s.rawWidthInch,
        rawHeightInch: s.rawHeightInch,
        yieldPerSheet: cut.bestYield,
        selectedLayout: cut.selectedLayout,
        wastePercent: Math.round(wasteRatio * 1000) / 10,
        efficiencyPercent: Math.round((1 - wasteRatio) * 1000) / 10,
      };
    }
  });

  if (best) return best;
  return {
    rawWidthInch: fallbackRule?.rawSheetWidth || 18,
    rawHeightInch: fallbackRule?.rawSheetHeight || 22,
    yieldPerSheet: fallbackRule?.yieldPerSheet || 4,
    selectedLayout: "vertical",
    wastePercent: 0,
    efficiencyPercent: 100,
  };
}

/**
 * Filter paper records for a specific book size rule's raw sheet
 */
export function getPapersForSizeRule(papers = [], sizeRule) {
  const masterList = Array.isArray(papers) && papers.length > 0 ? papers : DEFAULT_PAPER_MASTERS;
  const targetW = sizeRule.rawSheetWidth;
  const targetH = sizeRule.rawSheetHeight;

  const filtered = masterList.filter((p) => {
    const pw = Number(p.rawWidthInch || p.rawSheetWidth || 0);
    const ph = Number(p.rawHeightInch || p.rawSheetHeight || 0);
    return (
      (pw === targetW && ph === targetH) ||
      (pw === targetH && ph === targetW)
    );
  });

  return filtered.length > 0 ? filtered : masterList;
}

/**
 * Extract unique available paper types for a size rule
 */
export function getAvailablePaperTypes(papersForSize = []) {
  const types = new Set();
  papersForSize.forEach((p) => {
    if (p.paperType) types.add(p.paperType);
  });
  if (types.size === 0) return ["Maplitho", "Newspaper", "Bond"];
  return Array.from(types);
}

/**
 * Extract available GSM values for selected paper type
 */
export function getAvailableGsms(papersForSize = [], paperType = "Maplitho") {
  const gsms = new Set();
  papersForSize
    .filter((p) => !paperType || p.paperType === paperType)
    .forEach((p) => {
      if (p.gsm) gsms.add(Number(p.gsm));
    });
  if (gsms.size === 0) return [58, 64, 70, 80];
  return Array.from(gsms).sort((a, b) => a - b);
}

/**
 * Extract available colours for selected paper type and GSM
 */
export function getAvailableColours(papersForSize = [], paperType = "Maplitho", gsm = 70) {
  const colours = new Set();
  papersForSize
    .filter(
      (p) =>
        (!paperType || p.paperType === paperType) &&
        (!gsm || Number(p.gsm) === Number(gsm))
    )
    .forEach((p) => {
      if (p.colour) colours.add(p.colour);
    });
  if (colours.size === 0) return ["White", "Yellow", "Pink", "Blue"];
  return Array.from(colours);
}

/**
 * Match exact paper master from database and resolve looseSheetRate & reamRate
 */
export function resolvePaperRates(papers = [], targetW, targetH, paperType, gsm, colour) {
  const hasDbPapers = Array.isArray(papers) && papers.length > 0;
  const masterList = hasDbPapers ? papers : DEFAULT_PAPER_MASTERS;

  const isTypeMatch = (pType, targetType) =>
    !targetType ||
    (pType &&
      (pType.toLowerCase() === targetType.toLowerCase() ||
        (/news/i.test(pType) && /news/i.test(targetType))));

  // 1. Try exact 5-point match (Width, Height, Type, GSM, Colour)
  let match = masterList.find((p) => {
    const pw = Number(p.rawWidthInch || p.rawSheetWidth || 0);
    const ph = Number(p.rawHeightInch || p.rawSheetHeight || 0);
    const matchesSize =
      (pw === targetW && ph === targetH) || (pw === targetH && ph === targetW);
    const matchesType = isTypeMatch(p.paperType, paperType);
    const matchesGsm = !gsm || Number(p.gsm) === Number(gsm);
    const matchesColour = !colour || (p.colour && p.colour.toLowerCase() === colour.toLowerCase());
    return matchesSize && matchesType && matchesGsm && matchesColour;
  });

  // 2. Try match without colour (same size, type, GSM)
  if (!match) {
    match = masterList.find((p) => {
      const pw = Number(p.rawWidthInch || p.rawSheetWidth || 0);
      const ph = Number(p.rawHeightInch || p.rawSheetHeight || 0);
      const matchesSize =
        (pw === targetW && ph === targetH) || (pw === targetH && ph === targetW);
      const matchesType = isTypeMatch(p.paperType, paperType);
      const matchesGsm = !gsm || Number(p.gsm) === Number(gsm);
      return matchesSize && matchesType && matchesGsm;
    });
  }

  // 3. Try match by size + type (nearest GSM in DB) before ever touching defaults
  if (!match) {
    match = masterList.find((p) => {
      const pw = Number(p.rawWidthInch || p.rawSheetWidth || 0);
      const ph = Number(p.rawHeightInch || p.rawSheetHeight || 0);
      const matchesSize =
        (pw === targetW && ph === targetH) || (pw === targetH && ph === targetW);
      return matchesSize && isTypeMatch(p.paperType, paperType);
    });
  }

  // 4. Only if DB list is empty/offline, use DEFAULT_PAPER_MASTERS
  if (!match) {
    match = hasDbPapers ? masterList[0] : DEFAULT_PAPER_MASTERS[0];
  }

  const dbLoose =
    match.looseSheetRate !== undefined && Number(match.looseSheetRate) > 0
      ? Number(match.looseSheetRate)
      : Number(match.currentRate?.looseRatePerSheet ?? match.activeRate?.looseSheetRate ?? 0);
  const dbReam =
    match.reamRate !== undefined && Number(match.reamRate) > 0
      ? Number(match.reamRate)
      : Number(match.currentRate?.reamRate ?? match.activeRate?.reamRate ?? 0);

  const looseRate = dbLoose > 0 ? dbLoose : (dbReam > 0 ? (dbReam / 500) * 1.1 : 0);
  const reamRate = dbReam > 0 ? dbReam : (dbLoose > 0 ? dbLoose * 500 * 0.9 : 0);

  return {
    looseSheetRate: Number(looseRate.toFixed(2)),
    reamRate: Number(reamRate.toFixed(2)),
    code: match.code || `PAP-${targetW}${targetH}-${gsm || match.gsm || 70}`,
    foundInDb: Boolean(match._id),
  };
}

// ============================================================================
// 4. MAIN SALES BILL BOOK CALCULATION SYSTEM
// ============================================================================

/**
 * Calculates complete Sales Bill Book Quotation
 * 
 * @param {Object} inputs
 *   - sizeId: 'a4' | 'a5' | '4.5x11' | 'legal' | '1/6-demy' | '1/8-demy'
 *   - quantity: Number of books (e.g. 10)
 *   - setsPerBook: Number of sets per book (e.g. 50 or 100)
 *   - plies: Array of ply configs [{ paperType, gsm, colour }]
 *   - printProcess: 'single_color_offset' | 'two_color_offset' | 'digital'
 *   - inkColour: 'Black' | 'Red' | 'Blue' | 'Multicolor'
 *   - numbering: Boolean (Serial Numbering)
 *   - bindingType: 'normal' | 'stapler' | 'gumming' | 'hardbound' | 'spiral'
 *   - includeGst: Boolean
 *   - salesMarginPercent: Number (default 25%)
 * 
 * @param {Object} masterData
 *   - papers: Array of PaperMaster records
 *   - printingRates: Array of PrintingRateMaster records
 *   - bindingRates: Array of BindingRateMaster records
 *   - finishingRates: Array of FinishingRateMaster records
 */
export function calculateSalesBillBookQuote(inputs = {}, masterData = {}) {
  const {
    sizeId = "a4",
    quantity = 10,
    setsPerBook = 100,
    plies = [
      { paperType: "Maplitho", gsm: 70, colour: "White" },
      { paperType: "Maplitho", gsm: 70, colour: "Yellow" },
    ],
    printProcess = "single_color_offset",
    inkColour = "Black",
    numbering = false,
    punching = false,
    bindingType = "normal",
    includeGst = false,
    salesMarginPercent = 50,
  } = inputs;

  const {
    papers = [],
    printingRates = [],
    bindingRates = [],
    finishingRates = [],
  } = masterData;

  // 1. Resolve size rule & auto-pick least-wastage raw sheet from DB papers
  const sizeRule =
    SALES_BOOK_SIZE_RULES.find((r) => r.id === sizeId) || SALES_BOOK_SIZE_RULES[0];
  const optimalSheet = selectLeastWastageSheetFromDb(
    papers,
    sizeRule.widthInch,
    sizeRule.heightInch,
    sizeRule
  );
  const yieldPerSheet = optimalSheet.yieldPerSheet || sizeRule.yieldPerSheet || 4;
  const rawSheetW = optimalSheet.rawWidthInch || sizeRule.rawSheetWidth;
  const rawSheetH = optimalSheet.rawHeightInch || sizeRule.rawSheetHeight;

  const numBooks = Math.max(1, Number(quantity) || 1);
  const numSets = Math.max(1, Number(setsPerBook) || 100);
  const numPlies = Array.isArray(plies) && plies.length > 0 ? plies.length : 1;

  // Total finished sheets needed per ply across all books
  const totalFinishedSheetsPerPly = numBooks * numSets;

  // Net raw sheets needed per ply
  const netRawSheetsPerPly = Math.ceil(totalFinishedSheetsPerPly / yieldPerSheet);

  const calcGroupWastage = (netSheets) => {
    const net = Math.max(0, Number(netSheets) || 0);
    if (net === 0) return 0;
    return net >= 500 ? 10 : 5;
  };

  // 2. Normalize, group identical paper specs within the order, then apply wastage ONCE per group
  const paperGroups = new Map();
  const plyConfigsResolved = [];

  for (let i = 0; i < numPlies; i++) {
    const plyConfig = plies[i] || {
      paperType: "Maplitho",
      gsm: 70,
      colour: i === 0 ? "White" : "Yellow",
    };

    const normType = String(plyConfig.paperType || "Maplitho").trim().replace(/\s+/g, " ");
    const normGsm = Number(plyConfig.gsm) || 70;
    const normColour = String(plyConfig.colour || "White").trim().replace(/\s+/g, " ");
    const paperKey = `${rawSheetW}x${rawSheetH}|${normType.toLowerCase()}|${normGsm}|${normColour.toLowerCase()}`;

    const rateInfo = resolvePaperRates(
      papers,
      rawSheetW,
      rawSheetH,
      normType,
      normGsm,
      normColour
    );

    if (!paperGroups.has(paperKey)) {
      paperGroups.set(paperKey, {
        paperKey,
        paperType: normType,
        gsm: normGsm,
        colour: normColour,
        groupNetSheets: 0,
        plyCountInGroup: 0,
        looseSheetRate: rateInfo.looseSheetRate,
        reamRate: rateInfo.reamRate,
      });
    }
    const grp = paperGroups.get(paperKey);
    grp.groupNetSheets += netRawSheetsPerPly;
    grp.plyCountInGroup += 1;

    const plyInks =
      Array.isArray(plyConfig.inkColours) && plyConfig.inkColours.length > 0
        ? plyConfig.inkColours
        : [String(plyConfig.inkColour || inkColour || "Black").trim()];

    plyConfigsResolved.push({
      plyIndex: i + 1,
      paperType: normType,
      gsm: normGsm,
      colour: normColour,
      inkColour: plyInks.join(" + "),
      inkColours: plyInks,
      printRequired: plyConfig.printRequired !== false,
      paperKey,
      netSheets: netRawSheetsPerPly,
      looseSheetRate: rateInfo.looseSheetRate,
      reamRate: rateInfo.reamRate,
    });
  }

  let totalPaperCost = 0;
  let totalRawSheetsOrder = 0;
  let wastageSheetsTotal = 0;

  paperGroups.forEach((grp) => {
    const wastage = calcGroupWastage(grp.groupNetSheets);
    const gross = grp.groupNetSheets + wastage;
    const reams = Math.floor(gross / 500);
    const loose = gross % 500;
    const groupCost = Number((reams * grp.reamRate + loose * grp.looseSheetRate).toFixed(2));

    grp.wastageSheets = wastage;
    grp.groupGrossSheets = gross;
    grp.reams = reams;
    grp.loose = loose;
    grp.purchaseMode = gross >= 500 ? "ream_plus_loose" : "loose";
    grp.groupCost = groupCost;

    totalPaperCost += groupCost;
    totalRawSheetsOrder += gross;
    wastageSheetsTotal += wastage;
  });

  totalPaperCost = Number(totalPaperCost.toFixed(2));

  const plyBreakdown = plyConfigsResolved.map((p) => {
    const grp = paperGroups.get(p.paperKey);
    const isSingle = grp.plyCountInGroup === 1;
    const plyWastage = isSingle
      ? grp.wastageSheets
      : Number((grp.wastageSheets / grp.plyCountInGroup).toFixed(2));
    const plyTotalSheets = isSingle ? grp.groupGrossSheets : p.netSheets + plyWastage;
    const plyCost = Number((grp.groupCost / grp.plyCountInGroup).toFixed(2));

    return {
      plyIndex: p.plyIndex,
      layerName: p.plyIndex === 1 ? "Original (Top)" : `Copy ${p.plyIndex - 1} (Duplicate)`,
      paperType: p.paperType,
      gsm: p.gsm,
      colour: p.colour,
      printRequired: p.printRequired,
      paperKey: p.paperKey,
      netSheets: p.netSheets,
      wastageSheets: plyWastage,
      totalSheets: plyTotalSheets,
      purchaseMode: grp.purchaseMode,
      reams: isSingle ? grp.reams : Math.floor(plyTotalSheets / 500),
      loose: isSingle ? grp.loose : plyTotalSheets % 500,
      looseSheetRate: p.looseSheetRate,
      reamRate: p.reamRate,
      cost: plyCost,
    };
  });

  // 3. Printing Cost Calculation
  let masterRate = rawSheetW === 23 && rawSheetH === 36 ? 50 : 30;
  let runRatePer1000 = 70;

  // Check if live printing rates available in master
  if (Array.isArray(printingRates) && printingRates.length > 0) {
    const masterObj = printingRates.find((r) =>
      rawSheetW === 23 && rawSheetH === 36
        ? r.rateKey === "OFFSET_MASTER_DEMY" || r.rateKey === "OFFSET_MASTER_LEGAL"
        : r.rateKey === "OFFSET_MASTER_LEGAL"
    );
    if (masterObj && masterObj.rate !== undefined) masterRate = Number(masterObj.rate);

    const runObj = printingRates.find(
      (r) => r.rateKey === "OFFSET_RUN_PER_1000" || r.rateKey === "OFFSET_IMPRESSION_RUN_1000"
    );
    if (runObj && runObj.rate !== undefined) runRatePer1000 = Number(runObj.rate);
  }

  const printedPlies = plyConfigsResolved.filter((p) => p.printRequired !== false);
  const printedPlyCount = printedPlies.length;

  let totalImpressions = totalFinishedSheetsPerPly * printedPlyCount;
  let numMasters = 1;
  let masterCost = 0;
  let runCost = 0;
  let totalRuns = printedPlyCount;
  let slabCount = printedPlyCount > 0 ? Math.max(1, Math.ceil(totalFinishedSheetsPerPly / 1000)) : 0;
  let printingCost = 0;

  if (printedPlyCount === 0) {
    numMasters = 0;
    totalRuns = 0;
    slabCount = 0;
    printingCost = 0;
  } else if (printProcess === "two_color_offset") {
    numMasters = 2;
    masterCost = numMasters * masterRate;
    totalRuns = printedPlyCount * 2;
    const runUnits = Math.max(1, Math.ceil((totalImpressions * 2) / 1000));
    runCost = runUnits * runRatePer1000;
    printingCost = masterCost + runCost;
  } else if (printProcess === "digital") {
    // Digital printing: strictly White paper only, calculated on 12x18 sheet yield
    const hasNonWhite = printedPlies.some(
      (p) => !p.colour || p.colour.trim().toLowerCase() !== "white"
    );
    if (hasNonWhite) {
      throw new Error("Digital Printing is strictly restricted to White paper only.");
    }
    const digRateObj = printingRates.find((r) => r.rateKey === "DIGITAL_12X18_FRONT");
    const digitalRatePerSheet = digRateObj ? Number(digRateObj.rate) : 6.0;
    const digYield = Math.max(
      1,
      Math.floor(18 / sizeRule.widthInch) * Math.floor(12 / sizeRule.heightInch),
      Math.floor(18 / sizeRule.heightInch) * Math.floor(12 / sizeRule.widthInch),
      sizeRule.id === "a4" ? 2 : 1
    );
    const digSheets = Math.ceil((totalFinishedSheetsPerPly * printedPlyCount) / digYield);
    numMasters = 0;
    totalRuns = 0;
    slabCount = 0;
    printingCost = digSheets * digitalRatePerSheet;
  } else {
    // Unique ink colours across all printed layers = Masters; runs = sum of colours per printed layer
    const uniqueInks = new Set();
    let runsPerPrintedLayerSum = 0;
    printedPlies.forEach((p) => {
      const inks =
        Array.isArray(p.inkColours) && p.inkColours.length > 0
          ? p.inkColours
          : [p.inkColour || inkColour || "Black"];
      runsPerPrintedLayerSum += inks.length;
      inks.forEach((c) => uniqueInks.add(String(c || "Black").trim().toUpperCase()));
    });
    numMasters = Math.max(1, uniqueInks.size);
    masterCost = numMasters * masterRate;
    totalRuns = runsPerPrintedLayerSum;
    totalImpressions = totalFinishedSheetsPerPly * totalRuns;
    slabCount = Math.max(1, Math.ceil(totalFinishedSheetsPerPly / 1000));
    runCost = totalRuns * slabCount * runRatePer1000;
    printingCost = masterCost + runCost;
  }

  printingCost = Number(printingCost.toFixed(2));

  // 4. Binding Cost Calculation
  let bindingRatePerBook = 25;
  const bindingObj = SALES_BINDING_OPTIONS.find((b) => b.id === bindingType);
  if (bindingObj) bindingRatePerBook = bindingObj.ratePerBook;

  if (Array.isArray(bindingRates) && bindingRates.length > 0) {
    const liveBind = bindingRates.find(
      (b) =>
        b.bindingCode === bindingType ||
        b.bindingType === bindingType ||
        (bindingObj && b.bindingType?.toLowerCase().includes(bindingType.toLowerCase()))
    );
    const liveRate = liveBind?.ratePerUnit ?? liveBind?.ratePerBook;
    if (liveRate !== undefined) bindingRatePerBook = Number(liveRate);
  }

  const bindingCost = Number((numBooks * bindingRatePerBook).toFixed(2));

  // 5. Finishing & Numbering Cost Calculation
  let numberingCost = 0;
  if (numbering) {
    let numberingRate = 2.0; // ₹2 per book
    if (Array.isArray(finishingRates) && finishingRates.length > 0) {
      const numObj = finishingRates.find(
        (f) => f.serviceKey === "FINISH_NUMBERING" || f.serviceKey === "FINISH_NUMBERING_PER_BOOK"
      );
      if (numObj && numObj.ratePerBook !== undefined) numberingRate = Number(numObj.ratePerBook);
    }
    numberingCost = Number((numBooks * numberingRate).toFixed(2));
  }

  let punchingCost = 0;
  if (punching) {
    let punchingRate = 2.0; // ₹2 per book
    if (Array.isArray(finishingRates) && finishingRates.length > 0) {
      const punchObj = finishingRates.find((f) => f.serviceKey === "FINISH_PUNCHING");
      if (punchObj && punchObj.ratePerBook !== undefined) punchingRate = Number(punchObj.ratePerBook);
    }
    punchingCost = Number((numBooks * punchingRate).toFixed(2));
  }

  // Cover & Gatta backing cost (included in normal & hardbound, ₹5 if plain stapler/pad)
  const coverGattaCost = bindingType === "stapler" ? numBooks * 5 : 0;

  // Transportation Cost (aligned with CommercialPrintCalculator & backend printingCalcEngine)
  let transportationCost = 50;
  if (Array.isArray(finishingRates) && finishingRates.length > 0) {
    const transObj = finishingRates.find((f) => f.serviceKey === "FINISH_TRANSPORTATION");
    if (transObj && transObj.ratePerBook !== undefined) transportationCost = Number(transObj.ratePerBook);
  }
  if (Array.isArray(printingRates) && printingRates.length > 0) {
    const transPrint = printingRates.find((r) => r.rateKey === "TRANSPORTATION_COST");
    if (transPrint && transPrint.rate !== undefined) transportationCost = Number(transPrint.rate);
  }

  // 6. Base Production Cost (Vendor Raw Price)
  const totalProductionCost = Number(
    (
      totalPaperCost +
      printingCost +
      bindingCost +
      numberingCost +
      punchingCost +
      coverGattaCost +
      transportationCost
    ).toFixed(2)
  );

  // 7. Selling Price (50% gross margin by default)
  const marginPct = Math.min(99, Math.max(0, Number(salesMarginPercent ?? 50)));
  const rawSellingPrice = totalProductionCost / (1 - marginPct / 100);
  // Round to friendly whole rupee
  const finalOrderPrice = Math.max(100, Math.ceil(rawSellingPrice));
  const pricePerBook = Number((finalOrderPrice / numBooks).toFixed(2));

  // 8. Tax Calculation
  const gstRate = 18; // 18% standard printing GST
  const gstAmount = includeGst ? Number(((finalOrderPrice * gstRate) / 100).toFixed(2)) : 0;
  const grandTotalWithGst = Number((finalOrderPrice + gstAmount).toFixed(2));

  return {
    success: true,
    sizeRule,
    finishedSizeName: sizeRule.name,
    finishedDimensions: sizeRule.dimensions,
    rawSheetDimensions: `${rawSheetW}" × ${rawSheetH}"`,
    yieldPerSheet,
    wastePercent: optimalSheet.wastePercent,
    selectedLayout: optimalSheet.selectedLayout,
    numBooks,
    numSets,
    numPlies,
    totalBooks: numBooks,
    totalSets: numBooks * numSets,
    totalFinishedPages: numBooks * numSets * numPlies,
    // Paper details
    plyBreakdown,
    totalPaperCost,
    totalRawSheetsOrder,
    wastageSheetsTotal,
    // Printing details
    printProcess,
    inkColour,
    numMasters,
    masterRate,
    masterCost,
    runRatePer1000,
    runCost,
    totalRuns,
    slabCount,
    totalImpressions,
    printingCost,
    // Binding & Finishing
    bindingType,
    bindingName: bindingObj ? bindingObj.name : "Normal Binding",
    bindingCost,
    numbering,
    numberingCost,
    punching,
    punchingCost,
    coverGattaCost,
    transportationCost,
    // Final Customer Pricing
    totalProductionCost,
    finalOrderPrice,
    pricePerBook,
    includeGst,
    gstRate,
    gstAmount,
    grandTotalWithGst,
    // Production delivery estimate
    turnaroundDays: numBooks > 50 ? "3-4 Working Days" : "2-3 Working Days",
  };
}
