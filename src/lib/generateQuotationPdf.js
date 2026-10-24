import jsPDF from "jspdf";

/**
 * Generates an official, beautifully styled PDF quotation for Flex Board order.
 * Uses a refined Orange accent theme matching user preference.
 *
 * @param {Object} data Order specifications and pricing details
 * @returns {string} Blob URL of the generated PDF document
 */
export function generateFlexQuotationPdf(data) {
  const {
    activeMaterial,
    validHeight,
    validWidth,
    flexAreaSqFt,
    flexPrintingPricePerUnit,
    activeBoard,
    runningFeetDetails,
    boardCostPerUnit,
    hasSupportRod,
    supportRodCount,
    supportRodType,
    hasFitting,
    fittingChargesTotal,
    hasAngle,
    angleUnits,
    angleCostPerUnit,
    hasAnglePatti,
    pattiUnits,
    anglePattiCostPerUnit,
    customHardwareList = [],
    quantity,
    grossSubtotal,
    validDiscount,
    totalAmount,
    clientInfo = {},
  } = data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const contentWidth = 180; // 15mm to 195mm
  const rightEdge = margin + contentWidth; // 195mm
  const quoteRef = `Q-FB-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // 0. OUTER PAGE BORDER / FRAME
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.roundedRect(10, 8, 190, 281, 2, 2, "D");

  // 1. TOP HEADER BANNER (Deep Navy with right Orange accent)
  const headerY = 14;
  const headerHeight = 25;

  // Base Dark Blue / Navy
  doc.setFillColor(11, 25, 44); // #0B192C deep navy
  doc.rect(margin, headerY, contentWidth, headerHeight, "F");

  // Warm Orange Accent Triangle on the right
  doc.setFillColor(194, 65, 12); // #C2410C orange-700
  doc.triangle(
    rightEdge - 30,
    headerY,
    rightEdge,
    headerY,
    rightEdge,
    headerY + headerHeight,
    "F",
  );

  // Logo: "A2V" in bold White, "PRINTS" in Orange
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("A2V", margin + 7, headerY + 12);

  const a2vWidth = doc.getTextWidth("A2V ");
  doc.setTextColor(249, 115, 22); // #F97316 orange-500
  doc.text("PRINTS", margin + 7 + a2vWidth, headerY + 12);

  // Orange underline accent beneath A2V
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(1.2);
  doc.line(
    margin + 7,
    headerY + 14.5,
    margin + 7 + a2vWidth + 4,
    headerY + 14.5,
  );

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text(
    "Premium Flex Board Printing & Framing Solutions",
    margin + 7,
    headerY + 20,
  );

  // Right Header: Document icon in orange
  const iconX = rightEdge - 78;
  const iconY = headerY + 5;
  doc.setDrawColor(249, 115, 22); // orange-500
  doc.setLineWidth(0.8);
  doc.roundedRect(iconX, iconY, 8.5, 11, 1, 1, "D");
  doc.line(iconX + 2, iconY + 3.2, iconX + 6.5, iconY + 3.2);
  doc.line(iconX + 2, iconY + 5.7, iconX + 6.5, iconY + 5.7);
  doc.line(iconX + 2, iconY + 8.2, iconX + 5, iconY + 8.2);

  // Right Header: Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("QUOTATION ESTIMATE", rightEdge - 5, headerY + 9, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(254, 215, 170); // orange-200
  doc.text(
    `Ref: ${quoteRef}  |  Date: ${dateStr}`,
    rightEdge - 5,
    headerY + 16,
    { align: "right" },
  );

  // 2. CLIENT & SPECIFICATIONS SUMMARY CARD
  const cardY = headerY + 30;
  const cardHeight = 26;

  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(254, 215, 170); // #FED7AA orange-200
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, "FD");

  // Left Section: QUOTATION PREPARED FOR
  // User Outline Icon (Orange)
  doc.setDrawColor(234, 88, 12); // orange-600
  doc.setLineWidth(0.7);
  doc.circle(margin + 8, cardY + 7, 2, "D");
  doc.line(margin + 5.5, cardY + 12.5, margin + 10.5, cardY + 12.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("QUOTATION PREPARED FOR:", margin + 14, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  const clientName =
    clientInfo?.clientName ||
    clientInfo?.companyName ||
    "Walk-in Client / Customer";
  doc.text(clientName, margin + 14, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  const contactText =
    [clientInfo?.phone, clientInfo?.email].filter(Boolean).join("  |  ") ||
    "Contact: N/A";
  doc.text(contactText, margin + 14, cardY + 20);

  // Right Section: SPECIFICATION SUMMARY
  const rightColX = margin + 95;
  // Document Outline Icon (Orange)
  doc.setDrawColor(234, 88, 12); // orange-600
  doc.setLineWidth(0.7);
  doc.roundedRect(rightColX, cardY + 4.5, 5, 6.5, 0.6, 0.6, "D");
  doc.line(rightColX + 1.2, cardY + 6.8, rightColX + 3.8, cardY + 6.8);
  doc.line(rightColX + 1.2, cardY + 8.4, rightColX + 3.8, cardY + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("SPECIFICATION SUMMARY:", rightColX + 8, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(
    `Size: ${validHeight} ft x ${validWidth} ft (${flexAreaSqFt} sq. ft.)`,
    rightColX + 8,
    cardY + 13,
  );
  doc.text(
    `Media: ${activeMaterial?.name || "Flex"}`,
    rightColX + 8,
    cardY + 18,
  );
  doc.text(
    `Quantity: ${quantity} ${quantity === 1 ? "Board" : "Boards"}`,
    rightColX + 8,
    cardY + 23,
  );

  // 3. ITEMIZED COST BREAKDOWN TABLE
  const tableY = cardY + 32;
  const col1W = 12; // # (15 to 27)
  const col2W = 68; // Description (27 to 95)
  const col3W = 63; // Specs / Rate (95 to 158)
  const col4W = 37; // Total (158 to 195)

  const x1 = margin; // 15
  const x2 = x1 + col1W; // 27
  const x3 = x2 + col2W; // 95
  const x4 = x3 + col3W; // 158
  const x5 = rightEdge; // 195

  // Table Header
  const tableHeaderH = 8.5;
  doc.setFillColor(11, 25, 44); // #0B192C navy
  doc.rect(margin, tableY, contentWidth, tableHeaderH, "F");

  // Vertical lines in table header
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(x2, tableY, x2, tableY + tableHeaderH);
  doc.line(x3, tableY, x3, tableY + tableHeaderH);
  doc.line(x4, tableY, x4, tableY + tableHeaderH);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("#", (x1 + x2) / 2, tableY + 5.5, { align: "center" });
  doc.text("ITEM DESCRIPTION", x2 + 3.5, tableY + 5.5);
  doc.text("SPECIFICATIONS / RATE", x3 + 3.5, tableY + 5.5);
  doc.text("TOTAL (Rs.)", x5 - 4, tableY + 5.5, { align: "right" });

  // Rows Data
  const rows = [
    {
      desc: `Flex Printing (${activeMaterial?.name || "Flex"})`,
      spec: `${flexAreaSqFt} sqft @ Rs. ${activeMaterial?.pricePerSqFt || 0}/sqft`,
      total: `Rs. ${(flexPrintingPricePerUnit * quantity).toLocaleString()}/-`,
    },
    ...(activeBoard && activeBoard.name !== "None"
      ? [
          {
            desc: `${activeBoard.name} Structure Framing`,
            spec: `${runningFeetDetails?.totalRunningFeet || 0} running ft @ Rs. ${activeBoard.ratePerFt}/ft`,
            total: `Rs. ${(boardCostPerUnit * quantity).toLocaleString()}/-`,
          },
        ]
      : []),
    ...(hasSupportRod === "Yes"
      ? [
          {
            desc: `Frame Support Rods (${supportRodType})`,
            spec: `${supportRodCount} rod(s) included in running ft calculation`,
            total: "Included",
          },
        ]
      : []),
    ...(hasFitting === "Yes" && fittingChargesTotal > 0
      ? [
          {
            desc: "Site Fitting & Mounting Installation",
            spec: "Custom manual fitting charges",
            total: `Rs. ${fittingChargesTotal.toLocaleString()}/-`,
          },
        ]
      : []),
    ...(hasAngle === "Yes" && angleUnits > 0
      ? [
          {
            desc: "Mounting Angle Brackets",
            spec: `${angleUnits} unit(s) @ Rs. 450 per unit`,
            total: `Rs. ${(angleCostPerUnit * quantity).toLocaleString()}/-`,
          },
        ]
      : []),
    ...(hasAnglePatti === "Yes" && pattiUnits > 0
      ? [
          {
            desc: "Angle Patti Support Units",
            spec: `${pattiUnits} unit(s) @ Rs. 100 per unit`,
            total: `Rs. ${(anglePattiCostPerUnit * quantity).toLocaleString()}/-`,
          },
        ]
      : []),
    ...(customHardwareList && customHardwareList.length > 0
      ? customHardwareList.map((item) => ({
          desc: item.name || "Custom Hardware / Fitting",
          spec: "Manual hardware / service charge",
          total: `Rs. ${Number(item.price || 0).toLocaleString()}/-`,
        }))
      : []),
  ];

  let currentY = tableY + tableHeaderH;
  const rowHeight = 8.5;

  rows.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(
      isEven ? 255 : 255,
      isEven ? 255 : 250,
      isEven ? 255 : 245,
    ); // alternating white / soft cream
    doc.rect(margin, currentY, contentWidth, rowHeight, "F");

    // Grid Borders
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(x1, currentY + rowHeight, x5, currentY + rowHeight); // row bottom
    doc.line(x1, currentY, x1, currentY + rowHeight); // left outer
    doc.line(x2, currentY, x2, currentY + rowHeight); // col 1
    doc.line(x3, currentY, x3, currentY + rowHeight); // col 2
    doc.line(x4, currentY, x4, currentY + rowHeight); // col 3
    doc.line(x5, currentY, x5, currentY + rowHeight); // right outer

    // Text Values
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(String(idx + 1), (x1 + x2) / 2, currentY + 5.5, {
      align: "center",
    });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(row.desc, x2 + 3.5, currentY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(row.spec, x3 + 3.5, currentY + 5.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(row.total, x5 - 4, currentY + 5.5, { align: "right" });

    currentY += rowHeight;
  });

  // 4. BOTTOM SECTION: TECHNICAL DETAILS (LEFT) & TOTALS (RIGHT)
  const bottomSectionY = currentY + 8;

  // --- LEFT SIDE: FRAME TECHNICAL DETAILS CARD ---
  if (activeBoard && activeBoard.name !== "None" && runningFeetDetails) {
    const frameBoxW = 76;
    const frameBoxH = 36;
    doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
    doc.setDrawColor(254, 215, 170); // #FED7AA orange-200
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, bottomSectionY, frameBoxW, frameBoxH, 2, 2, "FD");

    // Gear Icon (Orange)
    const gearX = margin + 8;
    const gearY = bottomSectionY + 7;
    doc.setDrawColor(234, 88, 12); // orange-600
    doc.setLineWidth(0.7);
    doc.circle(gearX, gearY, 2.5, "D");
    doc.circle(gearX, gearY, 1.1, "D");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(194, 65, 12); // orange-700
    doc.text("FRAME TECHNICAL DETAILS:", margin + 14, bottomSectionY + 8);

    // Light line divider
    doc.setDrawColor(254, 215, 170); // orange-200
    doc.setLineWidth(0.4);
    doc.line(
      margin + 14,
      bottomSectionY + 11,
      margin + frameBoxW - 4,
      bottomSectionY + 11,
    );

    // Detail lines
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const perimeterFormula = `2 x (${validHeight} + ${validWidth}) = ${validHeight * 2 + validWidth * 2} ft`;
    doc.text(
      `Outer Perimeter: ${perimeterFormula}`,
      margin + 14,
      bottomSectionY + 17,
    );

    const supportRodDetail =
      hasSupportRod === "Yes" && supportRodCount > 0
        ? `${runningFeetDetails.supportRunningFeet || 0} ft (${supportRodCount} ${supportRodType})`
        : "Not Required (0 ft)";
    doc.text(
      `Support Rods: ${supportRodDetail}`,
      margin + 14,
      bottomSectionY + 23,
    );

    doc.text(
      `Total Running Ft: ${runningFeetDetails.totalRunningFeet || 0} ft`,
      margin + 14,
      bottomSectionY + 29,
    );
  }

  // --- RIGHT SIDE: FINANCIAL TOTALS ---
  const totalsBoxX = margin + 92;
  const totalsBoxW = contentWidth - 92; // 88mm

  // Row: Gross Subtotal Amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("Gross Subtotal Amount:", totalsBoxX + 2, bottomSectionY + 6);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(
    `Rs. ${grossSubtotal.toLocaleString()}/-`,
    rightEdge - 3,
    bottomSectionY + 6,
    { align: "right" },
  );

  // Row: Special Discount Deducted (if any)
  let totalsPayableY = bottomSectionY + 12;
  if (validDiscount > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12); // #EA580C orange-600
    doc.text("Special Discount Deducted:", totalsBoxX + 2, bottomSectionY + 14);
    doc.setFontSize(9);
    doc.text(
      `- Rs. ${validDiscount.toLocaleString()}/-`,
      rightEdge - 3,
      bottomSectionY + 14,
      { align: "right" },
    );
    totalsPayableY = bottomSectionY + 20;
  }

  // Row: TOTAL AMOUNT PAYABLE Box (Rounded Orange)
  const payableBoxH = 13;
  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(0.8);
  doc.roundedRect(
    totalsBoxX,
    totalsPayableY,
    totalsBoxW,
    payableBoxH,
    2,
    2,
    "FD",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("TOTAL AMOUNT PAYABLE:", totalsBoxX + 4, totalsPayableY + 8);

  doc.setFontSize(11.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text(
    `Rs. ${totalAmount.toLocaleString()}/-`,
    rightEdge - 4,
    totalsPayableY + 8.5,
    { align: "right" },
  );

  // 5. SAVE & DOWNLOAD FILE
  const filename = `A2V_Quotation_FlexBoard_${quoteRef}.pdf`;
  doc.save(filename);

  // Return blob URL for optional preview
  try {
    return doc.output("bloburl");
  } catch {
    return null;
  }
}

/**
 * Generates an official, beautifully styled PDF quotation for Roll-Up Standee order.
 *
 * @param {Object} data Order specifications and pricing details
 * @returns {string} Blob URL of the generated PDF document
 */
export function generateStandieQuotationPdf(data) {
  const {
    standeeSize = "5 × 3 Ft",
    validWidth = 3,
    validHeight = 5,
    totalStandeeHeight,
    legClearance = 1,
    flexHeight = 5,
    flexWidth = 3,
    flexArea = 15,
    isDoubleSided = true,
    mediaName = "Star Flex",
    flexRate = 30,
    flexCost = 720,
    ironRunningFt = 16,
    ironRate = 35,
    ironCost = 560,
    angleBaseFt = 2,
    angleRate = 50,
    angleCost = 100,
    supportCount = 4,
    supportRate = 80,
    supportCost = 320,
    activeMedia,
    mediaCostPerUnit = 0,
    activeStand,
    standCostPerUnit = 0,
    activeLamination,
    laminationCostPerUnit = 0,
    activeDesign,
    designCostTotal = 0,
    quantity = 1,
    grossSubtotal = 0,
    validDiscount = 0,
    totalAmount = 0,
    clientInfo = {},
    productName = "Heavy-Duty MS Iron Frame Standee Display",
  } = data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const contentWidth = 180; // 15mm to 195mm
  const rightEdge = margin + contentWidth; // 195mm
  const quoteRef = `Q-STD-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // 0. OUTER PAGE BORDER / FRAME
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.roundedRect(10, 8, 190, 281, 2, 2, "D");

  // 1. TOP HEADER BANNER (Deep Navy with right Orange accent)
  const headerY = 14;
  const headerHeight = 25;

  // Base Dark Blue / Navy
  doc.setFillColor(11, 25, 44); // #0B192C deep navy
  doc.rect(margin, headerY, contentWidth, headerHeight, "F");

  // Warm Orange Accent Triangle on the right
  doc.setFillColor(194, 65, 12); // #C2410C orange-700
  doc.triangle(
    rightEdge - 30,
    headerY,
    rightEdge,
    headerY,
    rightEdge,
    headerY + headerHeight,
    "F",
  );

  // Logo: "A2V" in bold White, "PRINTS" in Orange
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("A2V", margin + 7, headerY + 12);

  const a2vWidth = doc.getTextWidth("A2V ");
  doc.setTextColor(249, 115, 22); // #F97316 orange-500
  doc.text("PRINTS", margin + 7 + a2vWidth, headerY + 12);

  // Orange underline accent beneath A2V
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(1.2);
  doc.line(
    margin + 7,
    headerY + 14.5,
    margin + 7 + a2vWidth + 4,
    headerY + 14.5,
  );

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text(
    "Heavy-Duty MS Iron Frame Standee & Displays",
    margin + 7,
    headerY + 20,
  );

  // Right Header: Document icon in orange
  const iconX = rightEdge - 78;
  const iconY = headerY + 5;
  doc.setDrawColor(249, 115, 22); // orange-500
  doc.setLineWidth(0.8);
  doc.roundedRect(iconX, iconY, 8.5, 11, 1, 1, "D");
  doc.line(iconX + 2, iconY + 3.2, iconX + 6.5, iconY + 3.2);
  doc.line(iconX + 2, iconY + 5.7, iconX + 6.5, iconY + 5.7);
  doc.line(iconX + 2, iconY + 8.2, iconX + 5, iconY + 8.2);

  // Right Header: Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("STANDIE QUOTATION", rightEdge - 5, headerY + 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(254, 215, 170); // orange-200
  doc.text(
    `Ref: ${quoteRef}  |  Date: ${dateStr}`,
    rightEdge - 5,
    headerY + 16,
    { align: "right" },
  );

  // 2. CLIENT & SPECIFICATIONS SUMMARY CARD
  const cardY = headerY + 30;
  const cardHeight = 26;

  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(254, 215, 170); // #FED7AA orange-200
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, "FD");

  // Left Section: QUOTATION PREPARED FOR
  doc.setDrawColor(234, 88, 12); // orange-600
  doc.setLineWidth(0.7);
  doc.circle(margin + 8, cardY + 7, 2, "D");
  doc.line(margin + 5.5, cardY + 12.5, margin + 10.5, cardY + 12.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("QUOTATION PREPARED FOR:", margin + 14, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  const clientName =
    clientInfo?.clientName ||
    clientInfo?.companyName ||
    "Walk-in Client / Customer";
  doc.text(clientName, margin + 14, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  const contactText =
    [clientInfo?.phone, clientInfo?.email].filter(Boolean).join("  |  ") ||
    "Contact: N/A";
  doc.text(contactText, margin + 14, cardY + 20);

  // Right Section: SPECIFICATION SUMMARY
  const rightColX = margin + 95;
  doc.setDrawColor(234, 88, 12); // orange-600
  doc.setLineWidth(0.7);
  doc.roundedRect(rightColX, cardY + 4.5, 5, 6.5, 0.6, 0.6, "D");
  doc.line(rightColX + 1.2, cardY + 6.8, rightColX + 3.8, cardY + 6.8);
  doc.line(rightColX + 1.2, cardY + 8.4, rightColX + 3.8, cardY + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("STANDIE SPECIFICATION:", rightColX + 8, cardY + 7.5);

  const calculatedTotalHeight =
    totalStandeeHeight ||
    parseFloat((parseFloat(validHeight) + parseFloat(legClearance)).toFixed(2));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(
    `Standee Size: ${validWidth}ft (W) × ${calculatedTotalHeight}ft (H) (${validHeight}ft Board + ${legClearance}ft Legs)`,
    rightColX + 8,
    cardY + 13,
  );
  doc.text(
    `Flex Area: ${flexWidth}×${flexHeight} ft (${flexArea} sq.ft. ${isDoubleSided ? "Both Sides" : "Single Side"})`,
    rightColX + 8,
    cardY + 18,
  );
  doc.text(
    `Quantity: ${quantity} ${quantity === 1 ? "Unit" : "Units"}`,
    rightColX + 8,
    cardY + 23,
  );

  // 3. ITEMIZED COST BREAKDOWN TABLE
  const tableY = cardY + 32;
  const col1W = 12; // #
  const col2W = 68; // Description
  const col3W = 63; // Specs / Rate
  const col4W = 37; // Total

  const x1 = margin;
  const x2 = x1 + col1W;
  const x3 = x2 + col2W;
  const x4 = x3 + col3W;
  const x5 = rightEdge;

  // Table Header
  const tableHeaderH = 8.5;
  doc.setFillColor(11, 25, 44); // #0B192C navy
  doc.rect(margin, tableY, contentWidth, tableHeaderH, "F");

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(x2, tableY, x2, tableY + tableHeaderH);
  doc.line(x3, tableY, x3, tableY + tableHeaderH);
  doc.line(x4, tableY, x4, tableY + tableHeaderH);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("#", (x1 + x2) / 2, tableY + 5.5, { align: "center" });
  doc.text("ITEM DESCRIPTION", x2 + 3.5, tableY + 5.5);
  doc.text("SPECIFICATIONS / RATE", x3 + 3.5, tableY + 5.5);
  doc.text("TOTAL (Rs.)", x5 - 4, tableY + 5.5, { align: "right" });

  // Rows Data
  const rows = [];

  if (ironRunningFt) {
    // 1. MS Iron Frame
    rows.push({
      desc: "MS Iron Rod Frame (Square Pipe)",
      spec: `${calculatedTotalHeight}+${calculatedTotalHeight}+${validWidth}+${validWidth} = ${ironRunningFt} Ft @ Rs. ${ironRate}/ft`,
      total: `Rs. ${(ironCost * quantity).toLocaleString()}/-`,
    });

    // 2. Angle Rod Base Stand
    rows.push({
      desc: "Angle Rod Base Stand (Legs)",
      spec: `2 Welded Angle Feet (${angleBaseFt} Ft) @ Rs. ${angleRate}/ft`,
      total: `Rs. ${(angleCost * quantity).toLocaleString()}/-`,
    });

    // 3. Support Rods
    rows.push({
      desc: "Corner Support Rods (Stays)",
      spec: `${supportCount} Nos Heavy-Duty Stays @ Rs. ${supportRate}/pc`,
      total: `Rs. ${(supportCost * quantity).toLocaleString()}/-`,
    });

    // 4. Flex Printing
    rows.push({
      desc: `Flex Banner with Fitting (${isDoubleSided ? "Both Sides" : "Single-Sided"})`,
      spec: `${mediaName || "Normal Flex"} (${flexArea} sqft ${isDoubleSided ? "× 2" : ""}) @ Rs. ${flexRate}/sqft`,
      total: `Rs. ${(flexCost * quantity).toLocaleString()}/-`,
    });
  } else {
    // Legacy fallback
    if (activeStand && activeStand.name !== "None (Print Only)") {
      rows.push({
        desc: activeStand.name,
        spec: `Hardware Unit with Padded Bag @ Rs. ${activeStand.price}/unit`,
        total: `Rs. ${(standCostPerUnit * quantity).toLocaleString()}/-`,
      });
    }
    if (activeMedia && activeMedia.name !== "No Print (Hardware Only)") {
      rows.push({
        desc: `Graphic Banner Printing (${activeMedia.name})`,
        spec: `${areaSqFt} sqft @ Rs. ${activeMedia.pricePerSqFt}/sqft`,
        total: `Rs. ${(mediaCostPerUnit * quantity).toLocaleString()}/-`,
      });
    }
  }

  // Table Rows Drawing
  let currentY = tableY + tableHeaderH;
  const rowHeight = 7.5;

  rows.forEach((r, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(margin, currentY, contentWidth, rowHeight, "F");
    }

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + rowHeight, rightEdge, currentY + rowHeight);
    doc.line(x1, currentY, x1, currentY + rowHeight);
    doc.line(x2, currentY, x2, currentY + rowHeight);
    doc.line(x3, currentY, x3, currentY + rowHeight);
    doc.line(x4, currentY, x4, currentY + rowHeight);
    doc.line(x5, currentY, x5, currentY + rowHeight);

    // Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(String(idx + 1), (x1 + x2) / 2, currentY + 5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(r.desc, x2 + 3.5, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(r.spec, x3 + 3.5, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(r.total, x5 - 4, currentY + 5, { align: "right" });

    currentY += rowHeight;
  });

  // 4. BOTTOM SECTION: TERMS & TOTALS
  const bottomSectionY = currentY + 8;

  // Left: Terms Card
  const termsBoxW = 98;
  const termsBoxH = 50;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, bottomSectionY, termsBoxW, termsBoxH, 1.5, 1.5, "FD");

  // Orange Title Tag
  doc.setFillColor(255, 237, 213); // orange-100
  doc.roundedRect(margin + 3, bottomSectionY + 3, 42, 5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("TERMS & CONDITIONS", margin + 5, bottomSectionY + 6.6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105); // slate-600
  const terms = [
    "• Turnaround Time: 24 to 48 Hours from design approval.",
    "• Structure: Heavy-duty welded MS iron square pipe frame.",
    "• Base Support: 2 angle iron base feet with 4 diagonal support struts.",
    "• Flex: High-resolution vibrant digital print mounted both sides.",
    "• Payment: 50% advance along with purchase confirmation.",
    "• Transportation / Courier charges extra if delivered outside local city.",
  ];

  terms.forEach((line, i) => {
    doc.text(line, margin + 4, bottomSectionY + 13 + i * 5);
  });

  // Right: Totals Box
  const totalsBoxX = margin + 104;
  const totalsBoxW = 76;

  // Row: Subtotal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Gross Subtotal:", totalsBoxX + 2, bottomSectionY + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Rs. ${grossSubtotal.toLocaleString()}/-`,
    rightEdge - 3,
    bottomSectionY + 6,
    { align: "right" },
  );

  let totalsPayableY = bottomSectionY + 14;

  if (validDiscount > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12); // orange-600
    doc.text("Special Discount:", totalsBoxX + 2, bottomSectionY + 14);
    doc.setFontSize(9);
    doc.text(
      `- Rs. ${validDiscount.toLocaleString()}/-`,
      rightEdge - 3,
      bottomSectionY + 14,
      { align: "right" },
    );
    totalsPayableY = bottomSectionY + 22;
  }

  // Row: TOTAL AMOUNT PAYABLE Box (Rounded Orange)
  const payableBoxH = 13;
  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(0.8);
  doc.roundedRect(
    totalsBoxX,
    totalsPayableY,
    totalsBoxW,
    payableBoxH,
    2,
    2,
    "FD",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("TOTAL AMOUNT PAYABLE:", totalsBoxX + 4, totalsPayableY + 8);

  doc.setFontSize(11.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text(
    `Rs. ${totalAmount.toLocaleString()}/-`,
    rightEdge - 4,
    totalsPayableY + 8.5,
    { align: "right" },
  );

  // 5. SAVE & DOWNLOAD FILE
  const filename = `A2V_Quotation_Standee_${quoteRef}.pdf`;
  doc.save(filename);

  try {
    return doc.output("bloburl");
  } catch {
    return null;
  }
}

/**
 * Generate Quotation PDF for Roll-Up Standees (STD-001)
 */
export function generateRollUpStandieQuotationPdf(data) {
  const {
    machineWidth = 2.5,
    customHeight = 6,
    totalAreaSqFt = 15.0,
    machineName = "Standard Aluminium Roll-Up Standee Machine Base",
    machineCost = 1250,
    includeMachine = true,
    includeBanner = true,
    mediaName = "Star Flex",
    flexRate = 30,
    flexCost = 450,
    quantity = 1,
    grossSubtotal = 1700,
    validDiscount = 0,
    totalAmount = 1700,
    clientInfo = {},
  } = data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const contentWidth = 180;
  const rightEdge = margin + contentWidth;
  const quoteRef = `Q-RLP-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Outer Page Border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.roundedRect(10, 8, 190, 281, 2, 2, "D");

  // Top Header Banner (Deep Navy with Blue Accent)
  const headerY = 14;
  const headerHeight = 25;

  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, headerY, contentWidth, headerHeight, "F");

  // Blue Accent Triangle on Right
  doc.setFillColor(37, 99, 235); // blue-600
  doc.triangle(
    rightEdge - 30,
    headerY,
    rightEdge,
    headerY,
    rightEdge,
    headerY + headerHeight,
    "F",
  );

  // Logo: "A2V" in bold White, "PRINTS" in Blue
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("A2V", margin + 7, headerY + 12);

  const a2vWidth = doc.getTextWidth("A2V ");
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text("PRINTS", margin + 7 + a2vWidth, headerY + 12);

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.2);
  doc.line(
    margin + 7,
    headerY + 14.5,
    margin + 7 + a2vWidth + 4,
    headerY + 14.5,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    "Roll-Up Standee Systems & Display Solutions",
    margin + 7,
    headerY + 20,
  );

  // Right Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("ROLL-UP STANDEE QUOTATION", rightEdge - 5, headerY + 9, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254); // blue-200
  doc.text(
    `Ref: ${quoteRef}  |  Date: ${dateStr}`,
    rightEdge - 5,
    headerY + 16,
    { align: "right" },
  );

  // Client & Specifications Summary Card
  const cardY = headerY + 30;
  const cardHeight = 28;

  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, "FD");

  // Left Section: Prepared For
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.7);
  doc.circle(margin + 8, cardY + 7, 2, "D");
  doc.line(margin + 5.5, cardY + 12.5, margin + 10.5, cardY + 12.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text("QUOTATION PREPARED FOR:", margin + 14, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const clientName =
    clientInfo?.clientName ||
    clientInfo?.companyName ||
    "Walk-in Client / Customer";
  doc.text(clientName, margin + 14, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const contactText =
    [clientInfo?.phone, clientInfo?.email].filter(Boolean).join("  |  ") ||
    "Contact: N/A";
  doc.text(contactText, margin + 14, cardY + 20);

  // Right Section: Specs Summary
  const rightColX = margin + 95;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.7);
  doc.roundedRect(rightColX, cardY + 4.5, 5, 6.5, 0.6, 0.6, "D");
  doc.line(rightColX + 1.2, cardY + 6.8, rightColX + 3.8, cardY + 6.8);
  doc.line(rightColX + 1.2, cardY + 8.4, rightColX + 3.8, cardY + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(29, 78, 216);
  doc.text("ROLL-UP STANDEE SPECIFICATION:", rightColX + 8, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Fixed Machine Width: ${machineWidth} Ft (${machineWidth === 2.5 ? '30"' : '42"'})`,
    rightColX + 8,
    cardY + 13,
  );
  doc.text(
    `Standee Display Size: ${machineWidth}ft (W) × ${customHeight}ft (H) (${totalAreaSqFt} Sq.Ft.)`,
    rightColX + 8,
    cardY + 18,
  );
  doc.text(
    `Quantity: ${quantity} ${quantity === 1 ? "Unit" : "Units"}`,
    rightColX + 8,
    cardY + 23,
  );

  // Table
  const tableY = cardY + 34;
  const col1W = 12; // #
  const col2W = 74; // Item Description
  const col3W = 58; // Specifications / Rate
  const col4W = 36; // Total

  const x1 = margin;
  const x2 = x1 + col1W;
  const x3 = x2 + col2W;
  const x4 = x3 + col3W;
  const x5 = rightEdge;

  const tableHeaderH = 8.5;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, tableY, contentWidth, tableHeaderH, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("#", (x1 + x2) / 2, tableY + 5.5, { align: "center" });
  doc.text("ITEM DESCRIPTION", x2 + 3.5, tableY + 5.5);
  doc.text("SPECIFICATIONS / RATE", x3 + 3.5, tableY + 5.5);
  doc.text("TOTAL (Rs.)", x5 - 4, tableY + 5.5, { align: "right" });

  const rows = [];

  if (includeMachine) {
    rows.push({
      desc: machineName,
      spec: `${machineWidth} Ft base with spring roller, 3-section pole & padded carry bag`,
      total: `Rs. ${(machineCost * quantity).toLocaleString()}/-`,
    });
  }

  if (includeBanner) {
    rows.push({
      desc: `High-Definition Banner Printing (${mediaName})`,
      spec: `${machineWidth} Ft (W) × ${customHeight} Ft (H) = ${totalAreaSqFt} sqft @ Rs. ${flexRate}/sqft`,
      total: `Rs. ${(flexCost * quantity).toLocaleString()}/-`,
    });
  }

  let currentY = tableY + tableHeaderH;
  const rowHeight = 11.5;

  rows.forEach((row, idx) => {
    const isAlt = idx % 2 === 1;
    doc.setFillColor(isAlt ? 248 : 255, isAlt ? 250 : 255, isAlt ? 252 : 255);
    doc.rect(margin, currentY, contentWidth, rowHeight, "F");

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + rowHeight, rightEdge, currentY + rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(String(idx + 1), (x1 + x2) / 2, currentY + 7, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(row.desc, x2 + 3, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text(row.spec, x3 + 3, currentY + 7);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.8);
    doc.setTextColor(
      row.total === "INCLUDED" ? 16 : 15,
      row.total === "INCLUDED" ? 185 : 23,
      row.total === "INCLUDED" ? 129 : 42,
    );
    doc.text(row.total, x5 - 4, currentY + 7, { align: "right" });

    currentY += rowHeight;
  });

  // Bottom Section: Terms & Totals
  const bottomSectionY = currentY + 12;
  const termsBoxW = 98;
  const termsBoxH = 46;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, bottomSectionY, termsBoxW, termsBoxH, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  doc.setTextColor(30, 41, 59);
  doc.text("TERMS & CONDITIONS", margin + 5, bottomSectionY + 6.6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const terms = [
    "• Turnaround Time: Same Day / 24 Hours from print file approval.",
    "• Machine Base: Anodized Aluminium alloy with high-tension spring roller.",
    "• Graphic Substrate: Anti-curling synthetic media ensures flat display edges.",
    "• Carry Bag: Complimentary protective padded shoulder travel bag included.",
    "• Payment: 50% advance along with purchase confirmation.",
    "• Courier / Dispatch: Extra at actuals for delivery outside city limits.",
  ];

  terms.forEach((line, i) => {
    doc.text(line, margin + 4, bottomSectionY + 13 + i * 5);
  });

  // Right: Totals Box
  const totalsBoxX = margin + 104;
  const totalsBoxW = 76;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Gross Subtotal:", totalsBoxX + 2, bottomSectionY + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Rs. ${grossSubtotal.toLocaleString()}/-`,
    rightEdge - 3,
    bottomSectionY + 6,
    { align: "right" },
  );

  let totalsPayableY = bottomSectionY + 14;

  if (validDiscount > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(220, 38, 38);
    doc.text("Special Discount:", totalsBoxX + 2, bottomSectionY + 14);
    doc.setFontSize(9);
    doc.text(
      `- Rs. ${validDiscount.toLocaleString()}/-`,
      rightEdge - 3,
      bottomSectionY + 14,
      { align: "right" },
    );
    totalsPayableY = bottomSectionY + 22;
  }

  // Row: TOTAL AMOUNT PAYABLE Box (Rounded Blue)
  const payableBoxH = 13;
  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(37, 99, 235); // blue-600
  doc.setLineWidth(0.8);
  doc.roundedRect(
    totalsBoxX,
    totalsPayableY,
    totalsBoxW,
    payableBoxH,
    2,
    2,
    "FD",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text("TOTAL AMOUNT PAYABLE:", totalsBoxX + 4, totalsPayableY + 8);

  doc.setFontSize(11.5);
  doc.setTextColor(29, 78, 216);
  doc.text(
    `Rs. ${totalAmount.toLocaleString()}/-`,
    rightEdge - 4,
    totalsPayableY + 8.5,
    { align: "right" },
  );

  // Save & Download
  const filename = `A2V_Quotation_RollUpStandee_${quoteRef}.pdf`;
  doc.save(filename);

  try {
    return doc.output("bloburl");
  } catch {
    return null;
  }
}

/**
 * Generate Quotation PDF for Standee Hut (A-Frame Tent Display) (STD-003)
 */
export function generateStandieHutQuotationPdf(data) {
  const {
    standeeWidth = 2.5,
    standeeHeight = 4,
    totalHeight,
    legClearance = 1,
    flexWidth = 2.5,
    flexHeight = 4,
    singleSideFlexArea = 10,
    totalFlexArea = 20,
    isDoubleSided = true,
    frameType = "iron-3kg",
    frameName = "Iron Frame - Light (3 kg)",
    runningFt = 30,
    frameRate = 35,
    frameCost = 1050,
    hingesCount = 2,
    hingeRate = 15,
    hingesCost = 30,
    mediaId = "star-flex",
    mediaName = "Star Flex - High Gloss Finish",
    flexRate = 30,
    flexCost = 600,
    unitPrice = 1680,
    quantity = 1,
    grossSubtotal = 1680,
    validDiscount = 0,
    totalAmount = 1680,
    clientInfo = {},
  } = data;

  const totalFrameHeight =
    totalHeight ||
    parseFloat(
      (parseFloat(standeeHeight) + parseFloat(legClearance)).toFixed(2),
    );

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const contentWidth = 180;
  const rightEdge = margin + contentWidth;
  const quoteRef = `Q-HUT-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Outer Page Border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.roundedRect(10, 8, 190, 281, 2, 2, "D");

  // Top Header Banner (Deep Amber & Navy)
  const headerY = 14;
  const headerHeight = 26;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, headerY, contentWidth, headerHeight, 2, 2, "F");

  // Left Color Accent
  doc.setFillColor(217, 119, 6); // amber-600
  doc.rect(margin, headerY, 4, headerHeight, "F");

  // Company Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("A2V DIGI GRAPHICS", margin + 10, headerY + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(251, 191, 36); // amber-300
  doc.text(
    "LARGE FORMAT PRINTING  |  FABRICATED STANDEES  |  SIGNAGE SOLUTIONS",
    margin + 10,
    headerY + 18,
  );

  // Right Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("STANDEE HUT QUOTATION", rightEdge - 5, headerY + 9, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(253, 230, 138); // amber-200
  doc.text(
    `Ref: ${quoteRef}  |  Date: ${dateStr}`,
    rightEdge - 5,
    headerY + 16,
    { align: "right" },
  );

  // Client & Specs Summary Card
  const cardY = headerY + 30;
  const cardHeight = 30;

  doc.setFillColor(254, 243, 199); // amber-50
  doc.setDrawColor(252, 211, 77); // amber-300
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, "FD");

  // Left Section: Prepared For
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text("QUOTATION PREPARED FOR:", margin + 6, cardY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const clientNameStr =
    clientInfo?.clientName ||
    clientInfo?.companyName ||
    "Walk-in Client / Customer";
  doc.text(clientNameStr, margin + 6, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const contactText =
    [clientInfo?.phone, clientInfo?.email].filter(Boolean).join("  |  ") ||
    "Contact: N/A";
  doc.text(contactText, margin + 6, cardY + 21);

  // Right Section: Specs
  const rightColX = margin + 95;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text("STANDEE HUT SPECIFICATIONS:", rightColX, cardY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Hut Geometry: A-Frame Double-Sided Tent`, rightColX, cardY + 13);
  doc.text(
    `Total Height: ${standeeWidth}ft (W) × ${totalFrameHeight}ft (H) (${legClearance}ft Legs)`,
    rightColX,
    cardY + 18,
  );
  doc.text(
    `Flex Size: ${flexWidth}ft (W) × ${flexHeight}ft (H) (${totalFlexArea} Sq.Ft.)`,
    rightColX,
    cardY + 23,
  );

  // Table
  const tableY = cardY + 35;
  const col1W = 12;
  const col2W = 76;
  const col3W = 56;
  const col4W = 36;

  const x1 = margin;
  const x2 = x1 + col1W;
  const x3 = x2 + col2W;
  const x4 = x3 + col3W;
  const x5 = rightEdge;

  const tableHeaderH = 8.5;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, tableY, contentWidth, tableHeaderH, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("#", (x1 + x2) / 2, tableY + 5.5, { align: "center" });
  doc.text("ITEM DESCRIPTION", x2 + 3.5, tableY + 5.5);
  doc.text("SPECIFICATIONS / RATE", x3 + 3.5, tableY + 5.5);
  doc.text("TOTAL (Rs.)", x5 - 4, tableY + 5.5, { align: "right" });

  const rows = [
    {
      num: "1",
      title: "A-Frame Hut Structure Fabrication",
      subtitle: `${frameName} (2 Faces / Tent Structure)`,
      spec: `${runningFt} Running Ft @ Rs. ${frameRate}/ft`,
      subSpec: `2 faces × (2×${totalFrameHeight} + 2×${standeeWidth} ft) = ${runningFt} ft`,
      amount: `Rs. ${frameCost.toLocaleString()}`,
    },
    {
      num: "2",
      title: "Flex Banner Graphic Printing",
      subtitle: `${mediaName} (${isDoubleSided ? "Double-Sided Tent" : "Single-Sided"})`,
      spec: `${totalFlexArea} Sq.Ft. @ Rs. ${flexRate}/sqft`,
      subSpec: `Flex display area: ${flexWidth}ft × ${flexHeight}ft per side`,
      amount: `Rs. ${flexCost.toLocaleString()}`,
    },
    {
      num: "3",
      title: "Top Apex Hinges Hardware",
      subtitle: "Heavy-duty folding hinges for A-frame apex joint",
      spec: `${hingesCount} Pcs @ Rs. ${hingeRate}/pc`,
      subSpec:
        "High stability metal folding hinges connecting front & back frames",
      amount: `Rs. ${hingesCost.toLocaleString()}`,
    },
  ];

  let currentY = tableY + tableHeaderH;
  const rowH = 15;

  rows.forEach((row, i) => {
    doc.setFillColor(
      i % 2 === 0 ? 255 : 248,
      i % 2 === 0 ? 255 : 250,
      i % 2 === 0 ? 255 : 252,
    );
    doc.rect(margin, currentY, contentWidth, rowH, "F");

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY + rowH, rightEdge, currentY + rowH);

    // Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(row.num, (x1 + x2) / 2, currentY + 6.5, { align: "center" });

    // Title & Subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(row.title, x2 + 3.5, currentY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(row.subtitle, x2 + 3.5, currentY + 10.5);

    // Spec & SubSpec
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(row.spec, x3 + 3.5, currentY + 5.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(row.subSpec, x3 + 3.5, currentY + 10.5);

    // Amount
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(
      row.amount === "INCLUDED" ? 16 : 15,
      row.amount === "INCLUDED" ? 185 : 23,
      row.amount === "INCLUDED" ? 129 : 42,
    );
    doc.text(row.amount, x5 - 4, currentY + 7, { align: "right" });

    currentY += rowH;
  });

  // Table Outer Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.rect(margin, tableY, contentWidth, currentY - tableY, "D");

  // Summary Totals Box
  const totalsY = currentY + 6;
  const notesW = 95;
  const totalsBoxX = margin + notesW + 5;
  const totalsBoxW = contentWidth - notesW - 5;

  // Left: Specifications & Bank Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, totalsY, notesW, 46, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text("TERMS & SPECIAL NOTES:", margin + 4, totalsY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "• Foldable A-Frame Hut standee for effortless storage & transit.",
    margin + 4,
    totalsY + 11.5,
  );
  doc.text(
    "• Dual-sided viewing maximizes pedestrian walk-by visibility.",
    margin + 4,
    totalsY + 16.5,
  );
  doc.text(
    "• Weather-resistant solvent / eco-solvent UV-cure printing.",
    margin + 4,
    totalsY + 21.5,
  );
  doc.text(
    "• 50% advance required for custom fabrication; balance on dispatch.",
    margin + 4,
    totalsY + 26.5,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(180, 83, 9);
  doc.text("BANK TRANSFER / UPI:", margin + 4, totalsY + 34);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "A2V Digi Graphics  |  Bank: HDFC Bank  |  UPI: a2vgroups@upi",
    margin + 4,
    totalsY + 39.5,
  );

  // Right: Price Breakdown
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(totalsBoxX, totalsY, totalsBoxW, 30, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Subtotal (${quantity} ${quantity === 1 ? "Unit" : "Units"}):`,
    totalsBoxX + 4,
    totalsY + 8,
  );
  doc.text(
    `Rs. ${grossSubtotal.toLocaleString()}`,
    rightEdge - 4,
    totalsY + 8,
    { align: "right" },
  );

  doc.text("Special Discount:", totalsBoxX + 4, totalsY + 16);
  doc.setTextColor(
    validDiscount > 0 ? 16 : 71,
    validDiscount > 0 ? 185 : 85,
    validDiscount > 0 ? 129 : 105,
  );
  doc.text(
    validDiscount > 0 ? `- Rs. ${validDiscount.toLocaleString()}` : "Rs. 0",
    rightEdge - 4,
    totalsY + 16,
    { align: "right" },
  );

  doc.setTextColor(71, 85, 105);
  doc.text("GST / Taxes:", totalsBoxX + 4, totalsY + 24);
  doc.text("Extra as applicable", rightEdge - 4, totalsY + 24, {
    align: "right",
  });

  // Grand Total Payable Box
  const totalsPayableY = totalsY + 33;
  const payableBoxH = 13;

  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.8);
  doc.roundedRect(
    totalsBoxX,
    totalsPayableY,
    totalsBoxW,
    payableBoxH,
    2,
    2,
    "FD",
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9);
  doc.text("TOTAL AMOUNT PAYABLE:", totalsBoxX + 4, totalsPayableY + 8);

  doc.setFontSize(11.5);
  doc.setTextColor(180, 83, 9);
  doc.text(
    `Rs. ${totalAmount.toLocaleString()}/-`,
    rightEdge - 4,
    totalsPayableY + 8.5,
    { align: "right" },
  );

  // Save & Download
  const filename = `A2V_Quotation_StandeeHut_${quoteRef}.pdf`;
  doc.save(filename);

  try {
    return doc.output("bloburl");
  } catch {
    return null;
  }
}

/**
 * Generate Official Quotation PDF for General Products (Pamphlets, Visiting Cards, Posters, Flyers, Brochures, Letterheads, Envelopes, etc.)
 */
export function generateGeneralProductQuotationPdf(data) {
  const {
    productName = "Commercial Printing Order",
    productCode = "",
    selectedVariant = "",
    selectedOptions = {},
    quantity = 1,
    unitName = "Pieces",
    applicableCost = 0,
    validDiscount = 0,
    totalAmount = 0,
    clientInfo = {},
    specifications = {},
  } = data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const contentWidth = 180;
  const rightEdge = margin + contentWidth;
  const quoteRef = `Q-PRD-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // 0. OUTER PAGE BORDER / FRAME
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.6);
  doc.roundedRect(10, 8, 190, 281, 2, 2, "D");

  // 1. TOP HEADER BANNER (Deep Navy with Orange Accent)
  const headerY = 14;
  const headerHeight = 25;

  // Base Dark Blue / Navy
  doc.setFillColor(11, 25, 44); // #0B192C deep navy
  doc.rect(margin, headerY, contentWidth, headerHeight, "F");

  // Warm Orange Accent Triangle on the right
  doc.setFillColor(194, 65, 12); // #C2410C orange-700
  doc.triangle(
    rightEdge - 30,
    headerY,
    rightEdge,
    headerY,
    rightEdge,
    headerY + headerHeight,
    "F"
  );

  // Logo: "A2V" in bold White, "PRINTS" in Orange
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("A2V", margin + 7, headerY + 12);

  const a2vWidth = doc.getTextWidth("A2V ");
  doc.setTextColor(249, 115, 22); // #F97316 orange-500
  doc.text("PRINTS", margin + 7 + a2vWidth, headerY + 12);

  // Orange underline accent beneath A2V
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(1.2);
  doc.line(
    margin + 7,
    headerY + 14.5,
    margin + 7 + a2vWidth + 4,
    headerY + 14.5
  );

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text(
    "Commercial Offset & Digital Printing Solutions",
    margin + 7,
    headerY + 20
  );

  // Right Header: Document icon in orange
  const iconX = rightEdge - 78;
  const iconY = headerY + 5;
  doc.setDrawColor(249, 115, 22); // orange-500
  doc.setLineWidth(0.8);
  doc.roundedRect(iconX, iconY, 8.5, 11, 1, 1, "D");
  doc.line(iconX + 2, iconY + 3.2, iconX + 6.5, iconY + 3.2);
  doc.line(iconX + 2, iconY + 5.7, iconX + 6.5, iconY + 5.7);
  doc.line(iconX + 2, iconY + 8.2, iconX + 5, iconY + 8.2);

  // Right Header: Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("OFFICIAL QUOTATION", rightEdge - 5, headerY + 9, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(254, 215, 170); // orange-200
  doc.text(
    `Ref: ${quoteRef}  |  Date: ${dateStr}`,
    rightEdge - 5,
    headerY + 16,
    { align: "right" }
  );

  // 2. CLIENT & SPECIFICATIONS SUMMARY CARD
  const cardY = headerY + 30;
  const cardHeight = 28;

  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(254, 215, 170); // #FED7AA orange-200
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, "FD");

  // Left Section: QUOTATION PREPARED FOR
  doc.setDrawColor(234, 88, 12); // orange-600
  doc.setLineWidth(0.7);
  doc.circle(margin + 8, cardY + 7, 2, "D");
  doc.line(margin + 5.5, cardY + 12.5, margin + 10.5, cardY + 12.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("QUOTATION PREPARED FOR:", margin + 14, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  const clientNameStr =
    clientInfo?.clientName ||
    clientInfo?.companyName ||
    "Walk-in Client / Customer";
  doc.text(clientNameStr, margin + 14, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  const contactText =
    [clientInfo?.phone ? `Phone: ${clientInfo.phone}` : null, clientInfo?.email]
      .filter(Boolean)
      .join("  |  ") || "Contact: N/A";
  doc.text(contactText, margin + 14, cardY + 21);

  // Right Section: SPECIFICATION SUMMARY
  const rightColX = margin + 95;
  doc.setDrawColor(234, 88, 12); // orange-600
  doc.setLineWidth(0.7);
  doc.roundedRect(rightColX, cardY + 4.5, 5, 6.5, 0.6, 0.6, "D");
  doc.line(rightColX + 1.2, cardY + 6.8, rightColX + 3.8, cardY + 6.8);
  doc.line(rightColX + 1.2, cardY + 8.4, rightColX + 3.8, cardY + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("PRODUCT OVERVIEW:", rightColX + 8, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(
    `Product: ${productName}${productCode ? ` (#${productCode})` : ""}`,
    rightColX + 8,
    cardY + 13
  );

  const cleanVariant = selectedVariant ? String(selectedVariant).slice(0, 42) : productName;
  doc.text(
    `Selected: ${cleanVariant}`,
    rightColX + 8,
    cardY + 18
  );
  doc.text(
    `Quantity: ${Number(quantity).toLocaleString()} ${unitName || "Pieces"}`,
    rightColX + 8,
    cardY + 23
  );

  // 3. ITEMIZED COST BREAKDOWN TABLE (Product Name, Quantity, Price only)
  const tableY = cardY + 34;
  const col1W = 12; // #
  const col2W = 108; // Product Name
  const col3W = 30; // Quantity
  const col4W = 30; // Price (Rs.)

  const x1 = margin;
  const x2 = x1 + col1W;
  const x3 = x2 + col2W;
  const x4 = x3 + col3W;
  const x5 = rightEdge;

  // Table Header
  const tableHeaderH = 9;
  doc.setFillColor(11, 25, 44); // #0B192C navy
  doc.rect(margin, tableY, contentWidth, tableHeaderH, "F");

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(x2, tableY, x2, tableY + tableHeaderH);
  doc.line(x3, tableY, x3, tableY + tableHeaderH);
  doc.line(x4, tableY, x4, tableY + tableHeaderH);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("#", (x1 + x2) / 2, tableY + 6, { align: "center" });
  doc.text("PRODUCT NAME", x2 + 4, tableY + 6);
  doc.text("QUANTITY", (x3 + x4) / 2, tableY + 6, { align: "center" });
  doc.text("PRICE (Rs.)", x5 - 4, tableY + 6, { align: "right" });

  // Product Name Formatting
  const fullProductName = selectedVariant
    ? selectedVariant.toLowerCase().includes(productName.toLowerCase())
      ? selectedVariant
      : `${productName} - ${selectedVariant}`
    : productName;

  const optionsSubtitle = Object.entries(selectedOptions || {})
    .filter(([_, val]) => Boolean(val))
    .map(([key, val]) => `${key}: ${val}`)
    .join("  |  ");

  const rowHeight = optionsSubtitle ? 14 : 10;
  let currentY = tableY + tableHeaderH;

  // Row Background
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, contentWidth, rowHeight, "F");

  // Grid Borders
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(x1, currentY + rowHeight, x5, currentY + rowHeight);
  doc.line(x1, currentY, x1, currentY + rowHeight);
  doc.line(x2, currentY, x2, currentY + rowHeight);
  doc.line(x3, currentY, x3, currentY + rowHeight);
  doc.line(x4, currentY, x4, currentY + rowHeight);
  doc.line(x5, currentY, x5, currentY + rowHeight);

  // #
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("1", (x1 + x2) / 2, currentY + (optionsSubtitle ? 7.5 : 6), {
    align: "center",
  });

  // PRODUCT NAME
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const truncatedName = doc.splitTextToSize(fullProductName, col2W - 8)[0] || fullProductName;
  doc.text(truncatedName, x2 + 4, currentY + (optionsSubtitle ? 5.5 : 6));

  if (optionsSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const truncatedOptions = doc.splitTextToSize(optionsSubtitle, col2W - 8)[0] || optionsSubtitle;
    doc.text(truncatedOptions, x2 + 4, currentY + 10.5);
  }

  // QUANTITY
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `${Number(quantity).toLocaleString()} ${unitName || "Pieces"}`,
    (x3 + x4) / 2,
    currentY + (optionsSubtitle ? 7.5 : 6),
    { align: "center" }
  );

  // PRICE (Rs.)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Rs. ${applicableCost.toLocaleString()}/-`,
    x5 - 4,
    currentY + (optionsSubtitle ? 7.5 : 6),
    { align: "right" }
  );

  currentY += rowHeight;

  // Table Outer Border
  doc.setDrawColor(11, 25, 44);
  doc.setLineWidth(0.4);
  doc.rect(margin, tableY, contentWidth, currentY - tableY, "D");

  // 4. BOTTOM SECTION: TOTALS SUMMARY (RIGHT-ALIGNED)
  const bottomSectionY = currentY + 10;
  const totalsBoxW = 88;
  const totalsBoxX = rightEdge - totalsBoxW;

  // Applicable Cost
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Applicable Cost:", totalsBoxX + 2, bottomSectionY + 6);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Rs. ${applicableCost.toLocaleString()}/-`,
    rightEdge - 3,
    bottomSectionY + 6,
    { align: "right" }
  );

  let totalsPayableY = bottomSectionY + 12;

  // Special Discount Row
  if (validDiscount > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12); // orange-600
    doc.text("Special Discount:", totalsBoxX + 2, bottomSectionY + 14);
    doc.setFontSize(9);
    doc.text(
      `- Rs. ${validDiscount.toLocaleString()}/-`,
      rightEdge - 3,
      bottomSectionY + 14,
      { align: "right" }
    );
    totalsPayableY = bottomSectionY + 20;
  }

  // Row: TOTAL AMOUNT PAYABLE Box (Rounded Orange)
  const payableBoxH = 13;
  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(0.8);
  doc.roundedRect(
    totalsBoxX,
    totalsPayableY,
    totalsBoxW,
    payableBoxH,
    2,
    2,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("AMOUNT PAYABLE:", totalsBoxX + 3.5, totalsPayableY + 8);

  doc.setFontSize(11);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text(
    `Rs. ${totalAmount.toLocaleString()}/-`,
    rightEdge - 3.5,
    totalsPayableY + 8.5,
    { align: "right" }
  );

  // 5. SAVE & DOWNLOAD FILE
  const sanitizedName = (productName || "Product").replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `A2V_Quotation_${sanitizedName}_${quoteRef}.pdf`;
  doc.save(filename);

  try {
    return doc.output("bloburl");
  } catch {
    return null;
  }
}

/**
 * Generate Official Quotation PDF for Stickers & Labels (Sticker Sheet Calculator)
 */
export function generateStickerQuotationPdf(data) {
  const {
    productName = "Stickers & Labels Printing",
    sheetName = "12 × 18 Inches",
    stickerWidth = 2,
    stickerHeight = 2,
    shape = "Rectangle",
    materialName = "Chromo Paper (Gloss Gumming)",
    cutName = "Half Cut / Kiss Cut",
    laminationName = "No Lamination",
    sheetsNeeded = 25,
    actualStickers = 1000,
    stickersPerSheet = 40,
    costPerSheet = 20,
    grossSubtotal = 500,
    validDiscount = 0,
    totalAmount = 500,
    pricePerSticker = 0.5,
    clientInfo = {},
  } = data;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const contentWidth = 180;
  const rightEdge = margin + contentWidth;
  const quoteRef = `Q-STK-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // 0. OUTER PAGE BORDER / FRAME
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.roundedRect(10, 8, 190, 281, 2, 2, "D");

  // 1. TOP HEADER BANNER
  const headerY = 14;
  const headerHeight = 25;
  doc.setFillColor(11, 25, 44);
  doc.rect(margin, headerY, contentWidth, headerHeight, "F");

  doc.setFillColor(194, 65, 12);
  doc.triangle(
    rightEdge - 30,
    headerY,
    rightEdge,
    headerY,
    rightEdge,
    headerY + headerHeight,
    "F"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("A2V", margin + 7, headerY + 12);

  const a2vWidth = doc.getTextWidth("A2V ");
  doc.setTextColor(249, 115, 22);
  doc.text("PRINTS", margin + 7 + a2vWidth, headerY + 12);

  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(1.2);
  doc.line(
    margin + 7,
    headerY + 14.5,
    margin + 7 + a2vWidth + 4,
    headerY + 14.5
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240);
  doc.text(
    "Custom Stickers, Product Labels & Decals Solutions",
    margin + 7,
    headerY + 20
  );

  // Right Header Text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text("STICKERS ESTIMATE", rightEdge - 5, headerY + 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(254, 215, 170);
  doc.text(
    `Ref: ${quoteRef}  |  Date: ${dateStr}`,
    rightEdge - 5,
    headerY + 16,
    { align: "right" }
  );

  // 2. CLIENT & SPECIFICATIONS SUMMARY CARD
  const cardY = headerY + 30;
  const cardHeight = 28;

  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, cardY, contentWidth, cardHeight, 2, 2, "FD");

  // Left Section: Prepared For
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.7);
  doc.circle(margin + 8, cardY + 7, 2, "D");
  doc.line(margin + 5.5, cardY + 12.5, margin + 10.5, cardY + 12.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12);
  doc.text("QUOTATION PREPARED FOR:", margin + 14, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  const clientNameStr =
    clientInfo?.clientName ||
    clientInfo?.companyName ||
    "Walk-in Client / Customer";
  doc.text(clientNameStr, margin + 14, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const contactText =
    [clientInfo?.phone ? `Phone: ${clientInfo.phone}` : null, clientInfo?.email]
      .filter(Boolean)
      .join("  |  ") || "Contact: N/A";
  doc.text(contactText, margin + 14, cardY + 21);

  // Right Section: Specs Summary
  const rightColX = margin + 95;
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.7);
  doc.roundedRect(rightColX, cardY + 4.5, 5, 6.5, 0.6, 0.6, "D");
  doc.line(rightColX + 1.2, cardY + 6.8, rightColX + 3.8, cardY + 6.8);
  doc.line(rightColX + 1.2, cardY + 8.4, rightColX + 3.8, cardY + 8.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12);
  doc.text("STICKER SPECIFICATIONS:", rightColX + 8, cardY + 7.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Size: ${stickerWidth}" × ${stickerHeight}" (${shape})`,
    rightColX + 8,
    cardY + 13
  );
  doc.text(
    `Sheet Size: ${sheetName} (${stickersPerSheet} pcs/sheet)`,
    rightColX + 8,
    cardY + 18
  );
  doc.text(
    `Yield: ${Number(actualStickers).toLocaleString()} Stickers (${sheetsNeeded} Sheets)`,
    rightColX + 8,
    cardY + 23
  );

  // 3. TABLE (Product Name, Quantity, Price only)
  const tableY = cardY + 34;
  const col1W = 12; // #
  const col2W = 108; // Product Name
  const col3W = 30; // Quantity
  const col4W = 30; // Price (Rs.)

  const x1 = margin;
  const x2 = x1 + col1W;
  const x3 = x2 + col2W;
  const x4 = x3 + col3W;
  const x5 = rightEdge;

  const tableHeaderH = 9;
  doc.setFillColor(11, 25, 44);
  doc.rect(margin, tableY, contentWidth, tableHeaderH, "F");

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(x2, tableY, x2, tableY + tableHeaderH);
  doc.line(x3, tableY, x3, tableY + tableHeaderH);
  doc.line(x4, tableY, x4, tableY + tableHeaderH);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("#", (x1 + x2) / 2, tableY + 6, { align: "center" });
  doc.text("PRODUCT NAME", x2 + 4, tableY + 6);
  doc.text("QUANTITY", (x3 + x4) / 2, tableY + 6, { align: "center" });
  doc.text("PRICE (Rs.)", x5 - 4, tableY + 6, { align: "right" });

  const fullStickerName = `${productName} - ${materialName}`;
  const stickerSubtitle = `${stickerWidth}" × ${stickerHeight}" (${shape})  |  ${cutName}${laminationName && laminationName !== "No Lamination" ? `  |  ${laminationName}` : ""}`;

  const rowHeight = stickerSubtitle ? 14 : 10;
  let currentY = tableY + tableHeaderH;

  doc.setFillColor(255, 255, 255);
  doc.rect(margin, currentY, contentWidth, rowHeight, "F");

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(x1, currentY + rowHeight, x5, currentY + rowHeight);
  doc.line(x1, currentY, x1, currentY + rowHeight);
  doc.line(x2, currentY, x2, currentY + rowHeight);
  doc.line(x3, currentY, x3, currentY + rowHeight);
  doc.line(x4, currentY, x4, currentY + rowHeight);
  doc.line(x5, currentY, x5, currentY + rowHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("1", (x1 + x2) / 2, currentY + (stickerSubtitle ? 7.5 : 6), { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const truncatedStickerName = doc.splitTextToSize(fullStickerName, col2W - 8)[0] || fullStickerName;
  doc.text(truncatedStickerName, x2 + 4, currentY + (stickerSubtitle ? 5.5 : 6));

  if (stickerSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const truncatedSubtitle = doc.splitTextToSize(stickerSubtitle, col2W - 8)[0] || stickerSubtitle;
    doc.text(truncatedSubtitle, x2 + 4, currentY + 10.5);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `${Number(actualStickers).toLocaleString()} Stickers (${sheetsNeeded} Sheets)`,
    (x3 + x4) / 2,
    currentY + (stickerSubtitle ? 7.5 : 6),
    { align: "center" }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Rs. ${grossSubtotal.toLocaleString()}/-`,
    x5 - 4,
    currentY + (stickerSubtitle ? 7.5 : 6),
    { align: "right" }
  );

  currentY += rowHeight;

  doc.setDrawColor(11, 25, 44);
  doc.setLineWidth(0.4);
  doc.rect(margin, tableY, contentWidth, currentY - tableY, "D");

  // 4. BOTTOM SECTION: TOTALS SUMMARY (RIGHT-ALIGNED)
  const bottomSectionY = currentY + 10;
  const totalsBoxW = 88;
  const totalsBoxX = rightEdge - totalsBoxW;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Applicable Cost:", totalsBoxX + 2, bottomSectionY + 6);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Rs. ${grossSubtotal.toLocaleString()}/-`,
    rightEdge - 3,
    bottomSectionY + 6,
    { align: "right" }
  );

  let totalsPayableY = bottomSectionY + 12;

  if (validDiscount > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12);
    doc.text("Special Discount:", totalsBoxX + 2, bottomSectionY + 14);
    doc.setFontSize(9);
    doc.text(
      `- Rs. ${validDiscount.toLocaleString()}/-`,
      rightEdge - 3,
      bottomSectionY + 14,
      { align: "right" }
    );
    totalsPayableY = bottomSectionY + 20;
  }

  const payableBoxH = 13;
  doc.setFillColor(255, 247, 237);
  doc.setDrawColor(234, 88, 12);
  doc.setLineWidth(0.8);
  doc.roundedRect(
    totalsBoxX,
    totalsPayableY,
    totalsBoxW,
    payableBoxH,
    2,
    2,
    "FD"
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(194, 65, 12);
  doc.text("AMOUNT PAYABLE:", totalsBoxX + 3.5, totalsPayableY + 8);

  doc.setFontSize(11);
  doc.setTextColor(194, 65, 12);
  doc.text(
    `Rs. ${totalAmount.toLocaleString()}/-`,
    rightEdge - 3.5,
    totalsPayableY + 8.5,
    { align: "right" }
  );

  const filename = `A2V_Quotation_Stickers_${quoteRef}.pdf`;
  doc.save(filename);

  try {
    return doc.output("bloburl");
  } catch {
    return null;
  }
}

