import React from "react";
import { FiAlertCircle, FiPlus, FiMinus } from "react-icons/fi";

export default function ProductOptions({
  product,
  selectedOptions,
  onOptionsChange,
  quantity,
  onQuantityChange,
  activeOptionsFilter = { hasUV: true, hasFoil: true, hasDieCut: true }
}) {
  const minQty = product.minQuantity || 1;
  const step = product.quantityStep || 1;

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    onQuantityChange(isNaN(val) ? minQty : val);
  };

  const handleStepQty = (delta) => {
    const nextVal = Math.max(minQty, quantity + delta);
    onQuantityChange(nextVal);
  };

  // Filter option groups dynamically based on selected variant flags
  const visibleOptions = (product.options || []).filter((optGroup) => {
    if (optGroup.id === "uvEffect") return activeOptionsFilter.hasUV;
    if (optGroup.id === "foilStamping") return activeOptionsFilter.hasFoil;
    if (optGroup.id === "dieCut") return activeOptionsFilter.hasDieCut;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Product Configuration
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select options to recalculate dynamic pricing in real-time.
          </p>
        </div>
      </div>

      {/* Quantity Input Field */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Quantity ({product.unitName || "Units"})
        </label>
        <div className="flex items-center space-x-3 max-w-xs">
          <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
            <button
              type="button"
              onClick={() => handleStepQty(-step)}
              disabled={quantity <= minQty}
              className="p-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-50 transition-colors"
            >
              <FiMinus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min={minQty}
              step={step}
              value={quantity}
              onChange={handleQtyInput}
              className="w-20 text-center text-sm font-bold text-slate-900 bg-white py-2 focus:outline-none border-x border-slate-200"
            />
            <button
              type="button"
              onClick={() => handleStepQty(step)}
              className="p-2.5 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Min Order: <strong className="text-slate-800">{minQty}</strong>
          </span>
        </div>

        {quantity < minQty && (
          <div className="flex items-center text-xs text-red-600 mt-1">
            <FiAlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
            Quantity cannot be less than minimum required ({minQty} {product.unitName || "Units"}).
          </div>
        )}
      </div>

      {/* Dynamic Product Options */}
      {visibleOptions.length > 0 && (
        <div className="space-y-5 pt-2 border-t border-slate-100">
          {visibleOptions.map((optionGroup) => {
            const currentValue = selectedOptions[optionGroup.id] || "";

            return (
              <div key={optionGroup.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {optionGroup.name}
                    {optionGroup.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {currentValue && (
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Selected: {currentValue}
                    </span>
                  )}
                </div>

                {/* Render Select Dropdown */}
                {optionGroup.type === "select" && (
                  <select
                    value={currentValue}
                    onChange={(e) => onOptionsChange(optionGroup.id, e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="" disabled>
                      -- Select {optionGroup.name} --
                    </option>
                    {optionGroup.values.map((valObj, idx) => (
                      <option key={idx} value={valObj.label}>
                        {valObj.label}{" "}
                        {valObj.priceAdjustment
                          ? `(+₹${valObj.priceAdjustment})`
                          : valObj.percentageAdjustment
                          ? `(+${valObj.percentageAdjustment}%)`
                          : ""}
                      </option>
                    ))}
                  </select>
                )}

                {/* Render Radio Cards */}
                {optionGroup.type === "radio" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {optionGroup.values.map((valObj, idx) => {
                      const isSelected = currentValue === valObj.label;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onOptionsChange(optionGroup.id, valObj.label)}
                          className={`p-3 rounded-lg border text-left flex justify-between items-center transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-xs ring-1 ring-blue-600/30"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className="text-xs">{valObj.label}</span>
                          {(valObj.priceAdjustment > 0 || valObj.percentageAdjustment > 0) && (
                            <span className="text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded border border-blue-100 ml-2">
                              {valObj.priceAdjustment
                                ? `+₹${valObj.priceAdjustment}`
                                : `+${valObj.percentageAdjustment}%`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
