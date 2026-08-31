"use client";

import React, { useState } from "react";
import { FiList, FiFileText, FiAlertCircle, FiUploadCloud, FiCheck, FiAward, FiStar } from "react-icons/fi";

export default function ProductInfo({ product }) {
  const [activeTab, setActiveTab] = useState("specifications");

  const tabs = [
    { id: "specifications", label: "Specifications", icon: FiList },
    { id: "description", label: "Description & Features", icon: FiFileText },
    { id: "notes", label: "Important Notes", icon: FiAlertCircle },
    { id: "fileRequirements", label: "Artwork Guidelines", icon: FiUploadCloud }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Tab Navigation Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="p-5 text-xs text-slate-700 leading-relaxed">
        {/* Specifications Tab */}
        {activeTab === "specifications" && (
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-1.5">
              Technical Specifications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {product.specifications &&
                Object.entries(product.specifications).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100 gap-2"
                  >
                    <span className="capitalize text-slate-500 font-medium shrink-0">
                      {key.includes(" ") ? key : key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-bold text-slate-900 text-right">{val}</span>
                  </div>
                ))}
              {!product.specifications && (
                <>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium">Production Lead Time</span>
                    <span className="font-bold text-blue-600">{product.productionTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 font-medium">Minimum Order Qty</span>
                    <span className="font-bold text-slate-900">
                      {product.minQuantity} {product.unitName || "Units"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Description Tab */}
        {activeTab === "description" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-900 mb-2 text-sm">About {product.name}</h4>
              <p className="text-slate-600 mb-3">{product.description}</p>
            </div>

            {/* Product Specialization */}
            {product.productSpecialization && product.productSpecialization.length > 0 && (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80">
                <h5 className="font-bold text-slate-900 mb-2 text-xs flex items-center gap-1.5">
                  <FiStar className="w-3.5 h-3.5 text-amber-500" /> Product Specialization
                </h5>
                <ul className="space-y-1.5 text-slate-700">
                  {product.productSpecialization.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Our Specialization */}
            {product.ourSpecialization && product.ourSpecialization.length > 0 && (
              <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-100">
                <h5 className="font-bold text-blue-900 mb-2 text-xs flex items-center gap-1.5">
                  <FiAward className="w-3.5 h-3.5 text-blue-600" /> Our Specialization
                </h5>
                <ul className="space-y-1.5 text-blue-950">
                  {product.ourSpecialization.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Important Notes Tab */}
        {activeTab === "notes" && (
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm">Critical Client Instructions</h4>
            {product.importantNotes && product.importantNotes.length > 0 ? (
              <ul className="space-y-2">
                {product.importantNotes.map((note, i) => (
                  <li key={i} className="text-slate-700 bg-amber-50/60 p-3 rounded-lg border border-amber-100/80 whitespace-pre-line leading-relaxed">
                    <div className="flex items-start">
                      <FiCheck className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>{note}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No special instructions required for this standard product.</p>
            )}
          </div>
        )}

        {/* Artwork Requirements Tab */}
        {activeTab === "fileRequirements" && (
          <div>
            <h4 className="font-bold text-slate-900 mb-3 text-sm">Print Artwork & File Specs</h4>
            {product.fileRequirements ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Accepted Formats</span>
                    <span className="font-bold text-slate-800">
                      {Array.isArray(product.fileRequirements.formats)
                        ? product.fileRequirements.formats.join(", ")
                        : product.fileRequirements.formats}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Min Resolution</span>
                    <span className="font-bold text-slate-800">{product.fileRequirements.minDpi} DPI</span>
                  </div>
                  {product.fileRequirements.fullDesignSize && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase">Full Design Size</span>
                      <span className="font-bold text-slate-800">{product.fileRequirements.fullDesignSize}</span>
                    </div>
                  )}
                  {product.fileRequirements.finalSize && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="block text-[11px] font-semibold text-slate-400 uppercase">Final Card Size</span>
                      <span className="font-bold text-slate-800">{product.fileRequirements.finalSize}</span>
                    </div>
                  )}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Required Bleed</span>
                    <span className="font-bold text-slate-800">{product.fileRequirements.bleed}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Safe Area (Text Zone)</span>
                    <span className="font-bold text-slate-800">{product.fileRequirements.safeArea}</span>
                  </div>
                </div>
                {product.fileRequirements.notes && (
                  <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                    * {product.fileRequirements.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Standard print file formats accepted (PDF, AI, CDR, high-res PNG).</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
