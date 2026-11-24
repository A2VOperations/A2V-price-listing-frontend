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
  const masterList = Array.isArray(papers) && papers.length > 0 ? papers : DEFAULT_PAPER_MASTERS;

  // 1. Try exact 5-point match (Width, Height, Type, GSM, Colour)
  let match = masterList.find((p) => {
    const pw = Number(p.rawWidthInch || p.rawSheetWidth || 0);
    const ph = Number(p.rawHeightInch || p.rawSheetHeight || 0);
    const matchesSize =
      (pw === targetW && ph === targetH) || (pw === targetH && ph === targetW);
    const matchesType = !paperType || (p.paperType && p.paperType.toLowerCase() === paperType.toLowerCase());
    const matchesGsm = !gsm || Number(p.gsm) === Number(gsm);
    const matchesColour = !colour || (p.colour && p.colour.toLowerCase() === colour.toLowerCase());
    return matchesSize && matchesType && matchesGsm && matchesColour;
  });

  // 2. Try match without colour
  if (!match) {
    match = masterList.find((p) => {
      const pw = Number(p.rawWidthInch || p.rawSheetWidth || 0);
      const ph = Number(p.rawHeightInch || p.rawSheetHeight || 0);
      const matchesSize =
        (pw === targetW && ph === targetH) || (pw === targetH && ph === targetW);
      const matchesType = !paperType || (p.paperType && p.paperType.toLowerCase() === paperType.toLowerCase());
      const matchesGsm = !gsm || Number(p.gsm) === Number(gsm);
      return matchesSize && matchesType && matchesGsm;
    });
  }

  // 3. Fallback to default estimated rate
  if (!match) {
    match = DEFAULT_PAPER_MASTERS[0];
  }

  const looseRate = Number(match.looseSheetRate || (match.reamRate ? match.reamRate / 500 * 1.1 : 1.50));
  const reamRate = Number(match.reamRate || (match.looseSheetRate ? match.looseSheetRate * 500 * 0.9 : 700));

  return {
    looseSheetRate: Number(looseRate.toFixed(2)),
    reamRate: Number(reamRate.toFixed(2)),
    code: match.code || `PAP-${targetW}${targetH}-${gsm || 70}`,
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
    bindingType = "normal",
    includeGst = false,
    salesMarginPercent = 25,
  } = inputs;

  const {
    papers = [],
    printingRates = [],
    bindingRates = [],
    finishingRates = [],
  } = masterData;

  // 1. Resolve size rule
  const sizeRule =
    SALES_BOOK_SIZE_RULES.find((r) => r.id === sizeId) || SALES_BOOK_SIZE_RULES[0];
  const yieldPerSheet = sizeRule.yieldPerSheet || 4;
  const rawSheetW = sizeRule.rawSheetWidth;
  const rawSheetH = sizeRule.rawSheetHeight;

  const numBooks = Math.max(1, Number(quantity) || 1);
  const numSets = Math.max(1, Number(setsPerBook) || 100);
  const numPlies = Array.isArray(plies) && plies.length > 0 ? plies.length : 1;

  // Total finished sheets needed per ply across all books
  const totalFinishedSheetsPerPly = numBooks * numSets;

  // Net raw sheets needed per ply
  const netRawSheetsPerPly = Math.ceil(totalFinishedSheetsPerPly / yieldPerSheet);

  // Business rule: in every layer add 5 sheet extra for the wastage sheet and include the price of that also
  const wastageSheetsPerPly = 5;
  const totalRawSheetsPerPly = netRawSheetsPerPly + wastageSheetsPerPly;

  // 2. Paper Cost Calculation per Ply
  let totalPaperCost = 0;
  const plyBreakdown = [];

  for (let i = 0; i < numPlies; i++) {
    const plyConfig = plies[i] || {
      paperType: "Maplitho",
      gsm: 70,
      colour: i === 0 ? "White" : "Yellow",
    };

    const rateInfo = resolvePaperRates(
      papers,
      rawSheetW,
      rawSheetH,
      plyConfig.paperType,
      plyConfig.gsm,
      plyConfig.colour
    );

    let plyCost = 0;
    let purchaseMode = "loose";
    let reams = 0;
    let loose = totalRawSheetsPerPly;

    if (totalRawSheetsPerPly >= 500) {
      purchaseMode = "ream_plus_loose";
      reams = Math.floor(totalRawSheetsPerPly / 500);
      loose = totalRawSheetsPerPly % 500;
      plyCost = reams * rateInfo.reamRate + loose * rateInfo.looseSheetRate;
    } else {
      purchaseMode = "loose";
      plyCost = totalRawSheetsPerPly * rateInfo.looseSheetRate;
    }

    plyCost = Number(plyCost.toFixed(2));
    totalPaperCost += plyCost;

    plyBreakdown.push({
      plyIndex: i + 1,
      layerName: i === 0 ? "Original (Top)" : `Copy ${i} (Duplicate)`,
      paperType: plyConfig.paperType,
      gsm: plyConfig.gsm,
      colour: plyConfig.colour,
      netSheets: netRawSheetsPerPly,
      wastageSheets: wastageSheetsPerPly,
      totalSheets: totalRawSheetsPerPly,
      purchaseMode,
      reams,
      loose,
      looseSheetRate: rateInfo.looseSheetRate,
      reamRate: rateInfo.reamRate,
      cost: plyCost,
    });
  }

  totalPaperCost = Number(totalPaperCost.toFixed(2));

  // 3. Printing Cost Calculation
  let masterRate = rawSheetW === 23 && rawSheetH === 36 ? 50 : 30;
  let runRatePer1000 = 70;

  // Check if live printing rates available in master
  if (Array.isArray(printingRates) && printingRates.length > 0) {
    const masterObj = printingRates.find((r) =>
      rawSheetW === 23 && rawSheetH === 36
        ? r.rateKey === "OFFSET_MASTER_DEMY"
        : r.rateKey === "OFFSET_MASTER_LEGAL"
    );
    if (masterObj && masterObj.rate) masterRate = Number(masterObj.rate);

    const runObj = printingRates.find(
      (r) => r.rateKey === "OFFSET_IMPRESSION_RUN_1000"
    );
    if (runObj && runObj.rate) runRatePer1000 = Number(runObj.rate);
  }

  let totalImpressions = totalFinishedSheetsPerPly * numPlies;
  let numMasters = 1;
  let printingCost = 0;

  if (printProcess === "two_color_offset") {
    numMasters = 2;
    const masterCost = numMasters * masterRate;
    const runUnits = Math.max(1, Math.ceil((totalImpressions * 2) / 1000));
    const runCost = runUnits * runRatePer1000;
    printingCost = masterCost + runCost;
  } else if (printProcess === "digital") {
    // Digital printing per finished A4 equivalent sheet
    const digitalRatePerSheet = 6.0;
    printingCost = totalFinishedSheetsPerPly * numPlies * digitalRatePerSheet;
  } else {
    // Single color mini offset (default)
    numMasters = 1;
    const masterCost = numMasters * masterRate;
    const runUnits = Math.max(1, Math.ceil(totalImpressions / 1000));
    const runCost = runUnits * runRatePer1000;
    printingCost = masterCost + runCost;
  }

  printingCost = Number(printingCost.toFixed(2));

  // 4. Binding Cost Calculation
  let bindingRatePerBook = 25;
  const bindingObj = SALES_BINDING_OPTIONS.find((b) => b.id === bindingType);
  if (bindingObj) bindingRatePerBook = bindingObj.ratePerBook;

  if (Array.isArray(bindingRates) && bindingRates.length > 0) {
    const liveBind = bindingRates.find((b) => b.bindingCode === bindingType || b.bindingType === bindingType);
    if (liveBind && liveBind.ratePerBook) bindingRatePerBook = Number(liveBind.ratePerBook);
  }

  const bindingCost = Number((numBooks * bindingRatePerBook).toFixed(2));

  // 5. Finishing & Numbering Cost Calculation
  let numberingCost = 0;
  if (numbering) {
    let numberingRate = 2.0; // ₹2 per book
    if (Array.isArray(finishingRates) && finishingRates.length > 0) {
      const numObj = finishingRates.find((f) => f.serviceKey === "FINISH_NUMBERING_PER_BOOK");
      if (numObj && numObj.ratePerBook) numberingRate = Number(numObj.ratePerBook);
    }
    numberingCost = Number((numBooks * numberingRate).toFixed(2));
  }

  // Cover & Gatta backing cost (included in normal & hardbound, ₹5 if plain stapler/pad)
  const coverGattaCost = bindingType === "stapler" ? numBooks * 5 : 0;

  // 6. Base Production Cost
  const totalProductionCost = Number(
    (totalPaperCost + printingCost + bindingCost + numberingCost + coverGattaCost).toFixed(2)
  );

  // 7. Selling Price with Sales Margin
  const marginMultiplier = 1 + (Number(salesMarginPercent) || 25) / 100;
  const rawSellingPrice = totalProductionCost * marginMultiplier;
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
    numBooks,
    numSets,
    numPlies,
    totalBooks: numBooks,
    totalSets: numBooks * numSets,
    totalFinishedPages: numBooks * numSets * numPlies,
    // Paper details
    plyBreakdown,
    totalPaperCost,
    totalRawSheetsOrder: totalRawSheetsPerPly * numPlies,
    wastageSheetsTotal: wastageSheetsPerPly * numPlies,
    // Printing details
    printProcess,
    inkColour,
    numMasters,
    totalImpressions,
    printingCost,
    // Binding & Finishing
    bindingType,
    bindingName: bindingObj ? bindingObj.name : "Normal Binding",
    bindingCost,
    numbering,
    numberingCost,
    coverGattaCost,
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
