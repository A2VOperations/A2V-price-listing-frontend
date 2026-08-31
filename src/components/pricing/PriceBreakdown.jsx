import React, { useState } from "react";
import { FiCheck, FiPlusCircle, FiFileText, FiLock, FiInfo } from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";

export default function PriceBreakdown({
  product,
  calculation,
  selectedOptions,
  quantity,
  isConfigComplete = true
}) {
  const { addToQuote } = useQuote();
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!calculation) return null;

  const handleAdd = () => {
    if (!isConfigComplete) return;
    addToQuote(product, selectedOptions, quantity, calculation);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-md sticky top-20 space-y-4">
      <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <FiFileText className="w-4 h-4 text-blue-600" />
          Price Summary
        </h3>
        {isConfigComplete ? (
          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            Price Ready
          </span>
        ) : (
          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
            <FiLock className="w-3 h-3" />
            Select Product First
          </span>
        )}
      </div>

      {!isConfigComplete ? (
        /* Placeholder view when configuration is incomplete */
        <div className="py-6 px-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center space-y-2">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <FiInfo className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-800">
            Select Product Variant & Configure Options
          </div>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            Please choose a product from the dropdown and configure all required options above to calculate exact pricing.
          </p>
        </div>
      ) : (
        /* Itemized Calculation List & Final Total Box */
        <>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span>Base Price ({calculation.quantity} {product.unitName || "Units"})</span>
              <span className="font-semibold text-slate-800">
                ₹{calculation.baseUnitPrice.toLocaleString()}
              </span>
            </div>

            {calculation.optionDetails && calculation.optionDetails.length > 0 ? (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400">Selected Add-ons</div>
                {calculation.optionDetails.map((opt, idx) => (
                  <div key={idx} className="flex justify-between items-center pl-2 text-[11px]">
                    <span className="text-slate-500 truncate max-w-[170px]">
                      + {opt.optionName} ({opt.valueLabel})
                    </span>
                    <span className="font-semibold text-blue-600">
                      +₹{opt.adjustment.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-lg flex flex-col justify-between space-y-1 shadow-sm">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                Total Payable
              </span>
              <span className="text-xl font-extrabold text-blue-400">
                ₹{calculation.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Effective Rate:</span>
              <span className="font-semibold text-slate-200">
                ₹{calculation.perUnitFinal.toFixed(2)} / {product.unitName ? product.unitName.replace(/s$/, "") : "unit"}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Add To Quote Action Button */}
      <button
        onClick={handleAdd}
        disabled={!isConfigComplete}
        className={`w-full py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm ${
          !isConfigComplete
            ? "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
            : addedSuccess
            ? "bg-emerald-600 text-white"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99]"
        }`}
      >
        {addedSuccess ? (
          <>
            <FiCheck className="w-4 h-4" />
            <span>Added to Client Quote!</span>
          </>
        ) : (
          <>
            <FiPlusCircle className="w-4 h-4" />
            <span>{isConfigComplete ? "Add To Quote Cart" : "Configure All Sections to Add"}</span>
          </>
        )}
      </button>
    </div>
  );
}
