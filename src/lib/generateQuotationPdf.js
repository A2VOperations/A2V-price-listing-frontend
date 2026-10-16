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
    rightEdge - 30, headerY,
    rightEdge, headerY,
    rightEdge, headerY + headerHeight,
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
  doc.line(margin + 7, headerY + 14.5, margin + 7 + a2vWidth + 4, headerY + 14.5);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text("Premium Flex Board Printing & Framing Solutions", margin + 7, headerY + 20);

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
  doc.text("QUOTATION ESTIMATE", rightEdge - 5, headerY + 9, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(254, 215, 170); // orange-200
  doc.text(`Ref: ${quoteRef}  |  Date: ${dateStr}`, rightEdge - 5, headerY + 16, { align: "right" });

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
  const clientName = clientInfo?.clientName || clientInfo?.companyName || "Walk-in Client / Customer";
  doc.text(clientName, margin + 14, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  const contactText = [clientInfo?.phone, clientInfo?.email].filter(Boolean).join("  |  ") || "Contact: N/A";
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
  doc.text(`Size: ${validHeight} ft x ${validWidth} ft (${flexAreaSqFt} sq. ft.)`, rightColX + 8, cardY + 13);
  doc.text(`Media: ${activeMaterial?.name || "Flex"}`, rightColX + 8, cardY + 18);
  doc.text(`Quantity: ${quantity} ${quantity === 1 ? "Board" : "Boards"}`, rightColX + 8, cardY + 23);

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
    doc.setFillColor(isEven ? 255 : 255, isEven ? 255 : 250, isEven ? 255 : 245); // alternating white / soft cream
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
    doc.text(String(idx + 1), (x1 + x2) / 2, currentY + 5.5, { align: "center" });

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
    doc.line(margin + 14, bottomSectionY + 11, margin + frameBoxW - 4, bottomSectionY + 11);

    // Detail lines
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const perimeterFormula = `2 x (${validHeight} + ${validWidth}) = ${validHeight * 2 + validWidth * 2} ft`;
    doc.text(`Outer Perimeter: ${perimeterFormula}`, margin + 14, bottomSectionY + 17);

    const supportRodDetail = hasSupportRod === "Yes" && supportRodCount > 0
      ? `${runningFeetDetails.supportRunningFeet || 0} ft (${supportRodCount} ${supportRodType})`
      : "Not Required (0 ft)";
    doc.text(`Support Rods: ${supportRodDetail}`, margin + 14, bottomSectionY + 23);

    doc.text(`Total Running Ft: ${runningFeetDetails.totalRunningFeet || 0} ft`, margin + 14, bottomSectionY + 29);
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
  doc.text(`Rs. ${grossSubtotal.toLocaleString()}/-`, rightEdge - 3, bottomSectionY + 6, { align: "right" });

  // Row: Special Discount Deducted (if any)
  let totalsPayableY = bottomSectionY + 12;
  if (validDiscount > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12); // #EA580C orange-600
    doc.text("Special Discount Deducted:", totalsBoxX + 2, bottomSectionY + 14);
    doc.setFontSize(9);
    doc.text(`- Rs. ${validDiscount.toLocaleString()}/-`, rightEdge - 3, bottomSectionY + 14, { align: "right" });
    totalsPayableY = bottomSectionY + 20;
  }

  // Row: TOTAL AMOUNT PAYABLE Box (Rounded Orange)
  const payableBoxH = 13;
  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(0.8);
  doc.roundedRect(totalsBoxX, totalsPayableY, totalsBoxW, payableBoxH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("TOTAL AMOUNT PAYABLE:", totalsBoxX + 4, totalsPayableY + 8);

  doc.setFontSize(11.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text(`Rs. ${totalAmount.toLocaleString()}/-`, rightEdge - 4, totalsPayableY + 8.5, { align: "right" });

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
    standeeSize = "2.5 x 6 Ft",
    validWidth = 2.5,
    validHeight = 6,
    areaSqFt = 15,
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
    productName = "Roll-Up Standie Display",
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
    rightEdge - 30, headerY,
    rightEdge, headerY,
    rightEdge, headerY + headerHeight,
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
  doc.line(margin + 7, headerY + 14.5, margin + 7 + a2vWidth + 4, headerY + 14.5);

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text("Roll-Up Standee & Portable Promotional Displays", margin + 7, headerY + 20);

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
  doc.text(`Ref: ${quoteRef}  |  Date: ${dateStr}`, rightEdge - 5, headerY + 16, { align: "right" });

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
  const clientName = clientInfo?.clientName || clientInfo?.companyName || "Walk-in Client / Customer";
  doc.text(clientName, margin + 14, cardY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  const contactText = [clientInfo?.phone, clientInfo?.email].filter(Boolean).join("  |  ") || "Contact: N/A";
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

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`Model: ${productName}`, rightColX + 8, cardY + 13);
  doc.text(`Size: ${standeeSize} (${areaSqFt} sq. ft.)`, rightColX + 8, cardY + 18);
  doc.text(`Quantity: ${quantity} ${quantity === 1 ? "Unit" : "Units"}`, rightColX + 8, cardY + 23);

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

  // Stand hardware
  if (activeStand && activeStand.name !== "None (Print Only)") {
    rows.push({
      desc: activeStand.name,
      spec: `Hardware Unit with Padded Bag @ Rs. ${activeStand.price}/unit`,
      total: `Rs. ${(standCostPerUnit * quantity).toLocaleString()}/-`,
    });
  }

  // Media Printing
  if (activeMedia && activeMedia.name !== "No Print (Hardware Only)") {
    rows.push({
      desc: `Graphic Banner Printing (${activeMedia.name})`,
      spec: `${areaSqFt} sqft @ Rs. ${activeMedia.pricePerSqFt}/sqft`,
      total: `Rs. ${(mediaCostPerUnit * quantity).toLocaleString()}/-`,
    });
  }

  // Lamination
  if (activeLamination && activeLamination.name !== "None") {
    rows.push({
      desc: `Protective Surface ${activeLamination.name}`,
      spec: `${areaSqFt} sqft @ Rs. ${activeLamination.pricePerSqFt}/sqft`,
      total: `Rs. ${(laminationCostPerUnit * quantity).toLocaleString()}/-`,
    });
  }

  // Design Assistance
  if (activeDesign && activeDesign.fee > 0) {
    rows.push({
      desc: `Artwork & Design (${activeDesign.name})`,
      spec: "Professional graphic layout & typesetting",
      total: `Rs. ${designCostTotal.toLocaleString()}/-`,
    });
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
    "• Turnaround Time: 24 Hours from print-ready file approval.",
    "• Hardware: Premium silver aluminium casing with foldable support rod.",
    "• Carry Case: Protective nylon carry bag included with each stand.",
    "• Printing: Vivid UV / Eco-Solvent digital print on specified media.",
    "• Payment: 50% advance along with confirmed purchase order.",
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
  doc.text(`Rs. ${grossSubtotal.toLocaleString()}/-`, rightEdge - 3, bottomSectionY + 6, { align: "right" });

  let totalsPayableY = bottomSectionY + 14;

  if (validDiscount > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(234, 88, 12); // orange-600
    doc.text("Special Discount:", totalsBoxX + 2, bottomSectionY + 14);
    doc.setFontSize(9);
    doc.text(`- Rs. ${validDiscount.toLocaleString()}/-`, rightEdge - 3, bottomSectionY + 14, { align: "right" });
    totalsPayableY = bottomSectionY + 22;
  }

  // Row: TOTAL AMOUNT PAYABLE Box (Rounded Orange)
  const payableBoxH = 13;
  doc.setFillColor(255, 247, 237); // #FFF7ED orange-50
  doc.setDrawColor(234, 88, 12); // #EA580C orange-600
  doc.setLineWidth(0.8);
  doc.roundedRect(totalsBoxX, totalsPayableY, totalsBoxW, payableBoxH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text("TOTAL AMOUNT PAYABLE:", totalsBoxX + 4, totalsPayableY + 8);

  doc.setFontSize(11.5);
  doc.setTextColor(194, 65, 12); // orange-700
  doc.text(`Rs. ${totalAmount.toLocaleString()}/-`, rightEdge - 4, totalsPayableY + 8.5, { align: "right" });

  // 5. SAVE & DOWNLOAD FILE
  const filename = `A2V_Quotation_Standee_${quoteRef}.pdf`;
  doc.save(filename);

  try {
    return doc.output("bloburl");
  } catch {
    return null;
  }
}

