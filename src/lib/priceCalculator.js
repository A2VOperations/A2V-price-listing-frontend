/**
 * Pricing Calculation Engine for A2V PRINTS
 *
 * Supports:
 * - Base price lookup
 * - Quantity tiered pricing
 * - Dynamic option price adjustments (Fixed additions & Percentage multipliers)
 * - Cross-Attribute Combination Matrix pricing (per attribute & per quantity)
 * - Subtotal computation
 * - Configurable GST (default 18%)
 * - Final price calculation & Last Price computation
 */

export function calculateProductPrice({
  product,
  selectedOptions = {},
  quantity = 1,
  customBasePrice = null,
  customPriceOverride = null,
  gstRate = 0,
}) {
  if (!product) return null;

  if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
    return {
      quantity: 0,
      unitPrice: 0,
      optionsTotal: 0,
      optionsLastPriceTotal: 0,
      combinationPrice: null,
      combinationLastPrice: 0,
      matchedCombination: null,
      subtotal: 0,
      gstAmount: 0,
      totalAmount: 0,
      optionDetails: [],
    };
  }

  const effectiveQty =
    product.quantityType === "select"
      ? Number(quantity)
      : Math.max(Number(quantity), product.minQuantity || 1);

  // 1. Determine Base Price & Base Last Price
  let unitPrice =
    customBasePrice !== null ? customBasePrice : (product.basePrice || 0);
  let baseLastPrice = 0;

  // If product uses dropdown select mode with predefined fixed quantities & particular prices
  if (
    customBasePrice === null &&
    product.quantityType === "select" &&
    Array.isArray(product.fixedQuantities) &&
    product.fixedQuantities.length > 0
  ) {
    const matched = product.fixedQuantities.find(
      (fq) => Number(fq.qty) === effectiveQty
    );
    if (matched) {
      unitPrice = Number(matched.price);
      if (
        matched.lastPrice !== undefined &&
        matched.lastPrice !== null &&
        matched.lastPrice !== "" &&
        !isNaN(Number(matched.lastPrice))
      ) {
        baseLastPrice = Number(matched.lastPrice);
      }
    } else {
      // Find nearest or calculate unit rate per card/piece (e.g. 1000, 2000, 3000, 50000)
      const sorted = [...product.fixedQuantities].sort(
        (a, b) => Number(a.qty) - Number(b.qty)
      );
      const exactOrBelow = [...sorted]
        .reverse()
        .find((fq) => effectiveQty >= Number(fq.qty));

      if (exactOrBelow) {
        unitPrice =
          (Number(exactOrBelow.price) / Number(exactOrBelow.qty)) * effectiveQty;
        if (
          exactOrBelow.lastPrice !== undefined &&
          exactOrBelow.lastPrice !== "" &&
          !isNaN(Number(exactOrBelow.lastPrice))
        ) {
          baseLastPrice =
            (Number(exactOrBelow.lastPrice) / Number(exactOrBelow.qty)) *
            effectiveQty;
        }
      } else {
        unitPrice =
          (Number(sorted[0].price) / Number(sorted[0].qty)) * effectiveQty;
        if (
          sorted[0].lastPrice !== undefined &&
          sorted[0].lastPrice !== "" &&
          !isNaN(Number(sorted[0].lastPrice))
        ) {
          baseLastPrice =
            (Number(sorted[0].lastPrice) / Number(sorted[0].qty)) *
            effectiveQty;
        }
      }
    }
  } else if (
    customBasePrice === null &&
    product.quantityPricingTiers &&
    product.quantityPricingTiers.length > 0
  ) {
    const sortedTiers = [...product.quantityPricingTiers].sort(
      (a, b) => b.minQty - a.minQty
    );
    const applicableTier = sortedTiers.find(
      (tier) => effectiveQty >= tier.minQty
    );
    if (applicableTier) {
      unitPrice = applicableTier.pricePerUnit * effectiveQty;
      if (
        applicableTier.lastPrice !== undefined &&
        applicableTier.lastPrice !== null &&
        applicableTier.lastPrice !== "" &&
        !isNaN(Number(applicableTier.lastPrice))
      ) {
        baseLastPrice = Number(applicableTier.lastPrice) * effectiveQty;
      }
    } else {
      unitPrice =
        (product.basePrice / (product.minQuantity || 1)) * effectiveQty;
    }
  } else {
    if (product.minQuantity && effectiveQty > product.minQuantity) {
      const ratio = effectiveQty / product.minQuantity;
      unitPrice = unitPrice * ratio;
    }
  }

  // 2. Cross-Attribute Combination Matrix Lookup (e.g. 70 GSM + Both Side vs 90 GSM + Both Side)
  const combinationList = Array.isArray(product.combinationPrices)
    ? product.combinationPrices
    : [];

  let matchedCombo = null;
  let comboPrice = null;
  let comboLastPrice = 0;
  const comboCoveredKeys = new Set();

  if (
    combinationList.length > 0 &&
    selectedOptions &&
    Object.keys(selectedOptions).length > 0
  ) {
    // Normalize selected options for robust matching
    const normSelected = {};
    Object.entries(selectedOptions).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim()) {
        normSelected[String(k).trim().toLowerCase()] = String(v).trim().toLowerCase();
      }
    });

    for (const combo of combinationList) {
      if (
        !combo ||
        !combo.attributes ||
        typeof combo.attributes !== "object" ||
        Object.keys(combo.attributes).length === 0
      ) {
        continue;
      }

      const attrEntries = Object.entries(combo.attributes);
      const matchesAll = attrEntries.every(([attrKey, attrVal]) => {
        const normK = String(attrKey).trim().toLowerCase();
        const normV = String(attrVal).trim().toLowerCase();
        return normSelected[normK] === normV;
      });

      if (matchesAll) {
        matchedCombo = combo;
        attrEntries.forEach(([attrKey]) => {
          comboCoveredKeys.add(String(attrKey).trim().toLowerCase());
        });
        break;
      }
    }

    if (matchedCombo) {
      const qPrices = Array.isArray(matchedCombo.quantityPrices)
        ? matchedCombo.quantityPrices
        : [];

      if (qPrices.length > 0) {
        const matchedQtyRow = qPrices.find(
          (qp) => Number(qp.qty) === effectiveQty
        );

        if (matchedQtyRow) {
          comboPrice = Number(matchedQtyRow.price) || 0;
          if (
            matchedQtyRow.lastPrice !== undefined &&
            matchedQtyRow.lastPrice !== null &&
            matchedQtyRow.lastPrice !== "" &&
            !isNaN(Number(matchedQtyRow.lastPrice))
          ) {
            comboLastPrice = Number(matchedQtyRow.lastPrice);
          }
        } else {
          // Calculate incremental per-card / per-unit rate from nearest or tier below
          const sorted = [...qPrices].sort(
            (a, b) => Number(a.qty) - Number(b.qty)
          );
          const exactOrBelow = [...sorted]
            .reverse()
            .find((qp) => effectiveQty >= Number(qp.qty));

          if (exactOrBelow) {
            const unitRate = Number(exactOrBelow.price) / Number(exactOrBelow.qty);
            comboPrice = unitRate * effectiveQty;
            if (
              exactOrBelow.lastPrice !== undefined &&
              exactOrBelow.lastPrice !== "" &&
              !isNaN(Number(exactOrBelow.lastPrice))
            ) {
              const lastRate =
                Number(exactOrBelow.lastPrice) / Number(exactOrBelow.qty);
              comboLastPrice = lastRate * effectiveQty;
            }
          } else if (sorted[0]) {
            const unitRate = Number(sorted[0].price) / Number(sorted[0].qty);
            comboPrice = unitRate * effectiveQty;
            if (
              sorted[0].lastPrice !== undefined &&
              sorted[0].lastPrice !== "" &&
              !isNaN(Number(sorted[0].lastPrice))
            ) {
              const lastRate =
                Number(sorted[0].lastPrice) / Number(sorted[0].qty);
              comboLastPrice = lastRate * effectiveQty;
            }
          }
        }
      } else if (
        matchedCombo.basePrice !== undefined &&
        matchedCombo.basePrice !== null &&
        !isNaN(Number(matchedCombo.basePrice))
      ) {
        comboPrice = Number(matchedCombo.basePrice);
        if (matchedCombo.lastPrice) {
          comboLastPrice = Number(matchedCombo.lastPrice);
        }
      }
    }
  }

  // 3. Option Price Adjustments from product config
  let optionsTotal = 0;
  let optionsLastPriceTotal = 0;
  const optionDetails = [];

  const optionGroupsToCheck = [
    ...(product.options || []).filter(Boolean),
  ];

  const processedKeys = new Set();

  Object.entries(selectedOptions).forEach(([optKey, valLabel]) => {
    if (!valLabel) return;
    const normKey = String(optKey).trim().toLowerCase();

    // If this option is already satisfied by the matched Combination Matrix, do not add individual cost!
    if (comboCoveredKeys.has(normKey)) {
      return;
    }
    if (processedKeys.has(normKey)) return;

    for (const group of optionGroupsToCheck) {
      const groupKey = (group.id || group.name || "").trim().toLowerCase();
      const groupName = (group.name || group.id || "").trim().toLowerCase();

      if (groupKey === normKey || groupName === normKey) {
        const foundVal = group.values?.find(
          (v) => String(v.label).trim().toLowerCase() === String(valLabel).trim().toLowerCase()
        );

        if (foundVal) {
          let adjustment = 0;
          let optLastPrice = 0;

          // Check if choice has quantity-specific customization (Quantity, Particular Price, Last Price)
          if (
            Array.isArray(foundVal.quantityPrices) &&
            foundVal.quantityPrices.length > 0
          ) {
            const matched = foundVal.quantityPrices.find(
              (qp) => Number(qp.qty) === effectiveQty
            );
            if (matched) {
              adjustment = Number(matched.price) || 0;
              if (
                matched.lastPrice !== undefined &&
                matched.lastPrice !== null &&
                matched.lastPrice !== "" &&
                !isNaN(Number(matched.lastPrice))
              ) {
                optLastPrice = Number(matched.lastPrice);
              }
            } else {
              // Find nearest or tier below (incremental rate)
              const sorted = [...foundVal.quantityPrices].sort(
                (a, b) => Number(a.qty) - Number(b.qty)
              );
              const exactOrBelow = [...sorted]
                .reverse()
                .find((qp) => effectiveQty >= Number(qp.qty));

              if (exactOrBelow) {
                adjustment =
                  (Number(exactOrBelow.price) / Number(exactOrBelow.qty)) *
                  effectiveQty;
                if (
                  exactOrBelow.lastPrice !== undefined &&
                  exactOrBelow.lastPrice !== "" &&
                  !isNaN(Number(exactOrBelow.lastPrice))
                ) {
                  optLastPrice =
                    (Number(exactOrBelow.lastPrice) /
                      Number(exactOrBelow.qty)) *
                    effectiveQty;
                }
              } else if (sorted[0]) {
                adjustment =
                  (Number(sorted[0].price) / Number(sorted[0].qty)) *
                  effectiveQty;
                if (
                  sorted[0].lastPrice !== undefined &&
                  sorted[0].lastPrice !== "" &&
                  !isNaN(Number(sorted[0].lastPrice))
                ) {
                  optLastPrice =
                    (Number(sorted[0].lastPrice) / Number(sorted[0].qty)) *
                    effectiveQty;
                }
              }
            }
          } else {
            // Standard / flat adjustment fallback
            const baseReferenceQty =
              product.quantityType === "select" &&
              Array.isArray(product.fixedQuantities) &&
              product.fixedQuantities.length > 0
                ? Number(product.fixedQuantities[0].qty) || 1000
                : product.minQuantity && product.minQuantity > 0
                ? product.minQuantity
                : 1;
            const qtyRatio = effectiveQty / baseReferenceQty;

            if (foundVal.priceAdjustment !== undefined) {
              adjustment += foundVal.priceAdjustment * qtyRatio;
            }
            if (foundVal.percentageAdjustment) {
              adjustment += (unitPrice * foundVal.percentageAdjustment) / 100;
            }
            if (
              foundVal.lastPrice !== undefined &&
              foundVal.lastPrice !== "" &&
              !isNaN(Number(foundVal.lastPrice))
            ) {
              optLastPrice = Number(foundVal.lastPrice) * qtyRatio;
            }
          }

          if (adjustment > 0) {
            optionsTotal += adjustment;
            optionDetails.push({
              optionName: group.name || optKey,
              valueLabel: foundVal.label,
              adjustment: Math.round(adjustment * 100) / 100,
            });
            processedKeys.add(normKey);
          }
          if (optLastPrice > 0) {
            optionsLastPriceTotal += optLastPrice;
          }
          break;
        }
      }
    }
  });

  // 4. Subtotal & Final Price computation
  let subtotal = 0;
  let finalLastPrice = 0;

  if (comboPrice !== null) {
    // Combination Matrix matched! Subtotal is the combination price + any extra outside options
    subtotal = Math.round((comboPrice + optionsTotal) * 100) / 100;
    finalLastPrice = Math.round((comboLastPrice + optionsLastPriceTotal) * 100) / 100;
  } else if (optionsTotal > 0) {
    // If prices are set by Variation Custom Options, don't add Particular Quantity Prices
    subtotal = Math.round(optionsTotal * 100) / 100;
    finalLastPrice = Math.round(optionsLastPriceTotal * 100) / 100;
  } else {
    // Standard Particular Quantity Prices or Tiered Prices
    subtotal = Math.round(unitPrice * 100) / 100;
    finalLastPrice = Math.round(baseLastPrice * 100) / 100;
  }

  // If custom manual price override is provided, use it directly
  if (
    customPriceOverride !== null &&
    !isNaN(customPriceOverride) &&
    customPriceOverride > 0
  ) {
    subtotal = Number(customPriceOverride);
  }

  const gstAmount = Math.round(((subtotal * gstRate) / 100) * 100) / 100;
  const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

  return {
    quantity: effectiveQty,
    baseUnitPrice: Math.round(unitPrice * 100) / 100,
    baseLastPrice: Math.round(baseLastPrice * 100) / 100,
    optionsTotal: Math.round(optionsTotal * 100) / 100,
    optionsLastPriceTotal: Math.round(optionsLastPriceTotal * 100) / 100,
    combinationPrice: comboPrice !== null ? Math.round(comboPrice * 100) / 100 : null,
    combinationLastPrice: comboLastPrice > 0 ? Math.round(comboLastPrice * 100) / 100 : 0,
    matchedCombination: matchedCombo
      ? matchedCombo.combinationKey || Object.values(matchedCombo.attributes || {}).join(" + ")
      : null,
    finalLastPrice: finalLastPrice > 0 ? finalLastPrice : null,
    optionDetails,
    subtotal,
    gstRate,
    gstAmount,
    totalAmount,
    perUnitFinal: Math.round((totalAmount / effectiveQty) * 100) / 100,
  };
}
