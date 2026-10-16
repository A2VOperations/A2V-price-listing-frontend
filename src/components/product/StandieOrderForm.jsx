import React, { useState, useMemo } from "react";
import {
  FiPackage,
  FiLayers,
  FiCheck,
  FiMaximize2,
  FiInfo,
  FiCheckCircle,
  FiFileText,
  FiDownload,
  FiTag,
  FiShoppingBag,
  FiShield,
  FiEdit3,
} from "react-icons/fi";
import { useQuote } from "@/context/QuoteContext";
import StandiePreview from "./StandiePreview";
import { generateStandieQuotationPdf } from "@/lib/generateQuotationPdf";

const STANDEE_SIZES = [
  { id: "2.5x6", label: "2.5 × 6 Ft (Standard)", width: 2.5, height: 6, area: 15, isPopular: true },
  { id: "3x6", label: "3 × 6 Ft (Wide Base)", width: 3, height: 6, area: 18 },
  { id: "2x5", label: "2 × 5 Ft (Compact)", width: 2, height: 5, area: 10 },
  { id: "4x6", label: "4 × 6 Ft (Jumbo)", width: 4, height: 6, area: 24 },
  { id: "custom", label: "Custom Dimensions", width: 2.5, height: 6, area: 15 },
];

const STAND_TYPES = [
  {
    id: "std-rollup",
    name: "Standard Aluminium Roll-Up Stand + Padded Carry Bag",
    shortName: "Standard Roll-Up Stand",
    price: 450,
    badge: "Popular Choice",
    description: "Lightweight anodized silver aluminium casing with foldable support rod & zippered nylon carry case.",
  },
  {
    id: "lux-teardrop",
    name: "Luxury Broad-Base Teardrop Aluminium Stand",
    shortName: "Luxury Broad-Base Stand",
    price: 950,
    badge: "Premium Executive",
    description: "Solid heavy-weight self-standing base with mirror chrome end caps, no protruding feet needed.",
  },
  {
    id: "x-stand",
    name: "X-Banner Stand (Spider Mechanism)",
    shortName: "X-Banner Stand",
    price: 300,
    badge: "Budget Friendly",
    description: "Lightweight fiberglass X-frame with corner eyelets for quick promotional displays.",
  },
  {
    id: "print-only",
    name: "No Stand / Banner Print Only (Replacement)",
    shortName: "Banner Print Only",
    price: 0,
    badge: "Refill Graphic",
    description: "High quality replacement printed graphic banner without aluminium hardware mechanism.",
  },
  {
    id: "stand-only",
    name: "Stand Hardware Only (No Printing)",
    shortName: "Stand Mechanism Only",
    price: 450,
    badge: "Hardware Only",
    description: "Blank roll-up aluminium mechanism with carry bag ready for your own printed inserts.",
  },
];

const MEDIA_TYPES = [
  {
    id: "star-flex",
    name: "Star Flex - Gloss Finish",
    pricePerSqFt: 25,
    tag: "Recommended",
    description: "High gloss durable frontlit flex media with vibrant color saturation and water resistance.",
  },
  {
    id: "non-tearable",
    name: "Non-Tearable Matte Rollup Film (Polyjet)",
    pricePerSqFt: 45,
    tag: "Ultra Premium",
    description: "100% curl-free smooth synthetic film with glare-free matte finish for showroom clarity.",
  },
  {
    id: "normal-flex",
    name: "Normal Frontlit Flex",
    pricePerSqFt: 15,
    tag: "Economy",
    description: "Cost-effective frontlit banner material ideal for short-duration indoor/outdoor events.",
  },
  {
    id: "satin-fabric",
    name: "Satin Fabric Graphic",
    pricePerSqFt: 55,
    tag: "Luxury Fabric",
    description: "Crease-resistant fabric with soft sheen, non-reflective and upscale appearance.",
  },
  {
    id: "custom-media",
    name: "Custom Media (Manual Rate)",
    pricePerSqFt: 25,
    tag: "Custom",
    description: "Enter custom pricing per sq. ft. for specialized substrate.",
  },
];

const LAMINATION_OPTIONS = [
  { id: "none", name: "None", pricePerSqFt: 0 },
  { id: "matte", name: "Matte Lamination", pricePerSqFt: 5 },
  { id: "gloss", name: "Gloss Lamination", pricePerSqFt: 5 },
];

const DESIGN_OPTIONS = [
  { id: "ready", name: "Print-Ready File Provided", fee: 0 },
  { id: "basic", name: "Basic Layout & Typesetting", fee: 250 },
  { id: "full", name: "Complete Graphic Design", fee: 500 },
];

