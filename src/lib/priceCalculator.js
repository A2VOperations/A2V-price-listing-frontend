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

  const effectiveQty = Math.max(quantity, product.minQuantity || 1);

  // 1. Determine Base Price
  let unitPrice =
    customBasePrice !== null ? customBasePrice : product.basePrice;

  if (
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
          const qtyRatio =
            product.minQuantity && product.minQuantity > 0
              ? effectiveQty / product.minQuantity
              : 1;

          if (foundVal.priceAdjustment !== undefined) {
            adjustment += foundVal.priceAdjustment * qtyRatio;
          }
          if (foundVal.percentageAdjustment) {
            adjustment += (unitPrice * foundVal.percentageAdjustment) / 100;
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
          break;
        }
      }
    }
  });

  // 3. Subtotal & Final Price computation
  let subtotal = Math.round((unitPrice + optionsTotal) * 100) / 100;

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
    optionDetails,
    subtotal,
    gstRate,
    gstAmount,
    totalAmount,
    perUnitFinal: Math.round((totalAmount / effectiveQty) * 100) / 100,
  };
}
