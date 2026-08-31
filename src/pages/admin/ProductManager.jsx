import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import AdminLayout from "./AdminLayout";
import ProductImage from "@/components/common/ProductImage";
import { uploadImageApi, uploadMultipleImagesApi } from "@/services/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheck,
  FiUploadCloud,
  FiFilter,
  FiLayers,
  FiList,
  FiSliders,
  FiDollarSign,
  FiFileText,
  FiChevronRight,
  FiTag,
  FiImage,
  FiStar,
} from "react-icons/fi";

export default function ProductManager() {
  const { categories, products, addProduct, updateProduct, deleteProduct } = useData();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");

  // Extract all subcategories present across products
  const allSubCategories = Array.from(
    new Set(
      products
        .filter((p) => !selectedCategory || p.categoryId === selectedCategory)
        .map((p) => p.subCategory)
        .filter(Boolean)
    )
  );

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSubCategory = !selectedSubCategory || p.subCategory === selectedSubCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(q));
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  // Default Form State
  const defaultFormState = {
    id: "",
    code: "",
    categoryId: categories[0]?.id || "visiting-cards",
    subCategory: "General Products",
    name: "",
    slug: "",
    image: "/src/assets/images/categories (1).webp",
    images: [],
    description: "",
    minQuantity: 1000,
    quantityStep: 1000,
    productionTime: "3-7 Days",
    basePrice: 1800,
    unitName: "Cards",
    pricingModel: "quantity_tiered",
    variantCombinations: [],
    variantDetails: {},
    quantityPricingTiers: [
      { minQty: 1000, pricePerUnit: 1.8 },
      { minQty: 2000, pricePerUnit: 1.5 },
      { minQty: 5000, pricePerUnit: 1.2 },
    ],
    specifications: {
      "Product Ref.": "VC Standard",
      "Paper Quality": "350 GSM Art Card",
      "Lamination Type": "Matt Lamination",
    },
    ourSpecialization: [
      "Latest Komori offset printing technology",
      "Equipped Post Printing Unit",
    ],
    productSpecialization: [
      "Premium finish and high durability",
    ],
    importantNotes: [
      "High resolution imagery required",
    ],
    fileRequirements: {
      formats: ["PDF", "CDR", "AI"],
      minDpi: 300,
      bleed: "3 mm",
    },
    options: [
      {
        id: "printing",
        name: "Printing",
        type: "select",
        required: true,
        values: [
          { label: "Front & Back", priceAdjustment: 0 },
          { label: "Single Side", priceAdjustment: -100 },
        ],
      },
    ],
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [newVariantInput, setNewVariantInput] = useState("");
  const [newMainOptionName, setNewMainOptionName] = useState("");

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...defaultFormState,
      id: `AP-${Date.now().toString().slice(-5)}`,
      code: `VC-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: selectedCategory || categories[0]?.id || "visiting-cards",
      subCategory: selectedSubCategory || "General Products",
      images: [],
    });
    setManualImageUrl("");
    setActiveTab("general");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const existingImages = Array.isArray(product.images)
      ? product.images
      : product.image
      ? [product.image]
      : [];

    setFormData({
      id: product.id || "",
      code: product.code || "",
      categoryId: product.categoryId || categories[0]?.id || "",
      subCategory: product.subCategory || "General Products",
      name: product.name || "",
      slug: product.slug || "",
      image: product.image || existingImages[0] || "",
      images: existingImages,
      description: product.description || "",
      minQuantity: product.minQuantity ?? 1000,
      quantityStep: product.quantityStep ?? 1000,
      productionTime: product.productionTime || "",
      basePrice: product.basePrice ?? 0,
      unitName: product.unitName || "Units",
      pricingModel: product.pricingModel || "quantity_tiered",
      variantCombinations: product.variantCombinations || [],
      variantDetails: product.variantDetails || {},
      quantityPricingTiers: product.quantityPricingTiers || [],
      specifications: product.specifications || {},
      ourSpecialization: product.ourSpecialization || [],
      productSpecialization: product.productSpecialization || [],
      importantNotes: product.importantNotes || [],
      fileRequirements: product.fileRequirements || {},
      options: product.options || [],
    });
    setManualImageUrl("");
    setActiveTab("general");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadingImage(true);
      const urls = await uploadMultipleImagesApi(files);
      if (urls && urls.length > 0) {
        setFormData((prev) => {
          const currentList = Array.isArray(prev.images)
            ? prev.images
            : prev.image
            ? [prev.image]
            : [];
          const combined = Array.from(new Set([...currentList, ...urls]));
          return {
            ...prev,
            image: prev.image || urls[0],
            images: combined,
          };
        });
      }
    } catch (err) {
      alert("Failed to upload image(s): " + err.message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSetPrimaryImage = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      image: imgUrl,
    }));
  };

  const handleRemoveImage = (imgUrl) => {
    setFormData((prev) => {
      const updatedImages = (prev.images || []).filter((u) => u !== imgUrl);
      const newPrimary = prev.image === imgUrl ? (updatedImages[0] || "") : prev.image;
      return {
        ...prev,
        image: newPrimary,
        images: updatedImages,
      };
    });
  };

  const handleAddManualImageUrl = () => {
    if (!manualImageUrl.trim()) return;
    const url = manualImageUrl.trim();
    setFormData((prev) => {
      const currentList = Array.isArray(prev.images)
        ? prev.images
        : prev.image
        ? [prev.image]
        : [];
      const combined = Array.from(new Set([...currentList, url]));
      return {
        ...prev,
        image: prev.image || url,
        images: combined,
      };
    });
    setManualImageUrl("");
  };

  // Sub-Sub Variant Handlers
  const handleAddVariantCombination = () => {
    if (!newVariantInput.trim()) return;
    const name = newVariantInput.trim();
    if (formData.variantCombinations.includes(name)) {
      alert("This variant sub-sub category already exists.");
      return;
    }
    const updatedCombos = [...formData.variantCombinations, name];
    const updatedDetails = {
      ...formData.variantDetails,
      [name]: {
        code: `${formData.code || "VAR"}-${formData.variantCombinations.length + 1}`,
        basePrice: formData.basePrice,
        description: `${name} featuring precision finishes and custom specifications.`,
        productionTime: formData.productionTime || "Within 3 days",
        minQuantity: formData.minQuantity,
        quantityStep: formData.quantityStep,
        specifications: { ...formData.specifications },
        quantityPricingTiers: JSON.parse(JSON.stringify(formData.quantityPricingTiers || [])),
        options: [], // Custom options for this sub-sub category
      },
    };
    setFormData((prev) => ({
      ...prev,
      variantCombinations: updatedCombos,
      variantDetails: updatedDetails,
    }));
    setNewVariantInput("");
  };

  const handleRemoveVariantCombination = (name) => {
    const updatedCombos = formData.variantCombinations.filter((v) => v !== name);
    const updatedDetails = { ...formData.variantDetails };
    delete updatedDetails[name];
    setFormData((prev) => ({
      ...prev,
      variantCombinations: updatedCombos,
      variantDetails: updatedDetails,
    }));
  };

  // Variant Pricing Tier Handlers
  const handleAddVariantPricingTier = (variantName) => {
    const details = formData.variantDetails[variantName] || {};
    const currentTiers = details.quantityPricingTiers || [];
    const lastTier = currentTiers[currentTiers.length - 1];
    const newMinQty = lastTier
      ? lastTier.minQty + (details.quantityStep || formData.quantityStep || 1000)
      : (details.minQuantity || formData.minQuantity || 1000);
    const newPrice = lastTier
      ? Math.max(0.01, Number((lastTier.pricePerUnit * 0.9).toFixed(2)))
      : (details.basePrice ? Number((details.basePrice / (newMinQty || 1000)).toFixed(2)) : 1.0);

    const updatedTiers = [
      ...currentTiers,
      { minQty: newMinQty, pricePerUnit: newPrice },
    ];
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: { ...details, quantityPricingTiers: updatedTiers },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleRemoveVariantPricingTier = (variantName, tierIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const currentTiers = details.quantityPricingTiers || [];
    const updatedTiers = currentTiers.filter((_, i) => i !== tierIdx);
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: { ...details, quantityPricingTiers: updatedTiers },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  // Variant-Specific Custom Options Handlers
  const handleAddVariantOption = (variantName, optionName) => {
    if (!optionName.trim()) return;
    const details = formData.variantDetails[variantName] || {};
    const existingOptions = details.options || [];
    const newOpt = {
      id: optionName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: optionName,
      type: "select",
      required: true,
      values: [{ label: "Standard Choice", priceAdjustment: 0 }],
    };
    const updatedOptions = [...existingOptions, newOpt];
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: {
        ...details,
        options: updatedOptions,
      },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleRemoveVariantOption = (variantName, optionIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedOptions = (details.options || []).filter((_, i) => i !== optionIdx);
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: {
        ...details,
        options: updatedOptions,
      },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleAddVariantOptionValue = (variantName, optionIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedOptions = [...(details.options || [])];
    if (updatedOptions[optionIdx]) {
      updatedOptions[optionIdx].values = [
        ...(updatedOptions[optionIdx].values || []),
        { label: "New Choice", priceAdjustment: 0 },
      ];
    }
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: { ...details, options: updatedOptions },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleRemoveVariantOptionValue = (variantName, optionIdx, valueIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedOptions = [...(details.options || [])];
    if (updatedOptions[optionIdx] && updatedOptions[optionIdx].values) {
      updatedOptions[optionIdx].values = updatedOptions[optionIdx].values.filter(
        (_, i) => i !== valueIdx
      );
    }
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: { ...details, options: updatedOptions },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  // Main Options Handlers
  const handleAddMainOption = () => {
    if (!newMainOptionName.trim()) return;
    const newOpt = {
      id: newMainOptionName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: newMainOptionName.trim(),
      type: "select",
      required: true,
      values: [{ label: "Option 1", priceAdjustment: 0 }],
    };
    setFormData((prev) => ({ ...prev, options: [...prev.options, newOpt] }));
    setNewMainOptionName("");
  };

  const handleRemoveMainOption = (idx) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  const handleAddMainOptionValue = (optionIdx) => {
    const updatedOptions = [...formData.options];
    if (updatedOptions[optionIdx]) {
      updatedOptions[optionIdx].values.push({ label: "New Choice", priceAdjustment: 0 });
    }
    setFormData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveMainOptionValue = (optionIdx, valIdx) => {
    const updatedOptions = [...formData.options];
    if (updatedOptions[optionIdx]) {
      updatedOptions[optionIdx].values = updatedOptions[optionIdx].values.filter(
        (_, i) => i !== valIdx
      );
    }
    setFormData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Product Name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const generatedSlug =
        formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const allCleanImages = Array.from(
        new Set([formData.image, ...(formData.images || [])].filter(Boolean))
      );

      const payload = {
        ...formData,
        image: formData.image || allCleanImages[0] || "",
        images: allCleanImages,
        slug: generatedSlug,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }

      setIsModalOpen(false);
    } catch (err) {
      alert("Error saving product: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (
      window.confirm(
        `Are you sure you want to delete product "${product.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteProduct(product.id);
      } catch (err) {
        alert("Failed to delete product: " + err.message);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Bar with Filters */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Product & Sub-category Manager
              </h2>
              <p className="text-xs text-slate-500">
                Edit products, sub-categories, individual sub-sub variation details (prices, descriptions, codes, specs), and custom select options.
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              <FiPlus className="w-4 h-4" /> Create New Product / Variation
            </button>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter Main Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubCategory("");
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Filter Sub-Category
              </label>
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">All Sub-Categories ({allSubCategories.length})</option>
                {allSubCategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search code, name, subcategory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FiSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Image</th>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Sub-Category</th>
                  <th className="p-3.5">Sub-Sub / Variations</th>
                  <th className="p-3.5">Custom Options</th>
                  <th className="p-3.5">Base Price</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400">
                      No products found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="w-10 h-10 rounded overflow-hidden border border-slate-200 bg-slate-100">
                          <ProductImage
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600">#{p.code}</td>
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-500">{p.categoryId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                          {p.subCategory || "General"}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.variantCombinations && p.variantCombinations.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                            {p.variantCombinations.length} sub-sub options
                          </span>
                        ) : (
                          <span className="text-slate-400">Single Item</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                          {p.options?.length || 0} custom dropdowns
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        ₹{p.basePrice} <span className="text-[10px] text-slate-400 font-normal">/ {p.unitName}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded flex items-center gap-1 transition-colors"
                            title="Edit Product, Sub-subs & Individual Prices/Descriptions"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded transition-colors"
                            title="Delete Product"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Master Comprehensive Product & Variant Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-900 text-white">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <FiEdit2 className="w-4 h-4 text-blue-400" />
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : "Create New Product"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modify categories, sub-categories, individual sub-sub variation prices, descriptions, specs, and options.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Bar */}
              <div className="flex items-center gap-1 border-b border-slate-200 bg-slate-50 px-4 pt-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === "general"
                      ? "border-blue-600 text-blue-600 bg-white rounded-t-lg"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiList className="w-4 h-4" /> General Info
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("subsub")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === "subsub"
                      ? "border-indigo-600 text-indigo-600 bg-white rounded-t-lg"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiSliders className="w-4 h-4" /> Sub-Sub Variations & Individual Details (
                  {formData.variantCombinations.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("options")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === "options"
                      ? "border-blue-600 text-blue-600 bg-white rounded-t-lg"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiLayers className="w-4 h-4" /> Select Detail Options ({formData.options.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === "specs"
                      ? "border-amber-600 text-amber-600 bg-white rounded-t-lg"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiFileText className="w-4 h-4" /> Specs & Notes
                </button>
              </div>

              {/* Modal Body with Tab Contents */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* TAB 1: General Info */}
                  {activeTab === "general" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Product Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="e.g. VC-001"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                name: e.target.value,
                                slug:
                                  formData.slug ||
                                  e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                              })
                            }
                            placeholder="e.g. 500 GSM + Velvet Card"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="e.g. 500-gsm-velvet-card"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Main Category *
                          </label>
                          <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Sub-Category Grouping *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.subCategory}
                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                            placeholder="e.g. 500 GSM CARDS (QTY. 500 CARDS)"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold text-amber-800"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Matches sub-headings on Category Page (e.g., 500 GSM, 400 GSM CARDS).
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Base Price (₹)
                          </label>
                          <input
                            type="number"
                            value={formData.basePrice}
                            onChange={(e) =>
                              setFormData({ ...formData, basePrice: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Unit Name
                          </label>
                          <input
                            type="text"
                            value={formData.unitName}
                            onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                            placeholder="Cards / Pouches / Pcs"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Min Order Qty
                          </label>
                          <input
                            type="number"
                            value={formData.minQuantity}
                            onChange={(e) =>
                              setFormData({ ...formData, minQuantity: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Production Time
                          </label>
                          <input
                            type="text"
                            value={formData.productionTime}
                            onChange={(e) =>
                              setFormData({ ...formData, productionTime: e.target.value })
                            }
                            placeholder="e.g. 3 days"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter product description..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Product Images & Gallery Section */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                              <FiImage className="w-4 h-4 text-blue-600" />
                              Product Images & Media Gallery ({formData.images?.length || (formData.image ? 1 : 0)})
                            </label>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Upload multiple images at once. Images automatically upload to <strong>Cloudinary CDN</strong>.
                            </p>
                          </div>

                          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg cursor-pointer transition-colors shadow-xs">
                            <FiUploadCloud className="w-4 h-4" />
                            <span>
                              {uploadingImage ? "Uploading to Cloudinary..." : "Upload Multiple Images"}
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Paste Manual URL Input */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={manualImageUrl}
                            onChange={(e) => setManualImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddManualImageUrl();
                              }
                            }}
                            placeholder="Or paste direct image URL (e.g. Cloudinary, WebP, JPG) and press Enter"
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddManualImageUrl}
                            className="px-3 py-1.5 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
                          >
                            + Add URL
                          </button>
                        </div>

                        {/* Images Grid */}
                        <div className="space-y-2">
                          {(!formData.images || formData.images.length === 0) && !formData.image ? (
                            <p className="text-xs text-slate-400 italic py-2 text-center bg-white rounded-lg border border-dashed border-slate-200">
                              No product images added yet. Upload files above or add an image URL.
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {Array.from(
                                new Set(
                                  [formData.image, ...(formData.images || [])].filter(Boolean)
                                )
                              ).map((imgUrl, idx) => {
                                const isPrimary = formData.image === imgUrl;
                                return (
                                  <div
                                    key={idx}
                                    className={`relative group rounded-xl overflow-hidden border-2 bg-white transition-all shadow-xs ${
                                      isPrimary
                                        ? "border-blue-600 ring-2 ring-blue-500/20"
                                        : "border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    <div className="h-24 w-full bg-slate-100 flex items-center justify-center p-1">
                                      <ProductImage
                                        src={imgUrl}
                                        alt={`Product Image ${idx + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    </div>

                                    {/* Primary Badge */}
                                    {isPrimary ? (
                                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-blue-600 text-white text-[9px] font-extrabold uppercase rounded shadow-xs flex items-center gap-0.5">
                                        <FiStar className="w-2.5 h-2.5 fill-current" /> Primary
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleSetPrimaryImage(imgUrl)}
                                        className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 bg-slate-900/80 hover:bg-blue-600 text-white text-[9px] font-bold rounded shadow-xs"
                                        title="Make this the primary display image"
                                      >
                                        Set Primary
                                      </button>
                                    )}

                                    {/* Delete Image Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(imgUrl)}
                                      className="absolute top-1.5 right-1.5 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-xs"
                                      title="Remove this image"
                                    >
                                      <FiTrash2 className="w-3 h-3" />
                                    </button>

                                    <div className="p-1.5 text-[9px] font-mono text-slate-400 truncate bg-slate-50 border-t border-slate-100">
                                      {imgUrl.split("/").pop()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Sub-Sub Categories / Variations with Individual Price & Details Editor */}
                  {activeTab === "subsub" && (
                    <div className="space-y-6">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                          <FiSliders className="w-4 h-4" /> Manage Sub-Sub Categories & Individual Prices / Descriptions
                        </h4>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                          Each sub-sub variation below populates the <strong>"SELECT PRODUCT"</strong> dropdown on the product page and can have its own <strong>individual price, description, code, production time, min qty, specs, and custom options</strong>!
                        </p>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={newVariantInput}
                            onChange={(e) => setNewVariantInput(e.target.value)}
                            placeholder="e.g. 500 GSM + Velvet + UV + Foil + Die Cut"
                            className="flex-1 px-3 py-2 text-xs border border-indigo-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddVariantCombination}
                            className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <FiPlus className="w-4 h-4" /> Add Sub-Sub Variation
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Active Sub-Sub Variations ({formData.variantCombinations.length})
                        </h4>

                        {formData.variantCombinations.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No sub-sub variations added yet. Standard product options will be used.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {formData.variantCombinations.map((variantName) => {
                              const variantObj = formData.variantDetails[variantName] || {};
                              const variantPricingTiers = variantObj.quantityPricingTiers || [];
                              const variantOptions = variantObj.options || [];

                              return (
                                <div
                                  key={variantName}
                                  className="p-5 rounded-xl border border-indigo-200 bg-white shadow-xs space-y-4"
                                >
                                  {/* Sub-sub Variation Card Header */}
                                  <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                                    <span className="font-extrabold text-xs text-indigo-950 flex items-center gap-2 uppercase tracking-wide">
                                      <FiChevronRight className="w-4 h-4 text-indigo-600" />
                                      {variantName}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveVariantCombination(variantName)}
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                      title="Remove Sub-sub Variation"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Individual Settings for this specific Sub-sub Variation */}
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                      <div>
                                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                                          Individual Code
                                        </label>
                                        <input
                                          type="text"
                                          value={variantObj.code || ""}
                                          onChange={(e) => {
                                            const updatedDetails = { ...formData.variantDetails };
                                            updatedDetails[variantName] = {
                                              ...updatedDetails[variantName],
                                              code: e.target.value,
                                            };
                                            setFormData((prev) => ({
                                              ...prev,
                                              variantDetails: updatedDetails,
                                            }));
                                          }}
                                          placeholder="e.g. VC-7A"
                                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] text-indigo-700 font-extrabold uppercase mb-1">
                                          Individual Base Price (₹) *
                                        </label>
                                        <input
                                          type="number"
                                          value={variantObj.basePrice ?? formData.basePrice}
                                          onChange={(e) => {
                                            const updatedDetails = { ...formData.variantDetails };
                                            updatedDetails[variantName] = {
                                              ...updatedDetails[variantName],
                                              basePrice: Number(e.target.value),
                                            };
                                            setFormData((prev) => ({
                                              ...prev,
                                              variantDetails: updatedDetails,
                                            }));
                                          }}
                                          className="w-full px-2.5 py-1.5 text-xs border border-indigo-300 rounded font-black text-indigo-900 bg-indigo-50/50"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                                          Individual Production Time
                                        </label>
                                        <input
                                          type="text"
                                          value={variantObj.productionTime || formData.productionTime}
                                          onChange={(e) => {
                                            const updatedDetails = { ...formData.variantDetails };
                                            updatedDetails[variantName] = {
                                              ...updatedDetails[variantName],
                                              productionTime: e.target.value,
                                            };
                                            setFormData((prev) => ({
                                              ...prev,
                                              variantDetails: updatedDetails,
                                            }));
                                          }}
                                          placeholder="e.g. 3 days"
                                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-medium"
                                        />
                                      </div>
                                    </div>

                                    {/* Individual Description for this Sub-sub Variation */}
                                    <div>
                                      <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                                        Individual Description & Features
                                      </label>
                                      <textarea
                                        rows={2}
                                        value={variantObj.description || ""}
                                        onChange={(e) => {
                                          const updatedDetails = { ...formData.variantDetails };
                                          updatedDetails[variantName] = {
                                            ...updatedDetails[variantName],
                                            description: e.target.value,
                                          };
                                          setFormData((prev) => ({
                                            ...prev,
                                            variantDetails: updatedDetails,
                                          }));
                                        }}
                                        placeholder={`Enter custom description specific to ${variantName}...`}
                                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Sub-sub Variation Pricing Tiers */}
                                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <FiDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                                        Variation Pricing Tiers ({variantPricingTiers.length})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleAddVariantPricingTier(variantName)
                                        }
                                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition-colors flex items-center gap-1"
                                      >
                                        <FiPlus className="w-3 h-3" /> Add Tier
                                      </button>
                                    </div>

                                    {variantPricingTiers.length === 0 ? (
                                      <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                                        No variation-specific pricing tiers configured. Base price calculation will be used.
                                      </p>
                                    ) : (
                                      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50/50">
                                        <table className="w-full text-left text-xs">
                                          <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                                            <tr>
                                              <th className="p-2">
                                                Min Quantity ({formData.unitName || "Units"})
                                              </th>
                                              <th className="p-2">Price Per Unit (₹)</th>
                                              <th className="p-2 text-right">Action</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 bg-white">
                                            {variantPricingTiers.map((tier, tIdx) => (
                                              <tr key={tIdx} className="hover:bg-slate-50/50">
                                                <td className="p-2">
                                                  <input
                                                    type="number"
                                                    value={tier.minQty}
                                                    onChange={(e) => {
                                                      const updatedTiers = [
                                                        ...variantPricingTiers,
                                                      ];
                                                      updatedTiers[tIdx] = {
                                                        ...updatedTiers[tIdx],
                                                        minQty: Number(e.target.value),
                                                      };
                                                      const updatedDetails = {
                                                        ...formData.variantDetails,
                                                        [variantName]: {
                                                          ...variantObj,
                                                          quantityPricingTiers: updatedTiers,
                                                        },
                                                      };
                                                      setFormData((prev) => ({
                                                        ...prev,
                                                        variantDetails: updatedDetails,
                                                      }));
                                                    }}
                                                    className="w-full max-w-[130px] px-2 py-1 text-xs border border-slate-300 rounded font-mono"
                                                    placeholder="1000"
                                                  />
                                                </td>
                                                <td className="p-2">
                                                  <div className="flex items-center gap-1">
                                                    <span className="text-slate-400 text-xs font-bold">
                                                      ₹
                                                    </span>
                                                    <input
                                                      type="number"
                                                      step="any"
                                                      value={tier.pricePerUnit}
                                                      onChange={(e) => {
                                                        const updatedTiers = [
                                                          ...variantPricingTiers,
                                                        ];
                                                        updatedTiers[tIdx] = {
                                                          ...updatedTiers[tIdx],
                                                          pricePerUnit: Number(
                                                            e.target.value
                                                          ),
                                                        };
                                                        const updatedDetails = {
                                                          ...formData.variantDetails,
                                                          [variantName]: {
                                                            ...variantObj,
                                                            quantityPricingTiers: updatedTiers,
                                                          },
                                                        };
                                                        setFormData((prev) => ({
                                                          ...prev,
                                                          variantDetails: updatedDetails,
                                                        }));
                                                      }}
                                                      className="w-full max-w-[130px] px-2 py-1 text-xs border border-slate-300 rounded font-bold text-emerald-700 bg-white"
                                                      placeholder="1.50"
                                                    />
                                                  </div>
                                                </td>
                                                <td className="p-2 text-right">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleRemoveVariantPricingTier(
                                                        variantName,
                                                        tIdx
                                                      )
                                                    }
                                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                    title="Remove Tier"
                                                  >
                                                    <FiTrash2 className="w-3.5 h-3.5" />
                                                  </button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>

                                  {/* Variation Custom Select Details */}
                                  <div className="pt-3 border-t border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                                        <FiTag className="w-3.5 h-3.5 text-indigo-600" />
                                        Variation Custom Options ({variantOptions.length})
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const optName = prompt(
                                            `Enter Custom Option Name for "${variantName}":`,
                                            "Printing"
                                          );
                                          if (optName) handleAddVariantOption(variantName, optName);
                                        }}
                                        className="px-2 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 transition-colors flex items-center gap-1"
                                      >
                                        <FiPlus className="w-3 h-3" /> Add Detail Option
                                      </button>
                                    </div>

                                    {variantOptions.map((opt, oIdx) => (
                                      <div
                                        key={oIdx}
                                        className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2 text-xs"
                                      >
                                        <div className="flex items-center justify-between">
                                          <input
                                            type="text"
                                            value={opt.name}
                                            onChange={(e) => {
                                              const updatedOptions = [...variantOptions];
                                              updatedOptions[oIdx].name = e.target.value;
                                              const updatedDetails = { ...formData.variantDetails };
                                              updatedDetails[variantName].options = updatedOptions;
                                              setFormData((prev) => ({
                                                ...prev,
                                                variantDetails: updatedDetails,
                                              }));
                                            }}
                                            className="px-2 py-1 font-bold text-slate-800 bg-white border border-slate-300 rounded"
                                          />
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveVariantOption(variantName, oIdx)
                                            }
                                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                          >
                                            <FiTrash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        <div className="space-y-1.5">
                                          {(opt.values || []).map((val, vIdx) => (
                                            <div
                                              key={vIdx}
                                              className="flex items-center gap-2 text-xs"
                                            >
                                              <input
                                                type="text"
                                                value={val.label}
                                                onChange={(e) => {
                                                  const updatedOptions = [...variantOptions];
                                                  updatedOptions[oIdx].values[vIdx].label =
                                                    e.target.value;
                                                  const updatedDetails = {
                                                    ...formData.variantDetails,
                                                  };
                                                  updatedDetails[variantName].options =
                                                    updatedOptions;
                                                  setFormData((prev) => ({
                                                    ...prev,
                                                    variantDetails: updatedDetails,
                                                  }));
                                                }}
                                                placeholder="Label (e.g. Front & Back)"
                                                className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded"
                                              />
                                              <input
                                                type="number"
                                                value={val.priceAdjustment}
                                                onChange={(e) => {
                                                  const updatedOptions = [...variantOptions];
                                                  updatedOptions[oIdx].values[
                                                    vIdx
                                                  ].priceAdjustment = Number(e.target.value);
                                                  const updatedDetails = {
                                                    ...formData.variantDetails,
                                                  };
                                                  updatedDetails[variantName].options =
                                                    updatedOptions;
                                                  setFormData((prev) => ({
                                                    ...prev,
                                                    variantDetails: updatedDetails,
                                                  }));
                                                }}
                                                placeholder="₹ Adj"
                                                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-bold"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleRemoveVariantOptionValue(
                                                    variantName,
                                                    oIdx,
                                                    vIdx
                                                  )
                                                }
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                title="Delete Choice"
                                              >
                                                <FiX className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleAddVariantOptionValue(variantName, oIdx)
                                            }
                                            className="text-[11px] font-bold text-indigo-600 hover:underline"
                                          >
                                            + Add Choice
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Main Select Detail Options */}
                  {activeTab === "options" && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                          <FiLayers className="w-4 h-4" /> Manage Custom Select Detail Options
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          These options appear under the <strong>"SELECT DETAIL"</strong> section on the
                          product page (e.g. <em>Printing Side</em>, <em>Corner Finishing</em>, <em>Foil Color</em>).
                        </p>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={newMainOptionName}
                            onChange={(e) => setNewMainOptionName(e.target.value)}
                            placeholder="e.g. Corner Type, Foil Color, Printing"
                            className="flex-1 px-3 py-2 text-xs border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddMainOption}
                            className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1"
                          >
                            <FiPlus className="w-4 h-4" /> Add Option Group
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {formData.options.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No custom select detail options configured.
                          </p>
                        ) : (
                          formData.options.map((opt, optionIdx) => (
                            <div
                              key={optionIdx}
                              className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) => {
                                      const updatedOptions = [...formData.options];
                                      updatedOptions[optionIdx].name = e.target.value;
                                      setFormData((prev) => ({ ...prev, options: updatedOptions }));
                                    }}
                                    className="font-bold text-xs text-slate-900 px-2 py-1 border border-slate-300 rounded"
                                  />
                                  <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={opt.required !== false}
                                      onChange={(e) => {
                                        const updatedOptions = [...formData.options];
                                        updatedOptions[optionIdx].required = e.target.checked;
                                        setFormData((prev) => ({
                                          ...prev,
                                          options: updatedOptions,
                                        }));
                                      }}
                                    />
                                    <span>Required</span>
                                  </label>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMainOption(optionIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Option Values List */}
                              <div className="space-y-2">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                  Dropdown Choices & Price Adjustments
                                </label>
                                {(opt.values || []).map((val, valIdx) => (
                                  <div key={valIdx} className="flex items-center space-x-2 text-xs">
                                    <input
                                      type="text"
                                      value={val.label}
                                      onChange={(e) => {
                                        const updatedOptions = [...formData.options];
                                        updatedOptions[optionIdx].values[valIdx].label =
                                          e.target.value;
                                        setFormData((prev) => ({
                                          ...prev,
                                          options: updatedOptions,
                                        }));
                                      }}
                                      placeholder="Option Label (e.g. Single Side)"
                                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-slate-800"
                                    />
                                    <div className="flex items-center space-x-1">
                                      <span className="text-slate-400">₹</span>
                                      <input
                                        type="number"
                                        value={val.priceAdjustment}
                                        onChange={(e) => {
                                          const updatedOptions = [...formData.options];
                                          updatedOptions[optionIdx].values[
                                            valIdx
                                          ].priceAdjustment = Number(e.target.value);
                                          setFormData((prev) => ({
                                            ...prev,
                                            options: updatedOptions,
                                          }));
                                        }}
                                        placeholder="0"
                                        className="w-24 px-2 py-1.5 border border-slate-300 rounded text-slate-900 font-bold"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveMainOptionValue(optionIdx, valIdx)
                                      }
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    >
                                      <FiX className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => handleAddMainOptionValue(optionIdx)}
                                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 pt-1"
                                >
                                  <FiPlus className="w-3.5 h-3.5" /> Add Dropdown Choice
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Specifications & Notes */}
                  {activeTab === "specs" && (
                    <div className="space-y-6">
                      {/* Key Value Specifications */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Key Specifications
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(formData.specifications).map(([key, val]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-600 w-32 truncate">
                                {key}:
                              </span>
                              <input
                                type="text"
                                value={val}
                                onChange={(e) => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    specifications: {
                                      ...prev.specifications,
                                      [key]: e.target.value,
                                    },
                                  }));
                                }}
                                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Important Notes */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Important Notes (One per line)
                        </h4>
                        <textarea
                          rows={4}
                          value={formData.importantNotes.join("\n")}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              importantNotes: e.target.value.split("\n").filter(Boolean),
                            }))
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer Buttons */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    Product ID: {formData.id}
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || uploadingImage}
                      className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <FiCheck className="w-4 h-4" />
                      {editingProduct ? "Save Product Changes" : "Create Product"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