export default function StandieOrderForm({ product, onVariantSelect }) {
  const { addToQuote } = useQuote();

  // Match initial state from product metadata if available
  const initialSizeObj = useMemo(() => {
    if (product?.standeeSize) {
      const match = STANDEE_SIZES.find((s) => s.label.includes(product.standeeSize));
      if (match) return match;
    }
    return STANDEE_SIZES[0];
  }, [product]);

  const [selectedSizeId, setSelectedSizeId] = useState(initialSizeObj.id);
  const [customWidth, setCustomWidth] = useState(product?.widthFt || initialSizeObj.width);
  const [customHeight, setCustomHeight] = useState(product?.heightFt || initialSizeObj.height);

  const [selectedStandId, setSelectedStandId] = useState(
    product?.standType?.toLowerCase().includes("luxury") ? "lux-teardrop" : "std-rollup"
  );
  const [manualStandPrice, setManualStandPrice] = useState(450);

  const [selectedMediaId, setSelectedMediaId] = useState("star-flex");
  const [customMediaPricePerSqFt, setCustomMediaPricePerSqFt] = useState(25);

  const [selectedLaminationId, setSelectedLaminationId] = useState("none");
  const [selectedDesignId, setSelectedDesignId] = useState("ready");

  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

  // Client info for PDF quotation
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Computed dimensions & area
  const activeSize = STANDEE_SIZES.find((s) => s.id === selectedSizeId) || STANDEE_SIZES[0];
  const isCustomSize = selectedSizeId === "custom";

  const validWidth = Math.max(0.5, parseFloat(isCustomSize ? customWidth : activeSize.width) || 2.5);
  const validHeight = Math.max(1, parseFloat(isCustomSize ? customHeight : activeSize.height) || 6);
  const areaSqFt = parseFloat((validWidth * validHeight).toFixed(2));

  // Computed stand
  const activeStand = STAND_TYPES.find((s) => s.id === selectedStandId) || STAND_TYPES[0];
  const standCostPerUnit =
    selectedStandId === "stand-only" || selectedStandId === "std-rollup"
      ? activeStand.price
      : activeStand.price;

  // Computed media
  const isStandOnly = selectedStandId === "stand-only";
  const activeMedia = isStandOnly
    ? { id: "none", name: "No Print (Hardware Only)", pricePerSqFt: 0 }
    : MEDIA_TYPES.find((m) => m.id === selectedMediaId) || MEDIA_TYPES[0];

  const mediaRatePerSqFt =
    activeMedia.id === "custom-media"
      ? Math.max(0, parseFloat(customMediaPricePerSqFt) || 0)
      : activeMedia.pricePerSqFt;

  const mediaCostPerUnit = isStandOnly ? 0 : Math.round(areaSqFt * mediaRatePerSqFt);

  // Computed lamination
  const activeLamination = isStandOnly
    ? { id: "none", name: "None", pricePerSqFt: 0 }
    : LAMINATION_OPTIONS.find((l) => l.id === selectedLaminationId) || LAMINATION_OPTIONS[0];
  const laminationCostPerUnit = Math.round(areaSqFt * activeLamination.pricePerSqFt);

  // Computed design
  const activeDesign = DESIGN_OPTIONS.find((d) => d.id === selectedDesignId) || DESIGN_OPTIONS[0];
  const designCostTotal = activeDesign.fee;

  // Unit and total pricing
  const unitPriceBeforeDesign = standCostPerUnit + mediaCostPerUnit + laminationCostPerUnit;
  const grossSubtotal = Math.round(unitPriceBeforeDesign * quantity + designCostTotal);
  const validDiscount = Math.max(0, Math.min(grossSubtotal, parseFloat(discount) || 0));
  const totalAmount = Math.max(0, grossSubtotal - validDiscount);

  // Add to Quote cart
  const handleAddToQuote = () => {
    const quoteItem = {
      productId: product?.id || "STD-001",
      code: product?.code || "STD-001",
      name: `${product?.name || "Roll-Up Standie"} (${validWidth}×${validHeight} Ft)`,
      categoryId: "flex-board",
      subCategory: "STANDIE",
      unitPrice: Math.round(unitPriceBeforeDesign),
      quantity: quantity,
      subtotal: grossSubtotal,
      discount: validDiscount,
      total: totalAmount,
      specifications: {
        "Standee Size": `${validWidth} ft × ${validHeight} ft (${areaSqFt} sq. ft.)`,
        "Stand Mechanism": activeStand.name,
        "Print Media": activeMedia.name,
        "Lamination": activeLamination.name,
        "Design Assistance": activeDesign.name,
        "Carry Bag": !activeStand.name.includes("No Stand") ? "Included" : "N/A",
      },
    };

    addToQuote(quoteItem);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  // Generate Quotation PDF
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      generateStandieQuotationPdf({
        standeeSize: `${validWidth} × ${validHeight} Ft`,
        validWidth,
        validHeight,
        areaSqFt,
        activeMedia: {
          name: activeMedia.name,
          pricePerSqFt: mediaRatePerSqFt,
        },
        mediaCostPerUnit,
        activeStand: {
          name: activeStand.name,
          price: standCostPerUnit,
        },
        standCostPerUnit,
        activeLamination: {
          name: activeLamination.name,
          pricePerSqFt: activeLamination.pricePerSqFt,
        },
        laminationCostPerUnit,
        activeDesign: {
          name: activeDesign.name,
          fee: designCostTotal,
        },
        designCostTotal,
        quantity,
        grossSubtotal,
        validDiscount,
        totalAmount,
        clientInfo: {
          clientName: clientName.trim(),
          phone: clientPhone.trim(),
        },
        productName: product?.name || "Roll-Up Standie Display",
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Product Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
              Roll-Up Standie Configurator
            </span>
            <span className="text-xs text-slate-400 font-mono">#{product?.code || "STD-001"}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            {product?.name || "Roll-Up Standie Display & Frame Calculator"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize standee size, heavy-duty aluminium mechanisms, high-res media prints &amp; instant quote.
          </p>
        </div>

        {/* Live Total Rate Badge */}
        <div className="text-right bg-gradient-to-br from-orange-50 to-amber-50 p-3.5 rounded-xl border border-orange-200 shrink-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-600">
            Total Estimated Price
          </div>
          <div className="text-2xl font-black text-slate-900 leading-tight">
            ₹{totalAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">
            (₹{Math.round(unitPriceBeforeDesign)} / unit • {quantity} {quantity === 1 ? "unit" : "units"})
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Standee Size Selection */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiMaximize2 className="w-3.5 h-3.5 text-orange-600" />
                1. Select Standee Size
              </span>
              <span className="text-[11px] text-orange-600 font-bold lowercase">
                {areaSqFt} sq. ft. area
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {STANDEE_SIZES.map((size) => {
                const isSelected = selectedSizeId === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => {
                      setSelectedSizeId(size.id);
                      if (size.id !== "custom") {
                        setCustomWidth(size.width);
                        setCustomHeight(size.height);
                      }
                    }}
                    className={`p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    {size.isPopular && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 rounded-full bg-orange-600 text-[9px] font-extrabold text-white uppercase tracking-wider">
                        Standard
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-900 block">{size.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1 font-mono">
                      {size.id === "custom" ? "Custom ft × ft" : `${size.area} sq.ft. display`}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Dimensions Input Box */}
            {isCustomSize && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-dashed border-slate-300 grid grid-cols-2 gap-3 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Width (Feet):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. 2.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Height (Feet):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="2"
                    max="12"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. 6.0"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Stand Mechanism & Hardware */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiPackage className="w-3.5 h-3.5 text-orange-600" />
                2. Stand Mechanism &amp; Casing
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                Aluminium hardware
              </span>
            </label>

            <div className="space-y-2">
              {STAND_TYPES.map((stand) => {
                const isSelected = selectedStandId === stand.id;
                return (
                  <label
                    key={stand.id}
                    onClick={() => setSelectedStandId(stand.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-500 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                          isSelected ? "border-orange-600 bg-orange-600 text-white" : "border-slate-300"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{stand.name}</span>
                          {stand.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[9px] font-bold border border-slate-200">
                              {stand.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{stand.description}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-xs font-extrabold text-slate-900">
                        {stand.price > 0 ? `+₹${stand.price}` : "₹0"}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Graphic Print Media (Hidden if Stand Hardware Only is chosen) */}
          {!isStandOnly && (
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FiLayers className="w-3.5 h-3.5 text-orange-600" />
                  3. Graphic Print Media Substrate
                </span>
                <span className="text-[11px] text-orange-600 font-bold">
                  ₹{mediaCostPerUnit} / unit
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MEDIA_TYPES.map((media) => {
                  const isSelected = selectedMediaId === media.id;
                  return (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => setSelectedMediaId(media.id)}
                      className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{media.name}</span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                            {media.tag}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{media.description}</p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-600 font-semibold">
                          ₹{media.pricePerSqFt} / sqft
                        </span>
                        <span className="font-extrabold text-orange-700">
                          ₹{Math.round(areaSqFt * media.pricePerSqFt)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Media Rate Input */}
              {selectedMediaId === "custom-media" && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-amber-900">
                    Custom Media Rate per sq. ft.:
                  </label>
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={customMediaPricePerSqFt}
                      onChange={(e) => setCustomMediaPricePerSqFt(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 text-xs bg-white border border-amber-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Protective Lamination & Finishing */}
          {!isStandOnly && (
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FiShield className="w-3.5 h-3.5 text-orange-600" />
                  4. Protective Surface Lamination
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeLamination.pricePerSqFt > 0 ? `+₹${laminationCostPerUnit}` : "Included (₹0)"}
                </span>
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {LAMINATION_OPTIONS.map((lam) => {
                  const isSelected = selectedLaminationId === lam.id;
                  return (
                    <button
                      key={lam.id}
                      type="button"
                      onClick={() => setSelectedLaminationId(lam.id)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs block">{lam.name}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {lam.pricePerSqFt > 0 ? `+₹${lam.pricePerSqFt}/sqft` : "₹0"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Design & Layout Assistance */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiEdit3 className="w-3.5 h-3.5 text-orange-600" />
                5. Design &amp; Artwork Assistance
              </span>
              <span className="text-[11px] text-slate-500">
                {designCostTotal > 0 ? `+₹${designCostTotal}` : "Free"}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DESIGN_OPTIONS.map((design) => {
                const isSelected = selectedDesignId === design.id;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => setSelectedDesignId(design.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block">{design.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                      {design.fee > 0 ? `+₹${design.fee}` : "No fee"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Quantity & Special Discount */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Quantity (Standees):
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-xs"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 shadow-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 flex items-center justify-center text-sm shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                Special Discount (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="0"
                  max={grossSubtotal}
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage: Visual Preview & Itemized Bill (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Visual Interactive Preview */}
          <StandiePreview
            width={validWidth}
            height={validHeight}
            sizeLabel={`${validWidth} × ${validHeight} Ft`}
            mediaName={activeMedia.name}
            standType={activeStand.name}
            lamination={activeLamination.name}
          />

          {/* Itemized Specification & Pricing Bill */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Itemized Cost Breakdown
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {quantity} {quantity === 1 ? "Unit" : "Units"}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              {standCostPerUnit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="truncate pr-2">
                    {activeStand.shortName || activeStand.name}:
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(standCostPerUnit * quantity).toLocaleString()}
                  </span>
                </div>
              )}

              {!isStandOnly && mediaCostPerUnit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="truncate pr-2">
                    {activeMedia.name} ({areaSqFt} sqft):
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(mediaCostPerUnit * quantity).toLocaleString()}
                  </span>
                </div>
              )}

              {laminationCostPerUnit > 0 && (
                <div className="flex justify-between items-center">
                  <span className="truncate pr-2">{activeLamination.name}:</span>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{(laminationCostPerUnit * quantity).toLocaleString()}
                  </span>
                </div>
              )}

              {designCostTotal > 0 && (
                <div className="flex justify-between items-center">
                  <span className="truncate pr-2">{activeDesign.name}:</span>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{designCostTotal.toLocaleString()}
                  </span>
                </div>
              )}

              {validDiscount > 0 && (
                <div className="flex justify-between items-center text-orange-600 font-bold pt-1 border-t border-slate-200">
                  <span>Special Discount:</span>
                  <span>- ₹{validDiscount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Total Payable Box */}
            <div className="pt-3 border-t border-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Net Amount Payable
                </span>
                <span className="text-xl font-black text-slate-900">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                All Included
              </span>
            </div>

            {/* Client Info (For Instant PDF Quotation) */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                Customer Information (For Quotation PDF):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Client / Company Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 space-y-2">
              <button
                type="button"
                onClick={handleAddToQuote}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-sm ${
                  addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    Added to Quote Cart!
                  </>
                ) : (
                  <>
                    <FiShoppingBag className="w-4 h-4" />
                    Add Standie to Quote (₹{totalAmount.toLocaleString()})
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <FiDownload className="w-4 h-4 text-orange-400" />
                {isGeneratingPdf ? "Generating PDF..." : "Download Official Quotation PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
