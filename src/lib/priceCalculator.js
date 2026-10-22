/**
 * Pricing Calculation Engine for A2V PRINTS
 *
 * Supports:
 * - Base price lookup
 * - Quantity tiered pricing
 * - Dynamic option price adjustments (Fixed additions & Percentage multipliers)
 * - Subtotal computation
 * - Configurable GST (default 18%)
 * - Final price calculation
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

  // 1. Determine Base Price
  let unitPrice =
    customBasePrice !== null ? customBasePrice : (product.basePrice || 0);

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
    } else {
      // Find nearest or calculate unit rate
      const sorted = [...product.fixedQuantities].sort(
        (a, b) => Number(a.qty) - Number(b.qty)
      );
      const exactOrBelow = [...sorted].reverse().find(
        (fq) => effectiveQty >= Number(fq.qty)
      );
      if (exactOrBelow) {
        unitPrice =
          (Number(exactOrBelow.price) / Number(exactOrBelow.qty)) * effectiveQty;
      } else {
        unitPrice =
          (Number(sorted[0].price) / Number(sorted[0].qty)) * effectiveQty;
      }
    }
  } else if (
    customBasePrice === null &&
    product.quantityPricingTiers &&
    product.quantityPricingTiers.length > 0
  ) {
    const sortedTiers = [...product.quantityPricingTiers].sort(
      (a, b) => b.minQty - a.minQty,
    );
    const applicableTier = sortedTiers.find(
      (tier) => effectiveQty >= tier.minQty,
    );
    if (applicableTier) {
      unitPrice = applicableTier.pricePerUnit * effectiveQty;
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

    let optionsTotal = 0;
  let optionsLastPriceTotal = 0;
  const optionDetails = [];

  // 2. Option Price Adjustments from product config
  const optionGroupsToCheck = [
    ...(product.options || []).filter(Boolean),
  ];

  const processedKeys = new Set();

  Object.entries(selectedOptions).forEach(([optKey, valLabel]) => {
    if (!valLabel || processedKeys.has(optKey)) return;

    for (const group of optionGroupsToCheck) {
      if (
        group.id === optKey ||
        group.name === optKey ||
        group.id?.toLowerCase() === optKey.toLowerCase() ||
        group.name?.toLowerCase() === optKey.toLowerCase()
      ) {
        const foundVal = group.values?.find((v) => v.label === valLabel);
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
              // Find nearest or tier below
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
            processedKeys.add(optKey);
          }
          if (optLastPrice > 0) {
            optionsLastPriceTotal += optLastPrice;
          }
          break;
        }
      }
    }
  });

  // 3. Subtotal & Final Price computation
  // If the prices are set by Variation Custom Options, don't add Particular Quantity Prices;
  // and if not then put the price of Particular Quantity Prices.
  let subtotal = 0;
  if (optionsTotal > 0) {
    subtotal = Math.round(optionsTotal * 100) / 100;
  } else {
    subtotal = Math.round(unitPrice * 100) / 100;
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
    optionsTotal: Math.round(optionsTotal * 100) / 100,
    optionsLastPriceTotal: Math.round(optionsLastPriceTotal * 100) / 100,
    optionDetails,
    subtotal,
    gstRate,
    gstAmount,
    totalAmount,
    perUnitFinal: Math.round((totalAmount / effectiveQty) * 100) / 100,
  };
}
