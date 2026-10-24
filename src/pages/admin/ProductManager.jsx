import React, { useState } from "react";
import { useData } from "@/context/DataContext";
import AdminLayout from "./AdminLayout";
import ProductImage from "@/components/common/ProductImage";
import { uploadMultipleImagesApi } from "@/services/api";
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
  FiGrid,
  FiList,
  FiSliders,
  FiDollarSign,
  FiFileText,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiTag,
  FiImage,
  FiStar,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";

export default function ProductManager() {
  const {
    categories,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    loading,
    refreshData,
  } = useData();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      showNotice("success", "Refreshed products from MongoDB.");
    } catch (err) {
      showNotice("error", "Failed to refresh: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Extract all subcategories present across products
  const allSubCategories = Array.from(
    new Set(
      products
        .filter((p) => !selectedCategory || p.categoryId === selectedCategory)
        .map((p) => p.subCategory)
        .filter(Boolean),
    ),
  );

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      !selectedCategory || p.categoryId === selectedCategory;
    const matchesSubCategory =
      !selectedSubCategory || p.subCategory === selectedSubCategory;
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
    quantityType: "incremental",
    minQuantity: 1000,
    quantityStep: 1000,
    basePrice: 1800,
    unitName: "Cards",
    fixedQuantities: [
      { qty: 1000, price: 1800 },
      { qty: 2000, price: 3200 },
      { qty: 3000, price: 4400 },
      { qty: 4000, price: 5500 },
      { qty: 8000, price: 9500 },
      { qty: 12000, price: 13500 },
      { qty: 16000, price: 17000 },
    ],
    pricingModel: "quantity_tiered",
    variantCombinations: [],
    variantDetails: {},
    combinationPrices: [],
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
    productSpecialization: ["Premium finish and high durability"],
    importantNotes: ["High resolution imagery required"],
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
  const [expandedVariants, setExpandedVariants] = useState({});
  const [editingVariantName, setEditingVariantName] = useState(null);
  const [tempVariantName, setTempVariantName] = useState("");
  const [expandedChoices, setExpandedChoices] = useState({});
  const [expandedCombos, setExpandedCombos] = useState({});

  const toggleComboExpand = (key) => {
    setExpandedCombos((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      ...defaultFormState,
      id: `AP-${Date.now().toString().slice(-5)}`,
      code: `VC-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: selectedCategory || categories[0]?.id || "visiting-cards",
      subCategory: selectedSubCategory || "General Products",
      images: [],
      quantityType: "incremental",
      fixedQuantities: [
        { qty: 1000, price: 1800 },
        { qty: 2000, price: 3200 },
        { qty: 3000, price: 4400 },
        { qty: 4000, price: 5500 },
        { qty: 8000, price: 9500 },
        { qty: 12000, price: 13500 },
        { qty: 16000, price: 17000 },
      ],
    });
    setManualImageUrl("");
    setActiveTab("general");
    setExpandedVariants({});
    setEditingVariantName(null);
    setTempVariantName("");
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const existingImages = Array.isArray(product.images)
      ? product.images
      : product.image
        ? [product.image]
        : [];

    const defaultFixedQuantities = [
      { qty: 1000, price: product.basePrice || 1800 },
      { qty: 2000, price: Math.round((product.basePrice || 1800) * 1.75) },
      { qty: 3000, price: Math.round((product.basePrice || 1800) * 2.45) },
      { qty: 4000, price: Math.round((product.basePrice || 1800) * 3.1) },
      { qty: 8000, price: Math.round((product.basePrice || 1800) * 5.6) },
      { qty: 12000, price: Math.round((product.basePrice || 1800) * 8.0) },
      { qty: 16000, price: Math.round((product.basePrice || 1800) * 10.2) },
    ];

    const activeFixedQuantities =
      Array.isArray(product.fixedQuantities) &&
      product.fixedQuantities.length > 0
        ? product.fixedQuantities
        : defaultFixedQuantities;

    const normalizedVariantDetails = {};
    if (product.variantDetails && typeof product.variantDetails === "object") {
      Object.entries(product.variantDetails).forEach(([vName, vData]) => {
        let vFixed =
          Array.isArray(vData.fixedQuantities) &&
          vData.fixedQuantities.length > 0
            ? vData.fixedQuantities
            : null;

        if (
          !vFixed &&
          Array.isArray(vData.quantityPricingTiers) &&
          vData.quantityPricingTiers.length > 0
        ) {
          vFixed = vData.quantityPricingTiers.map((tier) => ({
            qty: Number(tier.minQty),
            price: Math.round(Number(tier.minQty) * Number(tier.pricePerUnit)),
            lastPrice: tier.lastPrice !== undefined ? tier.lastPrice : "",
          }));
        }

        if (!vFixed || vFixed.length === 0) {
          const vBase = Number(vData.basePrice || product.basePrice || 1800);
          vFixed = [
            { qty: 1000, price: vBase },
            { qty: 2000, price: Math.round(vBase * 1.75) },
            { qty: 3000, price: Math.round(vBase * 2.45) },
            { qty: 4000, price: Math.round(vBase * 3.1) },
            { qty: 8000, price: Math.round(vBase * 5.6) },
            { qty: 12000, price: Math.round(vBase * 8.0) },
            { qty: 16000, price: Math.round(vBase * 10.2) },
          ];
        }

        normalizedVariantDetails[vName] = {
          ...vData,
          quantityType:
            vData.quantityType || product.quantityType || "incremental",
          fixedQuantities: vFixed,
          combinationPrices: Array.isArray(vData.combinationPrices)
            ? vData.combinationPrices
            : [],
        };
      });
    }

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
      quantityType:
        product.quantityType ||
        (Array.isArray(product.fixedQuantities) &&
        product.fixedQuantities.length > 0
          ? "select"
          : "incremental"),
      fixedQuantities: activeFixedQuantities,
      minQuantity: product.minQuantity ?? 1000,
      quantityStep: product.quantityStep ?? 1000,
      basePrice: product.basePrice ?? 0,
      unitName: product.unitName || "Units",
      pricingModel: product.pricingModel || "quantity_tiered",
      variantCombinations: product.variantCombinations || [],
      variantDetails: normalizedVariantDetails,
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
    setExpandedVariants({});
    setEditingVariantName(null);
    setTempVariantName("");
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
      const newPrimary =
        prev.image === imgUrl ? updatedImages[0] || "" : prev.image;
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
        quantityType: formData.quantityType || "incremental",
        minQuantity: formData.minQuantity,
        quantityStep: formData.quantityStep,
        fixedQuantities: JSON.parse(
          JSON.stringify(formData.fixedQuantities || []),
        ),
        specifications: { ...formData.specifications },
        quantityPricingTiers: JSON.parse(
          JSON.stringify(formData.quantityPricingTiers || []),
        ),
        options: [], // Custom options for this sub-sub category
        combinationPrices: [], // Matrix combinations
      },
    };
    setFormData((prev) => ({
      ...prev,
      variantCombinations: updatedCombos,
      variantDetails: updatedDetails,
    }));
    setNewVariantInput("");
    setExpandedVariants((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const toggleVariantExpand = (name) => {
    setExpandedVariants((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleExpandAllVariants = (expand = true) => {
    const next = {};
    formData.variantCombinations.forEach((v) => {
      next[v] = expand;
    });
    setExpandedVariants(next);
  };

  const handleRemoveVariantCombination = (name) => {
    const updatedCombos = formData.variantCombinations.filter(
      (v) => v !== name,
    );
    const updatedDetails = { ...formData.variantDetails };
    delete updatedDetails[name];
    setExpandedVariants((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({
      ...prev,
      variantCombinations: updatedCombos,
      variantDetails: updatedDetails,
    }));
    if (editingVariantName === name) {
      setEditingVariantName(null);
    }
  };

  const handleRenameVariantCombination = (oldName, newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed) {
      alert("Variation name cannot be empty.");
      return false;
    }
    if (trimmed === oldName) {
      return true;
    }
    if (formData.variantCombinations.includes(trimmed)) {
      alert(`A variant named "${trimmed}" already exists.`);
      return false;
    }

    const updatedCombos = formData.variantCombinations.map((v) =>
      v === oldName ? trimmed : v,
    );
    const updatedDetails = { ...formData.variantDetails };
    if (updatedDetails[oldName]) {
      updatedDetails[trimmed] = { ...updatedDetails[oldName] };
      delete updatedDetails[oldName];
    } else {
      updatedDetails[trimmed] = {
        code: `${formData.code || "VAR"}-1`,
        basePrice: formData.basePrice || 0,
        description: `${trimmed} featuring precision finishes and custom specifications.`,
        quantityType: formData.quantityType || "incremental",
        minQuantity: formData.minQuantity || 1000,
        quantityStep: formData.quantityStep || 1000,
        fixedQuantities: JSON.parse(
          JSON.stringify(formData.fixedQuantities || []),
        ),
        specifications: { ...formData.specifications },
        quantityPricingTiers: JSON.parse(
          JSON.stringify(formData.quantityPricingTiers || []),
        ),
        options: [],
      };
    }

    setFormData((prev) => ({
      ...prev,
      variantCombinations: updatedCombos,
      variantDetails: updatedDetails,
    }));

    setExpandedVariants((prev) => {
      const next = { ...prev };
      if (next[oldName] !== undefined) {
        next[trimmed] = next[oldName];
        delete next[oldName];
      } else {
        next[trimmed] = true;
      }
      return next;
    });

    return true;
  };

  // Sub-Sub Variant Fixed Quantity Handlers
  const handleAddVariantFixedQuantity = (variantName) => {
    const details = formData.variantDetails[variantName] || {};
    const list =
      details.fixedQuantities && details.fixedQuantities.length > 0
        ? details.fixedQuantities
        : formData.fixedQuantities || [];
    const lastItem = list[list.length - 1];
    const nextQty = lastItem ? Number(lastItem.qty) + 1000 : 1000;
    const nextPrice = lastItem
      ? Math.round(Number(lastItem.price) * 1.5)
      : details.basePrice || formData.basePrice || 1800;
    const nextLastPrice =
      lastItem?.lastPrice !== undefined ? lastItem.lastPrice : "";

    const updated = [
      ...list,
      { qty: nextQty, price: nextPrice, lastPrice: nextLastPrice },
    ];
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: {
        ...details,
        quantityType: "select",
        fixedQuantities: updated,
      },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleUpdateVariantFixedQuantity = (
    variantName,
    index,
    field,
    value,
  ) => {
    const details = formData.variantDetails[variantName] || {};
    const updated = [...(details.fixedQuantities || [])];
    const parsed =
      value === "" ? "" : isNaN(Number(value)) ? value : Number(value);
    updated[index] = { ...updated[index], [field]: parsed };
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: { ...details, fixedQuantities: updated },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleRemoveVariantFixedQuantity = (variantName, index) => {
    const details = formData.variantDetails[variantName] || {};
    const updated = (details.fixedQuantities || []).filter(
      (_, i) => i !== index,
    );
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: { ...details, fixedQuantities: updated },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleCopyProductQuantitiesToVariant = (variantName) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: {
        ...details,
        quantityType: "select",
        fixedQuantities: JSON.parse(
          JSON.stringify(formData.fixedQuantities || []),
        ),
      },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const handleLoadStandardQuantitiesToVariant = (variantName) => {
    const details = formData.variantDetails[variantName] || {};
    const baseP = Number(details.basePrice || formData.basePrice) || 1800;
    const standards = [
      { qty: 1000, price: baseP, lastPrice: "" },
      { qty: 2000, price: Math.round(baseP * 1.75), lastPrice: "" },
      { qty: 3000, price: Math.round(baseP * 2.45), lastPrice: "" },
      { qty: 4000, price: Math.round(baseP * 3.1), lastPrice: "" },
      { qty: 8000, price: Math.round(baseP * 5.6), lastPrice: "" },
      { qty: 12000, price: Math.round(baseP * 8.0), lastPrice: "" },
      { qty: 16000, price: Math.round(baseP * 10.2), lastPrice: "" },
    ];
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: {
        ...details,
        quantityType: "select",
        fixedQuantities: standards,
      },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  // Variant Pricing Tier Handlers
  const handleAddVariantPricingTier = (variantName) => {
    const details = formData.variantDetails[variantName] || {};
    const currentTiers = details.quantityPricingTiers || [];
    const lastTier = currentTiers[currentTiers.length - 1];
    const newMinQty = lastTier
      ? lastTier.minQty +
        (details.quantityStep || formData.quantityStep || 1000)
      : details.minQuantity || formData.minQuantity || 1000;
    const newPrice = lastTier
      ? Math.max(0.01, Number((lastTier.pricePerUnit * 0.9).toFixed(2)))
      : details.basePrice
        ? Number((details.basePrice / (newMinQty || 1000)).toFixed(2))
        : 1.0;
    const newLastPrice =
      lastTier?.lastPrice !== undefined ? lastTier.lastPrice : "";

    const updatedTiers = [
      ...currentTiers,
      { minQty: newMinQty, pricePerUnit: newPrice, lastPrice: newLastPrice },
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
    const updatedOptions = (details.options || []).filter(
      (_, i) => i !== optionIdx,
    );
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
      updatedOptions[optionIdx].values = updatedOptions[
        optionIdx
      ].values.filter((_, i) => i !== valueIdx);
    }
    const updatedDetails = {
      ...formData.variantDetails,
      [variantName]: { ...details, options: updatedOptions },
    };
    setFormData((prev) => ({ ...prev, variantDetails: updatedDetails }));
  };

  const toggleChoiceQtyExpand = (variantName, oIdx, vIdx) => {
    const key = `${variantName}_${oIdx}_${vIdx}`;
    setExpandedChoices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddChoiceQuantityPrice = (variantName, oIdx, vIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedOptions = JSON.parse(JSON.stringify(details.options || []));
    if (!updatedOptions[oIdx] || !updatedOptions[oIdx].values[vIdx]) return;

    const list = updatedOptions[oIdx].values[vIdx].quantityPrices || [];
    const lastItem = list[list.length - 1];
    const nextQty = lastItem ? Number(lastItem.qty) + 1000 : 1000;
    const nextPrice = lastItem ? Number(lastItem.price) : 0;
    const nextLastPrice =
      lastItem?.lastPrice !== undefined ? lastItem.lastPrice : "";

    updatedOptions[oIdx].values[vIdx].quantityPrices = [
      ...list,
      { qty: nextQty, price: nextPrice, lastPrice: nextLastPrice },
    ];

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, options: updatedOptions },
      },
    }));

    setExpandedChoices((prev) => ({
      ...prev,
      [`${variantName}_${oIdx}_${vIdx}`]: true,
    }));
  };

  const handleSyncChoiceQuantities = (variantName, oIdx, vIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedOptions = JSON.parse(JSON.stringify(details.options || []));
    if (!updatedOptions[oIdx] || !updatedOptions[oIdx].values[vIdx]) return;

    const existingPrices =
      updatedOptions[oIdx].values[vIdx].quantityPrices || [];
    const priceMap = {};
    existingPrices.forEach((ep) => {
      priceMap[ep.qty] = ep;
    });

    let sourceQuantities = [];
    if (
      Array.isArray(details.fixedQuantities) &&
      details.fixedQuantities.length > 0
    ) {
      sourceQuantities = details.fixedQuantities.map((fq) => Number(fq.qty));
    } else if (
      Array.isArray(details.quantityPricingTiers) &&
      details.quantityPricingTiers.length > 0
    ) {
      sourceQuantities = details.quantityPricingTiers.map((t) =>
        Number(t.minQty),
      );
    } else {
      sourceQuantities = [1000, 2000, 3000, 4000, 8000, 12000, 16000];
    }

    const newQuantityPrices = sourceQuantities.map((qty) => {
      if (priceMap[qty]) {
        return priceMap[qty];
      }
      return {
        qty,
        price: updatedOptions[oIdx].values[vIdx].priceAdjustment || 0,
        lastPrice: "",
      };
    });

    updatedOptions[oIdx].values[vIdx].quantityPrices = newQuantityPrices;

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, options: updatedOptions },
      },
    }));

    setExpandedChoices((prev) => ({
      ...prev,
      [`${variantName}_${oIdx}_${vIdx}`]: true,
    }));
  };

  const handleUpdateChoiceQuantityPrice = (
    variantName,
    oIdx,
    vIdx,
    qpIdx,
    field,
    value,
  ) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedOptions = JSON.parse(JSON.stringify(details.options || []));
    if (!updatedOptions[oIdx] || !updatedOptions[oIdx].values[vIdx]) return;

    const list = [...(updatedOptions[oIdx].values[vIdx].quantityPrices || [])];
    if (list[qpIdx]) {
      const parsed =
        value === "" ? "" : isNaN(Number(value)) ? value : Number(value);
      list[qpIdx][field] = parsed;
      updatedOptions[oIdx].values[vIdx].quantityPrices = list;

      setFormData((prev) => ({
        ...prev,
        variantDetails: {
          ...prev.variantDetails,
          [variantName]: { ...details, options: updatedOptions },
        },
      }));
    }
  };

  const handleRemoveChoiceQuantityPrice = (variantName, oIdx, vIdx, qpIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const updatedOptions = JSON.parse(JSON.stringify(details.options || []));
    if (!updatedOptions[oIdx] || !updatedOptions[oIdx].values[vIdx]) return;

    const list = (
      updatedOptions[oIdx].values[vIdx].quantityPrices || []
    ).filter((_, i) => i !== qpIdx);
    updatedOptions[oIdx].values[vIdx].quantityPrices = list;

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, options: updatedOptions },
      },
    }));
  };

  // ==========================================
  // COMBINATION MATRIX HELPER & HANDLERS
  // ==========================================
  const generateAttributeCombinations = (options) => {
    if (!options || !Array.isArray(options) || options.length === 0) return [];
    const validOptions = options.filter(
      (o) => o && o.name && Array.isArray(o.values) && o.values.length > 0,
    );
    if (validOptions.length === 0) return [];

    return validOptions
      .reduce(
        (acc, opt) => {
          const next = [];
          const optName = opt.name.trim();
          acc.forEach((combo) => {
            opt.values.forEach((val) => {
              const valLabel = val.label?.trim() || "Choice";
              next.push({
                attributes: {
                  ...combo.attributes,
                  [optName]: valLabel,
                },
              });
            });
          });
          return next;
        },
        [{ attributes: {} }],
      )
      .map((combo, idx) => {
        const combinationKey = Object.values(combo.attributes).join(" + ");
        return {
          id: `combo-${idx}-${Date.now()}`,
          combinationKey,
          attributes: combo.attributes,
          basePrice: 0,
          quantityPrices: [],
        };
      });
  };

  const handleSyncVariantCombinations = (variantName) => {
    const details = formData.variantDetails[variantName] || {};
    const options = details.options || [];
    if (options.length === 0) {
      alert(
        "Please add at least 1 or 2 custom options above first (e.g. Paper Quality, Printing).",
      );
      return;
    }

    const generated = generateAttributeCombinations(options);
    const existing = details.combinationPrices || [];

    const existingMap = {};
    existing.forEach((c) => {
      if (c && c.attributes) {
        const key = Object.entries(c.attributes)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k.toLowerCase()}:${v.toLowerCase()}`)
          .join("|");
        existingMap[key] = c;
      }
    });

    let sourceQuantities = [];
    if (
      Array.isArray(details.fixedQuantities) &&
      details.fixedQuantities.length > 0
    ) {
      sourceQuantities = details.fixedQuantities.map((fq) => ({
        qty: Number(fq.qty),
        price: Number(fq.price) || 0,
        lastPrice: fq.lastPrice !== undefined ? fq.lastPrice : "",
      }));
    } else {
      sourceQuantities = [
        { qty: 1000, price: 0, lastPrice: "" },
        { qty: 2000, price: 0, lastPrice: "" },
        { qty: 3000, price: 0, lastPrice: "" },
        { qty: 4000, price: 0, lastPrice: "" },
        { qty: 8000, price: 0, lastPrice: "" },
      ];
    }

    const merged = generated.map((gen) => {
      const key = Object.entries(gen.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k.toLowerCase()}:${v.toLowerCase()}`)
        .join("|");

      if (existingMap[key]) {
        return {
          ...gen,
          quantityPrices: existingMap[key].quantityPrices || sourceQuantities,
        };
      }
      return {
        ...gen,
        quantityPrices: JSON.parse(JSON.stringify(sourceQuantities)),
      };
    });

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: {
          ...details,
          combinationPrices: merged,
        },
      },
    }));

    setExpandedCombos((prev) => {
      const next = { ...prev };
      merged.forEach((_, idx) => {
        next[`${variantName}_combo_${idx}`] = true;
      });
      return next;
    });

    showNotice(
      "success",
      `Generated ${merged.length} attribute combinations for "${variantName}"!`,
    );
  };

  const handleClearVariantCombinations = (variantName) => {
    if (
      !confirm(
        `Are you sure you want to clear all combination matrix prices for "${variantName}"?`,
      )
    )
      return;
    const details = formData.variantDetails[variantName] || {};
    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: {
          ...details,
          combinationPrices: [],
        },
      },
    }));
  };

  const handleAddVariantCombinationPriceRow = (variantName, comboIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const combos = JSON.parse(JSON.stringify(details.combinationPrices || []));
    if (!combos[comboIdx]) return;

    const list = combos[comboIdx].quantityPrices || [];
    const lastItem = list[list.length - 1];
    const nextQty = lastItem ? Number(lastItem.qty) + 1000 : 1000;
    const nextPrice = lastItem ? Math.round(Number(lastItem.price) * 1.5) : 0;
    const nextLastPrice =
      lastItem?.lastPrice !== undefined ? lastItem.lastPrice : "";

    combos[comboIdx].quantityPrices = [
      ...list,
      { qty: nextQty, price: nextPrice, lastPrice: nextLastPrice },
    ];

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, combinationPrices: combos },
      },
    }));
  };

  const handleUpdateVariantCombinationPrice = (
    variantName,
    comboIdx,
    qpIdx,
    field,
    value,
  ) => {
    const details = formData.variantDetails[variantName] || {};
    const combos = JSON.parse(JSON.stringify(details.combinationPrices || []));
    if (!combos[comboIdx] || !combos[comboIdx].quantityPrices) return;

    const list = [...combos[comboIdx].quantityPrices];
    if (list[qpIdx]) {
      const parsed =
        value === "" ? "" : isNaN(Number(value)) ? value : Number(value);
      list[qpIdx][field] = parsed;
      combos[comboIdx].quantityPrices = list;

      setFormData((prev) => ({
        ...prev,
        variantDetails: {
          ...prev.variantDetails,
          [variantName]: { ...details, combinationPrices: combos },
        },
      }));
    }
  };

  const handleRemoveVariantCombinationPrice = (
    variantName,
    comboIdx,
    qpIdx,
  ) => {
    const details = formData.variantDetails[variantName] || {};
    const combos = JSON.parse(JSON.stringify(details.combinationPrices || []));
    if (!combos[comboIdx] || !combos[comboIdx].quantityPrices) return;

    combos[comboIdx].quantityPrices = combos[comboIdx].quantityPrices.filter(
      (_, i) => i !== qpIdx,
    );

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, combinationPrices: combos },
      },
    }));
  };

  const handleAutoFillVariantComboQuantities = (variantName, comboIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const combos = JSON.parse(JSON.stringify(details.combinationPrices || []));
    if (!combos[comboIdx]) return;

    let sourceQuantities = [];
    if (
      Array.isArray(details.fixedQuantities) &&
      details.fixedQuantities.length > 0
    ) {
      sourceQuantities = details.fixedQuantities.map((fq) => Number(fq.qty));
    } else {
      sourceQuantities = [1000, 2000, 3000, 4000, 8000, 12000, 16000];
    }

    const priceMap = {};
    (combos[comboIdx].quantityPrices || []).forEach((qp) => {
      priceMap[qp.qty] = qp;
    });

    combos[comboIdx].quantityPrices = sourceQuantities.map((qty) => {
      if (priceMap[qty]) return priceMap[qty];
      return { qty, price: 0, lastPrice: "" };
    });

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, combinationPrices: combos },
      },
    }));
  };

  const handleCopyVariantComboPricing = (
    variantName,
    targetComboIdx,
    sourceComboIdx,
  ) => {
    const details = formData.variantDetails[variantName] || {};
    const combos = JSON.parse(JSON.stringify(details.combinationPrices || []));
    if (!combos[targetComboIdx] || !combos[sourceComboIdx]) return;

    combos[targetComboIdx].quantityPrices = JSON.parse(
      JSON.stringify(combos[sourceComboIdx].quantityPrices || []),
    );

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, combinationPrices: combos },
      },
    }));

    showNotice(
      "success",
      `Copied pricing from Combo #${sourceComboIdx + 1} to Combo #${targetComboIdx + 1}!`,
    );
  };

  const handleDeleteVariantCombination = (variantName, comboIdx) => {
    const details = formData.variantDetails[variantName] || {};
    const combos = (details.combinationPrices || []).filter(
      (_, i) => i !== comboIdx,
    );

    setFormData((prev) => ({
      ...prev,
      variantDetails: {
        ...prev.variantDetails,
        [variantName]: { ...details, combinationPrices: combos },
      },
    }));
  };

  // Main Options Combination Handlers
  const handleSyncMainCombinations = () => {
    const options = formData.options || [];
    if (options.length === 0) {
      alert("Please add at least 1 or 2 options first.");
      return;
    }
    const generated = generateAttributeCombinations(options);
    const existing = formData.combinationPrices || [];

    const existingMap = {};
    existing.forEach((c) => {
      if (c && c.attributes) {
        const key = Object.entries(c.attributes)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k.toLowerCase()}:${v.toLowerCase()}`)
          .join("|");
        existingMap[key] = c;
      }
    });

    let sourceQuantities = [1000, 2000, 3000, 4000, 8000];
    if (
      Array.isArray(formData.fixedQuantities) &&
      formData.fixedQuantities.length > 0
    ) {
      sourceQuantities = formData.fixedQuantities.map((fq) => Number(fq.qty));
    }

    const merged = generated.map((gen) => {
      const key = Object.entries(gen.attributes)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k.toLowerCase()}:${v.toLowerCase()}`)
        .join("|");

      if (existingMap[key]) {
        return existingMap[key];
      }
      return {
        ...gen,
        quantityPrices: sourceQuantities.map((qty) => ({
          qty,
          price: 0,
          lastPrice: "",
        })),
      };
    });

    setFormData((prev) => ({ ...prev, combinationPrices: merged }));
    showNotice(
      "success",
      `Generated ${merged.length} main product attribute combinations!`,
    );
  };

  const handleUpdateMainCombinationPrice = (comboIdx, qpIdx, field, value) => {
    const combos = JSON.parse(JSON.stringify(formData.combinationPrices || []));
    if (!combos[comboIdx] || !combos[comboIdx].quantityPrices) return;

    const list = [...combos[comboIdx].quantityPrices];
    if (list[qpIdx]) {
      const parsed =
        value === "" ? "" : isNaN(Number(value)) ? value : Number(value);
      list[qpIdx][field] = parsed;
      combos[comboIdx].quantityPrices = list;
      setFormData((prev) => ({ ...prev, combinationPrices: combos }));
    }
  };

  const handleAddMainCombinationPriceRow = (comboIdx) => {
    const combos = JSON.parse(JSON.stringify(formData.combinationPrices || []));
    if (!combos[comboIdx]) return;
    const list = combos[comboIdx].quantityPrices || [];
    const lastItem = list[list.length - 1];
    const nextQty = lastItem ? Number(lastItem.qty) + 1000 : 1000;
    combos[comboIdx].quantityPrices = [
      ...list,
      { qty: nextQty, price: 0, lastPrice: "" },
    ];
    setFormData((prev) => ({ ...prev, combinationPrices: combos }));
  };

  const handleRemoveMainCombinationPrice = (comboIdx, qpIdx) => {
    const combos = JSON.parse(JSON.stringify(formData.combinationPrices || []));
    if (!combos[comboIdx] || !combos[comboIdx].quantityPrices) return;
    combos[comboIdx].quantityPrices = combos[comboIdx].quantityPrices.filter(
      (_, i) => i !== qpIdx,
    );
    setFormData((prev) => ({ ...prev, combinationPrices: combos }));
  };

  const handleDeleteMainCombination = (comboIdx) => {
    const combos = (formData.combinationPrices || []).filter(
      (_, i) => i !== comboIdx,
    );
    setFormData((prev) => ({ ...prev, combinationPrices: combos }));
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
      updatedOptions[optionIdx].values.push({
        label: "New Choice",
        priceAdjustment: 0,
      });
    }
    setFormData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const handleRemoveMainOptionValue = (optionIdx, valIdx) => {
    const updatedOptions = [...formData.options];
    if (updatedOptions[optionIdx]) {
      updatedOptions[optionIdx].values = updatedOptions[
        optionIdx
      ].values.filter((_, i) => i !== valIdx);
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
        formData.slug.trim() ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const allCleanImages = Array.from(
        new Set([formData.image, ...(formData.images || [])].filter(Boolean)),
      );

      const payload = {
        ...formData,
        image: formData.image || allCleanImages[0] || "",
        images: allCleanImages,
        slug: generatedSlug,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showNotice("success", `Product "${payload.name}" updated in MongoDB.`);
      } else {
        await addProduct(payload);
        showNotice("success", `Product "${payload.name}" created in MongoDB.`);
      }

      setIsModalOpen(false);
    } catch (err) {
      alert("Error saving product to MongoDB: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete product "${product.name}" from MongoDB? This action cannot be undone.`,
      )
    ) {
      try {
        setDeletingId(product.id);
        await deleteProduct(product.id);
        showNotice(
          "success",
          `Product "${product.name}" deleted from MongoDB.`,
        );
      } catch (err) {
        alert("Failed to delete product: " + err.message);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Notice Banner */}
        {notice && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all animate-fadeIn ${
              notice.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notice.type === "success" ? (
                <FiCheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <FiAlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{notice.message}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="p-0.5 hover:opacity-75"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Header Bar with Filters */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Product & Sub-category Manager
              </h2>
              <p className="text-xs text-slate-500">
                Manage products, sub-categories, calculations, pricing matrices,
                and options directly in MongoDB.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Refresh from MongoDB"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${isRefreshing || loading ? "animate-spin text-orange-600" : ""}`}
                />
              </button>

              <button
                onClick={openCreateModal}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                <FiPlus className="w-4 h-4" /> Create New Product
              </button>
            </div>
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              >
                <option value="">
                  All Sub-Categories ({allSubCategories.length})
                </option>
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
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-2.5">
                        <div className="w-7 h-7 border-3 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-semibold text-slate-600">
                          Loading products from MongoDB...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-400">
                      No products found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="w-10 h-10 rounded overflow-hidden border border-slate-200 bg-slate-100">
                          <ProductImage
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-orange-600">
                        #{p.code}
                      </td>
                      <td className="p-3 font-bold text-slate-900">{p.name}</td>
                      <td className="p-3 text-slate-500">{p.categoryId}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                          {p.subCategory || "General"}
                        </span>
                      </td>
                      <td className="p-3">
                        {p.variantCombinations &&
                        p.variantCombinations.length > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                            {p.variantCombinations.length} sub-sub options
                          </span>
                        ) : (
                          <span className="text-slate-400">Single Item</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-semibold">
                          {p.options?.length || 0} custom dropdowns
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        ₹{p.basePrice}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          / {p.unitName}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded flex items-center gap-1 transition-colors"
                            title="Edit Product, Sub-subs & Individual Prices/Descriptions"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded transition-colors disabled:opacity-50"
                            title="Delete Product from MongoDB"
                          >
                            {deletingId === p.id ? (
                              <FiRefreshCw className="w-4 h-4 text-rose-600 animate-spin" />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
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
                    <FiEdit2 className="w-4 h-4 text-orange-400" />
                    {editingProduct
                      ? `Edit Product: ${editingProduct.name}`
                      : "Create New Product"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Modify categories, sub-categories, individual sub-sub
                    variation prices, descriptions, specs, and options.
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
                      ? "border-orange-600 text-orange-600 bg-white rounded-t-lg"
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
                  <FiSliders className="w-4 h-4" /> Sub-Sub Variations &
                  Individual Details ({formData.variantCombinations.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("options")}
                  className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                    activeTab === "options"
                      ? "border-orange-600 text-orange-600 bg-white rounded-t-lg"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FiLayers className="w-4 h-4" /> Select Detail Options (
                  {formData.options.length})
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
              <form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col overflow-hidden"
              >
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
                            onChange={(e) =>
                              setFormData({ ...formData, code: e.target.value })
                            }
                            placeholder="e.g. VC-001"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                                  e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-"),
                              })
                            }
                            placeholder="e.g. 500 GSM + Velvet Card"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) =>
                              setFormData({ ...formData, slug: e.target.value })
                            }
                            placeholder="e.g. 500-gsm-velvet-card"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                categoryId: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                subCategory: e.target.value,
                              })
                            }
                            placeholder="e.g. 500 GSM CARDS (QTY. 500 CARDS)"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none font-semibold text-amber-800"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Matches sub-headings on Category Page (e.g., 500
                            GSM, 400 GSM CARDS).
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Unit Name
                          </label>
                          <input
                            type="text"
                            value={formData.unitName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                unitName: e.target.value,
                              })
                            }
                            placeholder="Cards / Pouches / Pcs"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                              setFormData({
                                ...formData,
                                minQuantity: Number(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Enter product description..."
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        />
                      </div>

                      {/* Product Images & Gallery Section */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                          <div>
                            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                              <FiImage className="w-4 h-4 text-orange-600" />
                              Product Images & Media Gallery (
                              {formData.images?.length ||
                                (formData.image ? 1 : 0)}
                              )
                            </label>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Upload multiple images at once. Images
                              automatically upload to{" "}
                              <strong>Cloudinary CDN</strong>.
                            </p>
                          </div>

                          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg cursor-pointer transition-colors shadow-xs">
                            <FiUploadCloud className="w-4 h-4" />
                            <span>
                              {uploadingImage
                                ? "Uploading to Cloudinary..."
                                : "Upload Multiple Images"}
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
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                          {(!formData.images || formData.images.length === 0) &&
                          !formData.image ? (
                            <p className="text-xs text-slate-400 italic py-2 text-center bg-white rounded-lg border border-dashed border-slate-200">
                              No product images added yet. Upload files above or
                              add an image URL.
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {Array.from(
                                new Set(
                                  [
                                    formData.image,
                                    ...(formData.images || []),
                                  ].filter(Boolean),
                                ),
                              ).map((imgUrl, idx) => {
                                const isPrimary = formData.image === imgUrl;
                                return (
                                  <div
                                    key={idx}
                                    className={`relative group rounded-xl overflow-hidden border-2 bg-white transition-all shadow-xs ${
                                      isPrimary
                                        ? "border-orange-600 ring-2 ring-orange-500/20"
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
                                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-orange-600 text-white text-[9px] font-extrabold uppercase rounded shadow-xs flex items-center gap-0.5">
                                        <FiStar className="w-2.5 h-2.5 fill-current" />{" "}
                                        Primary
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSetPrimaryImage(imgUrl)
                                        }
                                        className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-0.5 bg-slate-900/80 hover:bg-orange-600 text-white text-[9px] font-bold rounded shadow-xs"
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
                          <FiSliders className="w-4 h-4" /> Manage Sub-Sub
                          Categories & Individual Prices / Descriptions
                        </h4>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                          Each sub-sub variation below populates the{" "}
                          <strong>"SELECT PRODUCT"</strong> dropdown on the
                          product page and can have its own{" "}
                          <strong>
                            individual price, description, code, min qty, specs,
                            and custom options
                          </strong>
                          !
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
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Active Sub-Sub Variations (
                            {formData.variantCombinations.length})
                          </h4>
                          {formData.variantCombinations.length > 0 && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleExpandAllVariants(true)}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                              >
                                Expand All
                              </button>
                              <span className="text-slate-300">•</span>
                              <button
                                type="button"
                                onClick={() => handleExpandAllVariants(false)}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:underline"
                              >
                                Collapse All
                              </button>
                            </div>
                          )}
                        </div>

                        {formData.variantCombinations.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">
                            No sub-sub variations added yet. Standard product
                            options will be used.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {formData.variantCombinations.map((variantName) => {
                              const variantObj =
                                formData.variantDetails[variantName] || {};
                              const variantPricingTiers =
                                variantObj.quantityPricingTiers || [];
                              const variantOptions = variantObj.options || [];
                              const isExpanded =
                                !!expandedVariants[variantName];

                              return (
                                <div
                                  key={variantName}
                                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                                    isExpanded
                                      ? "p-4 sm:p-5 border-indigo-300 bg-white shadow-sm ring-1 ring-indigo-200/50"
                                      : "p-3 sm:p-4 border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-200 hover:shadow-xs"
                                  }`}
                                >
                                  {/* Sub-sub Variation Card Header (Click to Open / Close) */}
                                  <div
                                    onClick={() =>
                                      toggleVariantExpand(variantName)
                                    }
                                    className="flex items-center justify-between cursor-pointer select-none group/header"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                                      <div
                                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                          isExpanded
                                            ? "rotate-90 bg-indigo-600 text-white shadow-xs"
                                            : "bg-indigo-100 text-indigo-700 group-hover/header:bg-indigo-200"
                                        }`}
                                      >
                                        <FiChevronRight className="w-3.5 h-3.5" />
                                      </div>
                                      {editingVariantName === variantName ? (
                                        <div
                                          className="flex items-center gap-1.5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <input
                                            type="text"
                                            autoFocus
                                            value={tempVariantName}
                                            onChange={(e) =>
                                              setTempVariantName(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                if (
                                                  handleRenameVariantCombination(
                                                    variantName,
                                                    tempVariantName,
                                                  )
                                                ) {
                                                  setEditingVariantName(null);
                                                }
                                              } else if (e.key === "Escape") {
                                                setEditingVariantName(null);
                                              }
                                            }}
                                            className="px-2 py-0.5 text-xs border border-indigo-400 rounded-md font-bold text-indigo-950 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs min-w-[200px]"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (
                                                handleRenameVariantCombination(
                                                  variantName,
                                                  tempVariantName,
                                                )
                                              ) {
                                                setEditingVariantName(null);
                                              }
                                            }}
                                            className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-xs transition-colors"
                                            title="Save Name"
                                          >
                                            <FiCheck className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setEditingVariantName(null)
                                            }
                                            className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md transition-colors"
                                            title="Cancel"
                                          >
                                            <FiX className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 group/title">
                                          <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wide truncate">
                                            {variantName}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingVariantName(
                                                variantName,
                                              );
                                              setTempVariantName(variantName);
                                            }}
                                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                                            title="Edit Variation Name"
                                          >
                                            <FiEdit2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                      {variantObj.code && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-mono">
                                          {variantObj.code}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveVariantCombination(
                                            variantName,
                                          );
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                        title="Remove Sub-sub Variation"
                                      >
                                        <FiTrash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Collapsible Animated Container */}
                                  <div
                                    className={`grid transition-all duration-300 ease-in-out ${
                                      isExpanded
                                        ? "grid-rows-[1fr] opacity-100 pt-4 border-t border-indigo-100 mt-3"
                                        : "grid-rows-[0fr] opacity-0"
                                    }`}
                                  >
                                    <div className="overflow-hidden space-y-4">
                                      {/* Individual Settings for this specific Sub-sub Variation */}
                                      <div className="space-y-3">
                                        <div>
                                          <label className="block text-[10px] text-indigo-800 font-extrabold uppercase mb-1 flex items-center justify-between">
                                            <span>
                                              Sub-Sub Variation Name *
                                            </span>
                                            <span className="text-[9px] text-slate-400 font-normal lowercase">
                                              press Enter or click away to save
                                            </span>
                                          </label>
                                          <input
                                            type="text"
                                            key={`name-field-${variantName}`}
                                            defaultValue={variantName}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleRenameVariantCombination(
                                                  variantName,
                                                  e.target.value,
                                                );
                                              }
                                            }}
                                            onBlur={(e) => {
                                              if (
                                                e.target.value.trim() &&
                                                e.target.value.trim() !==
                                                  variantName
                                              ) {
                                                handleRenameVariantCombination(
                                                  variantName,
                                                  e.target.value,
                                                );
                                              }
                                            }}
                                            className="w-full px-2.5 py-1.5 text-xs border border-indigo-200 rounded-md font-bold text-indigo-950 bg-indigo-50/40 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                                          />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                          <div>
                                            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">
                                              Individual Code
                                            </label>
                                            <input
                                              type="text"
                                              value={variantObj.code || ""}
                                              onChange={(e) => {
                                                const updatedDetails = {
                                                  ...formData.variantDetails,
                                                };
                                                updatedDetails[variantName] = {
                                                  ...updatedDetails[
                                                    variantName
                                                  ],
                                                  code: e.target.value,
                                                };
                                                setFormData((prev) => ({
                                                  ...prev,
                                                  variantDetails:
                                                    updatedDetails,
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
                                              value={
                                                variantObj.basePrice ??
                                                formData.basePrice
                                              }
                                              onChange={(e) => {
                                                const updatedDetails = {
                                                  ...formData.variantDetails,
                                                };
                                                updatedDetails[variantName] = {
                                                  ...updatedDetails[
                                                    variantName
                                                  ],
                                                  basePrice: Number(
                                                    e.target.value,
                                                  ),
                                                };
                                                setFormData((prev) => ({
                                                  ...prev,
                                                  variantDetails:
                                                    updatedDetails,
                                                }));
                                              }}
                                              className="w-full px-2.5 py-1.5 text-xs border border-indigo-300 rounded font-black text-indigo-900 bg-indigo-50/50"
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
                                              const updatedDetails = {
                                                ...formData.variantDetails,
                                              };
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

                                      {/* Sub-sub Variation Quantity Selection Mode & Particular Pricing */}
                                      <div className="p-3.5 bg-gradient-to-br from-slate-50 to-orange-50/20 border border-slate-200 rounded-xl space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                                          <div>
                                            <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                              <FiTag className="w-3.5 h-3.5 text-orange-600" />
                                              {variantName} — Quantity Selection
                                              Mode & Pricing
                                            </label>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                              Choose whether this variation uses{" "}
                                              <strong>Increment (+/-)</strong>{" "}
                                              or{" "}
                                              <strong>
                                                Selecting (Dropdown)
                                              </strong>{" "}
                                              with custom prices.
                                            </p>
                                          </div>

                                          {/* Toggle Pills */}
                                          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/60 self-start sm:self-auto">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedDetails = {
                                                  ...formData.variantDetails,
                                                };
                                                updatedDetails[variantName] = {
                                                  ...variantObj,
                                                  quantityType: "incremental",
                                                };
                                                setFormData((prev) => ({
                                                  ...prev,
                                                  variantDetails:
                                                    updatedDetails,
                                                }));
                                              }}
                                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                                                (variantObj.quantityType ||
                                                  formData.quantityType) !==
                                                "select"
                                                  ? "bg-white text-orange-700 shadow-2xs"
                                                  : "text-slate-600 hover:text-slate-900"
                                              }`}
                                            >
                                              <FiSliders className="w-3 h-3" />
                                              <span>Increment</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedDetails = {
                                                  ...formData.variantDetails,
                                                };
                                                const existingFixed =
                                                  variantObj.fixedQuantities &&
                                                  variantObj.fixedQuantities
                                                    .length > 0
                                                    ? variantObj.fixedQuantities
                                                    : JSON.parse(
                                                        JSON.stringify(
                                                          formData.fixedQuantities ||
                                                            [],
                                                        ),
                                                      );
                                                updatedDetails[variantName] = {
                                                  ...variantObj,
                                                  quantityType: "select",
                                                  fixedQuantities:
                                                    existingFixed,
                                                };
                                                setFormData((prev) => ({
                                                  ...prev,
                                                  variantDetails:
                                                    updatedDetails,
                                                }));
                                              }}
                                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                                                (variantObj.quantityType ||
                                                  formData.quantityType) ===
                                                "select"
                                                  ? "bg-orange-600 text-white shadow-2xs"
                                                  : "text-slate-600 hover:text-slate-900"
                                              }`}
                                            >
                                              <FiList className="w-3 h-3" />
                                              <span>Selecting</span>
                                            </button>
                                          </div>
                                        </div>

                                        {/* If Select Dropdown is active for this variant */}
                                        {(variantObj.quantityType ||
                                          formData.quantityType) ===
                                        "select" ? (
                                          <div className="space-y-3 bg-white p-3.5 rounded-xl border border-orange-200 shadow-2xs">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200">
                                                    Dropdown Selection Active
                                                  </span>
                                                  <span className="text-xs font-bold text-slate-800">
                                                    Particular Quantity Prices (
                                                    {variantObj.fixedQuantities
                                                      ?.length || 0}
                                                    )
                                                  </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                  Set the exact prices customers
                                                  pay when selecting each
                                                  quantity for {variantName}.
                                                </p>
                                              </div>

                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleLoadStandardQuantitiesToVariant(
                                                      variantName,
                                                    )
                                                  }
                                                  className="px-2 py-1 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition-colors"
                                                  title="Auto-populate standard 1000 - 16000 quantities"
                                                >
                                                  ⚡ Load Standard
                                                </button>

                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleAddVariantFixedQuantity(
                                                      variantName,
                                                    )
                                                  }
                                                  className="px-2 py-1 text-[10px] font-bold bg-orange-600 hover:bg-orange-500 text-white rounded transition-colors flex items-center gap-1 shadow-2xs"
                                                >
                                                  <FiPlus className="w-3 h-3" />{" "}
                                                  Add Qty
                                                </button>
                                              </div>
                                            </div>

                                            {!variantObj.fixedQuantities ||
                                            variantObj.fixedQuantities
                                              .length === 0 ? (
                                              <div className="p-3 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200 space-y-1.5">
                                                <p className="text-xs text-slate-500 font-medium">
                                                  No quantity options configured
                                                  for {variantName}.
                                                </p>
                                                <div className="flex items-center justify-center gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleLoadStandardQuantitiesToVariant(
                                                        variantName,
                                                      )
                                                    }
                                                    className="px-2.5 py-1 text-[11px] font-bold bg-orange-600 text-white rounded-lg shadow-xs"
                                                  >
                                                    Load Standard Quantities (1k
                                                    - 16k)
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleCopyProductQuantitiesToVariant(
                                                        variantName,
                                                      )
                                                    }
                                                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-200 text-slate-800 rounded-lg"
                                                  >
                                                    Copy from General
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="overflow-x-auto rounded-lg border border-slate-200">
                                                <table className="w-full text-left text-xs">
                                                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                                                    <tr>
                                                      <th className="p-2">
                                                        Quantity (
                                                        {formData.unitName ||
                                                          "Units"}
                                                        )
                                                      </th>
                                                      <th className="p-2">
                                                        Particular Price (₹)
                                                      </th>
                                                      <th className="p-2">
                                                        Last Price (₹)
                                                      </th>
                                                      <th className="p-2 hidden sm:table-cell">
                                                        Rate / Unit
                                                      </th>
                                                      <th className="p-2 text-right">
                                                        Action
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-100 bg-white">
                                                    {variantObj.fixedQuantities.map(
                                                      (item, qIdx) => {
                                                        const unitRate =
                                                          item.qty > 0
                                                            ? (
                                                                item.price /
                                                                item.qty
                                                              ).toFixed(2)
                                                            : 0;
                                                        return (
                                                          <tr
                                                            key={qIdx}
                                                            className="hover:bg-orange-50/20 transition-colors"
                                                          >
                                                            <td className="p-2">
                                                              <input
                                                                type="number"
                                                                value={item.qty}
                                                                onChange={(e) =>
                                                                  handleUpdateVariantFixedQuantity(
                                                                    variantName,
                                                                    qIdx,
                                                                    "qty",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-full max-w-[130px] px-2 py-1 text-xs border border-slate-300 rounded font-bold text-slate-900 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                                placeholder="1000"
                                                              />
                                                            </td>
                                                            <td className="p-2">
                                                              <div className="flex items-center gap-1">
                                                                <span className="text-slate-400 font-bold">
                                                                  ₹
                                                                </span>
                                                                <input
                                                                  type="number"
                                                                  value={
                                                                    item.price
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    handleUpdateVariantFixedQuantity(
                                                                      variantName,
                                                                      qIdx,
                                                                      "price",
                                                                      e.target
                                                                        .value,
                                                                    )
                                                                  }
                                                                  className="w-full max-w-[130px] px-2 py-1 text-xs border border-orange-300 rounded font-black text-orange-950 bg-orange-50/30 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                                  placeholder="1800"
                                                                />
                                                              </div>
                                                            </td>
                                                            <td className="p-2">
                                                              <div className="flex items-center gap-1">
                                                                <span className="text-slate-400 font-bold">
                                                                  ₹
                                                                </span>
                                                                <input
                                                                  type="number"
                                                                  step="any"
                                                                  value={
                                                                    item.lastPrice !==
                                                                    undefined
                                                                      ? item.lastPrice
                                                                      : ""
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) =>
                                                                    handleUpdateVariantFixedQuantity(
                                                                      variantName,
                                                                      qIdx,
                                                                      "lastPrice",
                                                                      e.target
                                                                        .value,
                                                                    )
                                                                  }
                                                                  className="w-full max-w-[130px] px-2 py-1 text-xs border border-slate-300 rounded font-bold text-slate-800 bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                                  placeholder="e.g. 2100"
                                                                />
                                                              </div>
                                                            </td>
                                                            <td className="p-2 text-slate-500 text-[11px] font-mono hidden sm:table-cell">
                                                              ₹{unitRate} /{" "}
                                                              {formData.unitName?.slice(
                                                                0,
                                                                -1,
                                                              ) || "unit"}
                                                            </td>
                                                            <td className="p-2 text-right">
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  handleRemoveVariantFixedQuantity(
                                                                    variantName,
                                                                    qIdx,
                                                                  )
                                                                }
                                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                                title="Remove Quantity"
                                                              >
                                                                <FiTrash2 className="w-3.5 h-3.5" />
                                                              </button>
                                                            </td>
                                                          </tr>
                                                        );
                                                      },
                                                    )}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          /* If Incremental Mode for this variant */
                                          <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                                            <div className="flex items-center gap-2 text-slate-700">
                                              <FiSliders className="w-4 h-4 text-slate-500" />
                                              <span className="font-bold">
                                                Incremental Counter & Tiers for{" "}
                                                {variantName}
                                              </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                  Min Quantity Required
                                                </label>
                                                <input
                                                  type="number"
                                                  value={
                                                    variantObj.minQuantity ||
                                                    formData.minQuantity ||
                                                    1000
                                                  }
                                                  onChange={(e) => {
                                                    const updatedDetails = {
                                                      ...formData.variantDetails,
                                                    };
                                                    updatedDetails[
                                                      variantName
                                                    ] = {
                                                      ...variantObj,
                                                      minQuantity: Number(
                                                        e.target.value,
                                                      ),
                                                    };
                                                    setFormData((prev) => ({
                                                      ...prev,
                                                      variantDetails:
                                                        updatedDetails,
                                                    }));
                                                  }}
                                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                                                />
                                              </div>

                                              <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                                  Quantity Step / Increment
                                                </label>
                                                <input
                                                  type="number"
                                                  value={
                                                    variantObj.quantityStep ||
                                                    formData.quantityStep ||
                                                    1000
                                                  }
                                                  onChange={(e) => {
                                                    const updatedDetails = {
                                                      ...formData.variantDetails,
                                                    };
                                                    updatedDetails[
                                                      variantName
                                                    ] = {
                                                      ...variantObj,
                                                      quantityStep: Number(
                                                        e.target.value,
                                                      ),
                                                    };
                                                    setFormData((prev) => ({
                                                      ...prev,
                                                      variantDetails:
                                                        updatedDetails,
                                                    }));
                                                  }}
                                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded font-mono"
                                                />
                                              </div>
                                            </div>

                                            {/* Variation Pricing Tiers Table */}
                                            <div className="pt-2 border-t border-slate-100 space-y-2">
                                              <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                                                  <FiDollarSign className="w-3 h-3 text-emerald-600" />
                                                  Tiers (
                                                  {variantPricingTiers.length})
                                                </span>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleAddVariantPricingTier(
                                                      variantName,
                                                    )
                                                  }
                                                  className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 transition-colors flex items-center gap-1"
                                                >
                                                  <FiPlus className="w-3 h-3" />{" "}
                                                  Add Tier
                                                </button>
                                              </div>

                                              {variantPricingTiers.length ===
                                              0 ? (
                                                <p className="text-[10px] text-slate-400 italic bg-slate-50 p-2 rounded border border-dashed border-slate-200">
                                                  No variation-specific pricing
                                                  tiers configured. Base price
                                                  calculation will be used.
                                                </p>
                                              ) : (
                                                <div className="overflow-x-auto rounded border border-slate-200">
                                                  <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                                                      <tr>
                                                        <th className="p-2">
                                                          Min Quantity (
                                                          {formData.unitName ||
                                                            "Units"}
                                                          )
                                                        </th>
                                                        <th className="p-2">
                                                          Price Per Unit (₹)
                                                        </th>
                                                        <th className="p-2">
                                                          Last Price (₹)
                                                        </th>
                                                        <th className="p-2 text-right">
                                                          Action
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 bg-white">
                                                      {variantPricingTiers.map(
                                                        (tier, tIdx) => (
                                                          <tr
                                                            key={tIdx}
                                                            className="hover:bg-slate-50/50"
                                                          >
                                                            <td className="p-2">
                                                              <input
                                                                type="number"
                                                                value={
                                                                  tier.minQty
                                                                }
                                                                onChange={(
                                                                  e,
                                                                ) => {
                                                                  const updatedTiers =
                                                                    [
                                                                      ...variantPricingTiers,
                                                                    ];
                                                                  updatedTiers[
                                                                    tIdx
                                                                  ] = {
                                                                    ...updatedTiers[
                                                                      tIdx
                                                                    ],
                                                                    minQty:
                                                                      Number(
                                                                        e.target
                                                                          .value,
                                                                      ),
                                                                  };
                                                                  const updatedDetails =
                                                                    {
                                                                      ...formData.variantDetails,
                                                                      [variantName]:
                                                                        {
                                                                          ...variantObj,
                                                                          quantityPricingTiers:
                                                                            updatedTiers,
                                                                        },
                                                                    };
                                                                  setFormData(
                                                                    (prev) => ({
                                                                      ...prev,
                                                                      variantDetails:
                                                                        updatedDetails,
                                                                    }),
                                                                  );
                                                                }}
                                                                className="w-full max-w-[120px] px-2 py-1 text-xs border border-slate-300 rounded font-mono"
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
                                                                  value={
                                                                    tier.pricePerUnit
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) => {
                                                                    const updatedTiers =
                                                                      [
                                                                        ...variantPricingTiers,
                                                                      ];
                                                                    updatedTiers[
                                                                      tIdx
                                                                    ] = {
                                                                      ...updatedTiers[
                                                                        tIdx
                                                                      ],
                                                                      pricePerUnit:
                                                                        Number(
                                                                          e
                                                                            .target
                                                                            .value,
                                                                        ),
                                                                    };
                                                                    const updatedDetails =
                                                                      {
                                                                        ...formData.variantDetails,
                                                                        [variantName]:
                                                                          {
                                                                            ...variantObj,
                                                                            quantityPricingTiers:
                                                                              updatedTiers,
                                                                          },
                                                                      };
                                                                    setFormData(
                                                                      (
                                                                        prev,
                                                                      ) => ({
                                                                        ...prev,
                                                                        variantDetails:
                                                                          updatedDetails,
                                                                      }),
                                                                    );
                                                                  }}
                                                                  className="w-full max-w-[120px] px-2 py-1 text-xs border border-slate-300 rounded font-bold text-emerald-700 bg-white"
                                                                  placeholder="1.50"
                                                                />
                                                              </div>
                                                            </td>
                                                            <td className="p-2">
                                                              <div className="flex items-center gap-1">
                                                                <span className="text-slate-400 text-xs font-bold">
                                                                  ₹
                                                                </span>
                                                                <input
                                                                  type="number"
                                                                  step="any"
                                                                  value={
                                                                    tier.lastPrice !==
                                                                    undefined
                                                                      ? tier.lastPrice
                                                                      : ""
                                                                  }
                                                                  onChange={(
                                                                    e,
                                                                  ) => {
                                                                    const updatedTiers =
                                                                      [
                                                                        ...variantPricingTiers,
                                                                      ];
                                                                    updatedTiers[
                                                                      tIdx
                                                                    ] = {
                                                                      ...updatedTiers[
                                                                        tIdx
                                                                      ],
                                                                      lastPrice:
                                                                        e.target
                                                                          .value ===
                                                                        ""
                                                                          ? ""
                                                                          : Number(
                                                                              e
                                                                                .target
                                                                                .value,
                                                                            ),
                                                                    };
                                                                    const updatedDetails =
                                                                      {
                                                                        ...formData.variantDetails,
                                                                        [variantName]:
                                                                          {
                                                                            ...variantObj,
                                                                            quantityPricingTiers:
                                                                              updatedTiers,
                                                                          },
                                                                      };
                                                                    setFormData(
                                                                      (
                                                                        prev,
                                                                      ) => ({
                                                                        ...prev,
                                                                        variantDetails:
                                                                          updatedDetails,
                                                                      }),
                                                                    );
                                                                  }}
                                                                  className="w-full max-w-[120px] px-2 py-1 text-xs border border-slate-300 rounded font-bold text-slate-800 bg-white focus:ring-1 focus:ring-orange-500 focus:outline-none"
                                                                  placeholder="e.g. 1.80"
                                                                />
                                                              </div>
                                                            </td>
                                                            <td className="p-2 text-right">
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  handleRemoveVariantPricingTier(
                                                                    variantName,
                                                                    tIdx,
                                                                  )
                                                                }
                                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                                title="Remove Tier"
                                                              >
                                                                <FiTrash2 className="w-3.5 h-3.5" />
                                                              </button>
                                                            </td>
                                                          </tr>
                                                        ),
                                                      )}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Variation Custom Select Details */}
                                      <div className="pt-3 border-t border-slate-100 space-y-2">
                                        <div className="flex items-center justify-between">
                                          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                                            <FiTag className="w-3.5 h-3.5 text-indigo-600" />
                                            Variation Custom Options (
                                            {variantOptions.length})
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const optName = prompt(
                                                `Enter Custom Option Name for "${variantName}":`,
                                                "Printing",
                                              );
                                              if (optName)
                                                handleAddVariantOption(
                                                  variantName,
                                                  optName,
                                                );
                                            }}
                                            className="px-2 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded border border-indigo-200 transition-colors flex items-center gap-1"
                                          >
                                            <FiPlus className="w-3 h-3" /> Add
                                            Detail Option
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
                                                  const updatedOptions = [
                                                    ...variantOptions,
                                                  ];
                                                  updatedOptions[oIdx].name =
                                                    e.target.value;
                                                  const updatedDetails = {
                                                    ...formData.variantDetails,
                                                  };
                                                  updatedDetails[
                                                    variantName
                                                  ].options = updatedOptions;
                                                  setFormData((prev) => ({
                                                    ...prev,
                                                    variantDetails:
                                                      updatedDetails,
                                                  }));
                                                }}
                                                className="px-2 py-1 font-bold text-slate-800 bg-white border border-slate-300 rounded"
                                              />
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleRemoveVariantOption(
                                                    variantName,
                                                    oIdx,
                                                  )
                                                }
                                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                              >
                                                <FiTrash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>

                                            <div className="space-y-2">
                                              {(opt.values || []).map(
                                                (val, vIdx) => {
                                                  const isExpanded =
                                                    !!expandedChoices[
                                                      `${variantName}_${oIdx}_${vIdx}`
                                                    ];
                                                  const qpCount =
                                                    val.quantityPrices
                                                      ?.length || 0;

                                                  return (
                                                    <div
                                                      key={vIdx}
                                                      className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs space-y-2 text-xs"
                                                    >
                                                      <div className="flex items-center gap-2 flex-wrap">
                                                        <input
                                                          type="text"
                                                          value={val.label}
                                                          onChange={(e) => {
                                                            const updatedOptions =
                                                              [
                                                                ...variantOptions,
                                                              ];
                                                            updatedOptions[
                                                              oIdx
                                                            ].values[
                                                              vIdx
                                                            ].label =
                                                              e.target.value;
                                                            const updatedDetails =
                                                              {
                                                                ...formData.variantDetails,
                                                              };
                                                            updatedDetails[
                                                              variantName
                                                            ].options =
                                                              updatedOptions;
                                                            setFormData(
                                                              (prev) => ({
                                                                ...prev,
                                                                variantDetails:
                                                                  updatedDetails,
                                                              }),
                                                            );
                                                          }}
                                                          placeholder="Choice Label (e.g. Both Side, 90 GSM Art Paper)"
                                                          className="flex-1 min-w-[150px] px-2 py-1 bg-slate-50/70 border border-slate-300 rounded font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        />

                                                        <div
                                                          className="flex items-center gap-1"
                                                          title="Flat fallback adjustment if no quantity pricing row matches"
                                                        >
                                                          <span className="text-[10px] font-bold text-slate-400">
                                                            Flat ₹
                                                          </span>
                                                          <input
                                                            type="number"
                                                            value={
                                                              val.priceAdjustment !==
                                                              undefined
                                                                ? val.priceAdjustment
                                                                : 0
                                                            }
                                                            onChange={(e) => {
                                                              const updatedOptions =
                                                                [
                                                                  ...variantOptions,
                                                                ];
                                                              updatedOptions[
                                                                oIdx
                                                              ].values[
                                                                vIdx
                                                              ].priceAdjustment =
                                                                Number(
                                                                  e.target
                                                                    .value,
                                                                ) || 0;
                                                              const updatedDetails =
                                                                {
                                                                  ...formData.variantDetails,
                                                                };
                                                              updatedDetails[
                                                                variantName
                                                              ].options =
                                                                updatedOptions;
                                                              setFormData(
                                                                (prev) => ({
                                                                  ...prev,
                                                                  variantDetails:
                                                                    updatedDetails,
                                                                }),
                                                              );
                                                            }}
                                                            placeholder="0"
                                                            className="w-16 px-1.5 py-1 bg-slate-50/70 border border-slate-300 rounded font-bold text-slate-800 text-right focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                          />
                                                        </div>

                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            toggleChoiceQtyExpand(
                                                              variantName,
                                                              oIdx,
                                                              vIdx,
                                                            )
                                                          }
                                                          className={`px-2 py-1 text-[11px] font-bold rounded flex items-center gap-1 border transition-all ${
                                                            qpCount > 0
                                                              ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs"
                                                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                                          }`}
                                                          title="Configure Quantity, Particular Price, and Last Price for this choice"
                                                        >
                                                          <FiSliders className="w-3 h-3 text-indigo-600" />
                                                          <span>
                                                            Qty Pricing (
                                                            {qpCount})
                                                          </span>
                                                          {isExpanded ? (
                                                            <FiChevronUp className="w-3 h-3" />
                                                          ) : (
                                                            <FiChevronDown className="w-3 h-3" />
                                                          )}
                                                        </button>

                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            handleRemoveVariantOptionValue(
                                                              variantName,
                                                              oIdx,
                                                              vIdx,
                                                            )
                                                          }
                                                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                          title="Delete Choice"
                                                        >
                                                          <FiX className="w-4 h-4" />
                                                        </button>
                                                      </div>

                                                      {/* Quantity-Wise Pricing Table (Quantity, Particular Price, Last Price) */}
                                                      {isExpanded && (
                                                        <div className="p-2.5 bg-slate-50/80 rounded-lg border border-indigo-100 space-y-2 mt-1">
                                                          <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1">
                                                              <FiDollarSign className="w-3 h-3 text-indigo-600" />
                                                              Quantity Pricing
                                                              for &ldquo;
                                                              {val.label ||
                                                                "Choice"}
                                                              &rdquo;
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  handleSyncChoiceQuantities(
                                                                    variantName,
                                                                    oIdx,
                                                                    vIdx,
                                                                  )
                                                                }
                                                                className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition-colors"
                                                                title="Auto-fill quantities from this variation's fixed quantities"
                                                              >
                                                                ⚡ Auto-Fill
                                                                Quantities
                                                              </button>
                                                              <button
                                                                type="button"
                                                                onClick={() =>
                                                                  handleAddChoiceQuantityPrice(
                                                                    variantName,
                                                                    oIdx,
                                                                    vIdx,
                                                                  )
                                                                }
                                                                className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center gap-0.5 shadow-2xs"
                                                              >
                                                                <FiPlus className="w-3 h-3" />{" "}
                                                                Add Qty
                                                              </button>
                                                            </div>
                                                          </div>

                                                          {!val.quantityPrices ||
                                                          val.quantityPrices
                                                            .length === 0 ? (
                                                            <p className="text-[10px] text-slate-400 italic py-1">
                                                              No quantity prices
                                                              set. Click
                                                              &ldquo;⚡
                                                              Auto-Fill
                                                              Quantities&rdquo;
                                                              or &ldquo;+ Add
                                                              Qty&rdquo; to
                                                              customize prices
                                                              per quantity.
                                                            </p>
                                                          ) : (
                                                            <div className="overflow-x-auto rounded border border-slate-200 bg-white">
                                                              <table className="w-full text-left text-xs">
                                                                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                                                                  <tr>
                                                                    <th className="p-1.5">
                                                                      Quantity
                                                                    </th>
                                                                    <th className="p-1.5">
                                                                      Particular
                                                                      Price (₹)
                                                                    </th>
                                                                    <th className="p-1.5">
                                                                      Last Price
                                                                      (₹)
                                                                    </th>
                                                                    <th className="p-1.5 text-right">
                                                                      Action
                                                                    </th>
                                                                  </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100">
                                                                  {val.quantityPrices.map(
                                                                    (
                                                                      qp,
                                                                      qpIdx,
                                                                    ) => (
                                                                      <tr
                                                                        key={
                                                                          qpIdx
                                                                        }
                                                                        className="hover:bg-indigo-50/20 transition-colors"
                                                                      >
                                                                        <td className="p-1.5">
                                                                          <input
                                                                            type="number"
                                                                            value={
                                                                              qp.qty
                                                                            }
                                                                            onChange={(
                                                                              e,
                                                                            ) =>
                                                                              handleUpdateChoiceQuantityPrice(
                                                                                variantName,
                                                                                oIdx,
                                                                                vIdx,
                                                                                qpIdx,
                                                                                "qty",
                                                                                e
                                                                                  .target
                                                                                  .value,
                                                                              )
                                                                            }
                                                                            className="w-24 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                            placeholder="1000"
                                                                          />
                                                                        </td>
                                                                        <td className="p-1.5">
                                                                          <div className="flex items-center gap-1">
                                                                            <span className="text-slate-400 font-bold">
                                                                              ₹
                                                                            </span>
                                                                            <input
                                                                              type="number"
                                                                              step="any"
                                                                              value={
                                                                                qp.price
                                                                              }
                                                                              onChange={(
                                                                                e,
                                                                              ) =>
                                                                                handleUpdateChoiceQuantityPrice(
                                                                                  variantName,
                                                                                  oIdx,
                                                                                  vIdx,
                                                                                  qpIdx,
                                                                                  "price",
                                                                                  e
                                                                                    .target
                                                                                    .value,
                                                                                )
                                                                              }
                                                                              className="w-24 px-1.5 py-0.5 text-xs border border-indigo-200 rounded font-bold text-indigo-950 bg-indigo-50/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                              placeholder="500"
                                                                            />
                                                                          </div>
                                                                        </td>
                                                                        <td className="p-1.5">
                                                                          <div className="flex items-center gap-1">
                                                                            <span className="text-slate-400 font-bold">
                                                                              ₹
                                                                            </span>
                                                                            <input
                                                                              type="number"
                                                                              step="any"
                                                                              value={
                                                                                qp.lastPrice !==
                                                                                undefined
                                                                                  ? qp.lastPrice
                                                                                  : ""
                                                                              }
                                                                              onChange={(
                                                                                e,
                                                                              ) =>
                                                                                handleUpdateChoiceQuantityPrice(
                                                                                  variantName,
                                                                                  oIdx,
                                                                                  vIdx,
                                                                                  qpIdx,
                                                                                  "lastPrice",
                                                                                  e
                                                                                    .target
                                                                                    .value,
                                                                                )
                                                                              }
                                                                              className="w-24 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                              placeholder="e.g. 450"
                                                                            />
                                                                          </div>
                                                                        </td>
                                                                        <td className="p-1.5 text-right">
                                                                          <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                              handleRemoveChoiceQuantityPrice(
                                                                                variantName,
                                                                                oIdx,
                                                                                vIdx,
                                                                                qpIdx,
                                                                              )
                                                                            }
                                                                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                                            title="Remove Quantity Price"
                                                                          >
                                                                            <FiTrash2 className="w-3.5 h-3.5" />
                                                                          </button>
                                                                        </td>
                                                                      </tr>
                                                                    ),
                                                                  )}
                                                                </tbody>
                                                              </table>
                                                            </div>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  );
                                                },
                                              )}
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleAddVariantOptionValue(
                                                    variantName,
                                                    oIdx,
                                                  )
                                                }
                                                className="text-[11px] font-bold text-indigo-600 hover:underline"
                                              >
                                                + Add Choice
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {/* DYNAMIC COMBINATION MATRIX FOR THIS SUB-SUB VARIANT */}
                                      {(() => {
                                        const comboPrices =
                                          variantObj.combinationPrices || [];

                                        return (
                                          <div className="mt-4 p-3.5 bg-gradient-to-r from-indigo-50/70 via-slate-50 to-purple-50/50 rounded-xl border border-indigo-200/80 shadow-2xs space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                                              <div>
                                                <h5 className="text-xs font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                                                  <FiGrid className="w-4 h-4 text-indigo-600" />
                                                  Attribute Combination &
                                                  Quantity Matrix (Cross-Option
                                                  Pricing)
                                                </h5>
                                              </div>
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    handleSyncVariantCombinations(
                                                      variantName,
                                                    )
                                                  }
                                                  className="px-2.5 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                                                  title="Generate combinations from all custom options above"
                                                >
                                                  <FiRefreshCw className="w-3 h-3" />
                                                  <span>
                                                    Generate (
                                                    {comboPrices.length})
                                                  </span>
                                                </button>
                                                {comboPrices.length > 0 && (
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      handleClearVariantCombinations(
                                                        variantName,
                                                      )
                                                    }
                                                    className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200 transition-colors"
                                                    title="Clear all combinations"
                                                  >
                                                    Clear
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            {comboPrices.length === 0 ? (
                                              <div className="py-4 text-center text-xs text-slate-500 bg-white/70 rounded-lg border border-dashed border-indigo-200">
                                                <p className="font-semibold text-slate-700">
                                                  No combination matrix
                                                  generated yet.
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                  Add custom options above (e.g.
                                                  Paper Quality, Printing), then
                                                  click{" "}
                                                  <strong>
                                                    &quot;Generate&quot;
                                                  </strong>
                                                  .
                                                </p>
                                              </div>
                                            ) : (
                                              <div className="space-y-2.5">
                                                {comboPrices.map(
                                                  (combo, cIdx) => {
                                                    const comboKey = `${variantName}_combo_${cIdx}`;
                                                    const isExpanded =
                                                      expandedCombos[
                                                        comboKey
                                                      ] !== false;
                                                    const qpList =
                                                      combo.quantityPrices ||
                                                      [];

                                                    return (
                                                      <div
                                                        key={cIdx}
                                                        className="bg-white rounded-lg border border-indigo-100 shadow-2xs overflow-hidden transition-all"
                                                      >
                                                        {/* Combo Header */}
                                                        <div className="p-2.5 bg-slate-50/80 hover:bg-indigo-50/40 border-b border-indigo-50 flex items-center justify-between gap-2 flex-wrap">
                                                          <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                              Combo #{cIdx + 1}:
                                                            </span>
                                                            {Object.entries(
                                                              combo.attributes ||
                                                                {},
                                                            ).map(
                                                              (
                                                                [aKey, aVal],
                                                                aIdx,
                                                              ) => (
                                                                <span
                                                                  key={aIdx}
                                                                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100/80 text-indigo-900 border border-indigo-200/70"
                                                                >
                                                                  <span className="text-indigo-600 font-normal">
                                                                    {aKey}:{" "}
                                                                  </span>
                                                                  {aVal}
                                                                </span>
                                                              ),
                                                            )}
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                              {qpList.length}{" "}
                                                              Qty Tiers
                                                            </span>
                                                          </div>

                                                          <div className="flex items-center gap-1.5">
                                                            {comboPrices.length >
                                                              1 && (
                                                              <select
                                                                value=""
                                                                onChange={(
                                                                  e,
                                                                ) => {
                                                                  if (
                                                                    e.target
                                                                      .value !==
                                                                    ""
                                                                  ) {
                                                                    handleCopyVariantComboPricing(
                                                                      variantName,
                                                                      cIdx,
                                                                      Number(
                                                                        e.target
                                                                          .value,
                                                                      ),
                                                                    );
                                                                  }
                                                                }}
                                                                className="text-[10px] px-1.5 py-0.5 border border-slate-200 rounded bg-white text-slate-700 font-semibold focus:outline-none"
                                                                title="Copy quantity pricing from another combination"
                                                              >
                                                                <option value="">
                                                                  📋 Copy prices
                                                                  from...
                                                                </option>
                                                                {comboPrices.map(
                                                                  (
                                                                    otherCombo,
                                                                    oIdx,
                                                                  ) => {
                                                                    if (
                                                                      oIdx ===
                                                                      cIdx
                                                                    )
                                                                      return null;
                                                                    const label =
                                                                      Object.values(
                                                                        otherCombo.attributes ||
                                                                          {},
                                                                      ).join(
                                                                        " + ",
                                                                      );
                                                                    return (
                                                                      <option
                                                                        key={
                                                                          oIdx
                                                                        }
                                                                        value={
                                                                          oIdx
                                                                        }
                                                                      >
                                                                        From:{" "}
                                                                        {label ||
                                                                          `Combo #${oIdx + 1}`}
                                                                      </option>
                                                                    );
                                                                  },
                                                                )}
                                                              </select>
                                                            )}

                                                            <button
                                                              type="button"
                                                              onClick={() =>
                                                                toggleComboExpand(
                                                                  comboKey,
                                                                )
                                                              }
                                                              className="px-2 py-0.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100/70 rounded flex items-center gap-1 transition-colors"
                                                            >
                                                              {isExpanded ? (
                                                                <>
                                                                  <span>
                                                                    Collapse
                                                                  </span>
                                                                  <FiChevronUp className="w-3.5 h-3.5" />
                                                                </>
                                                              ) : (
                                                                <>
                                                                  <span>
                                                                    Edit Tiers (
                                                                    {
                                                                      qpList.length
                                                                    }
                                                                    )
                                                                  </span>
                                                                  <FiChevronDown className="w-3.5 h-3.5" />
                                                                </>
                                                              )}
                                                            </button>

                                                            <button
                                                              type="button"
                                                              onClick={() =>
                                                                handleDeleteVariantCombination(
                                                                  variantName,
                                                                  cIdx,
                                                                )
                                                              }
                                                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                              title="Remove this combination"
                                                            >
                                                              <FiTrash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                          </div>
                                                        </div>

                                                        {/* Quantity Table inside Combo Card */}
                                                        {isExpanded && (
                                                          <div className="p-3 bg-white space-y-2">
                                                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                                Quantity Pricing
                                                                & Last Price for
                                                                this Combination
                                                              </span>
                                                              <div className="flex items-center gap-1.5">
                                                                <button
                                                                  type="button"
                                                                  onClick={() =>
                                                                    handleAutoFillVariantComboQuantities(
                                                                      variantName,
                                                                      cIdx,
                                                                    )
                                                                  }
                                                                  className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 transition-colors"
                                                                  title="Auto-fill standard quantities from fixed quantities"
                                                                >
                                                                  ⚡ Auto-Fill
                                                                  Quantities
                                                                </button>
                                                                <button
                                                                  type="button"
                                                                  onClick={() =>
                                                                    handleAddVariantCombinationPriceRow(
                                                                      variantName,
                                                                      cIdx,
                                                                    )
                                                                  }
                                                                  className="px-2 py-0.5 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors flex items-center gap-0.5 shadow-2xs"
                                                                >
                                                                  <FiPlus className="w-3 h-3" />{" "}
                                                                  Add Qty
                                                                </button>
                                                              </div>
                                                            </div>

                                                            {qpList.length ===
                                                            0 ? (
                                                              <p className="text-[11px] text-slate-400 italic py-2 text-center">
                                                                No quantity
                                                                tiers defined.
                                                                Click
                                                                &quot;Auto-Fill
                                                                Quantities&quot;
                                                                or &quot;Add
                                                                Qty&quot; above.
                                                              </p>
                                                            ) : (
                                                              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                                                <table className="w-full text-left text-xs border-collapse">
                                                                  <thead>
                                                                    <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                                                                      <th className="p-1.5 pl-2.5">
                                                                        Quantity
                                                                        (Pcs)
                                                                      </th>
                                                                      <th className="p-1.5">
                                                                        Particular
                                                                        Price
                                                                        (₹)
                                                                      </th>
                                                                      <th className="p-1.5">
                                                                        Last
                                                                        Price
                                                                        (₹)
                                                                      </th>
                                                                      <th className="p-1.5">
                                                                        Rate /
                                                                        Pc
                                                                      </th>
                                                                      <th className="p-1.5 pr-2.5 text-right">
                                                                        Action
                                                                      </th>
                                                                    </tr>
                                                                  </thead>
                                                                  <tbody className="divide-y divide-slate-100">
                                                                    {qpList.map(
                                                                      (
                                                                        qp,
                                                                        qpIdx,
                                                                      ) => {
                                                                        const unitRate =
                                                                          qp.qty &&
                                                                          Number(
                                                                            qp.qty,
                                                                          ) >
                                                                            0 &&
                                                                          qp.price
                                                                            ? (
                                                                                Number(
                                                                                  qp.price,
                                                                                ) /
                                                                                Number(
                                                                                  qp.qty,
                                                                                )
                                                                              ).toFixed(
                                                                                2,
                                                                              )
                                                                            : null;

                                                                        return (
                                                                          <tr
                                                                            key={
                                                                              qpIdx
                                                                            }
                                                                            className="hover:bg-indigo-50/20"
                                                                          >
                                                                            <td className="p-1.5 pl-2.5">
                                                                              <input
                                                                                type="number"
                                                                                value={
                                                                                  qp.qty
                                                                                }
                                                                                onChange={(
                                                                                  e,
                                                                                ) =>
                                                                                  handleUpdateVariantCombinationPrice(
                                                                                    variantName,
                                                                                    cIdx,
                                                                                    qpIdx,
                                                                                    "qty",
                                                                                    e
                                                                                      .target
                                                                                      .value,
                                                                                  )
                                                                                }
                                                                                className="w-24 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                                placeholder="1000"
                                                                              />
                                                                            </td>
                                                                            <td className="p-1.5">
                                                                              <div className="flex items-center gap-1">
                                                                                <span className="text-slate-400 font-bold">
                                                                                  ₹
                                                                                </span>
                                                                                <input
                                                                                  type="number"
                                                                                  step="any"
                                                                                  value={
                                                                                    qp.price
                                                                                  }
                                                                                  onChange={(
                                                                                    e,
                                                                                  ) =>
                                                                                    handleUpdateVariantCombinationPrice(
                                                                                      variantName,
                                                                                      cIdx,
                                                                                      qpIdx,
                                                                                      "price",
                                                                                      e
                                                                                        .target
                                                                                        .value,
                                                                                    )
                                                                                  }
                                                                                  className="w-24 px-1.5 py-0.5 text-xs border border-indigo-200 rounded font-bold text-indigo-950 bg-indigo-50/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                                  placeholder="0"
                                                                                />
                                                                              </div>
                                                                            </td>
                                                                            <td className="p-1.5">
                                                                              <div className="flex items-center gap-1">
                                                                                <span className="text-slate-400 font-bold">
                                                                                  ₹
                                                                                </span>
                                                                                <input
                                                                                  type="number"
                                                                                  step="any"
                                                                                  value={
                                                                                    qp.lastPrice !==
                                                                                    undefined
                                                                                      ? qp.lastPrice
                                                                                      : ""
                                                                                  }
                                                                                  onChange={(
                                                                                    e,
                                                                                  ) =>
                                                                                    handleUpdateVariantCombinationPrice(
                                                                                      variantName,
                                                                                      cIdx,
                                                                                      qpIdx,
                                                                                      "lastPrice",
                                                                                      e
                                                                                        .target
                                                                                        .value,
                                                                                    )
                                                                                  }
                                                                                  className="w-24 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                                  placeholder="Hover Cost"
                                                                                />
                                                                              </div>
                                                                            </td>
                                                                            <td className="p-1.5">
                                                                              {unitRate ? (
                                                                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                                                                                  ₹
                                                                                  {
                                                                                    unitRate
                                                                                  }
                                                                                  /pc
                                                                                </span>
                                                                              ) : (
                                                                                <span className="text-[10px] text-slate-400">
                                                                                  —
                                                                                </span>
                                                                              )}
                                                                            </td>
                                                                            <td className="p-1.5 pr-2.5 text-right">
                                                                              <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                  handleRemoveVariantCombinationPrice(
                                                                                    variantName,
                                                                                    cIdx,
                                                                                    qpIdx,
                                                                                  )
                                                                                }
                                                                                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                                                                title="Remove Quantity Tier"
                                                                              >
                                                                                <FiTrash2 className="w-3.5 h-3.5" />
                                                                              </button>
                                                                            </td>
                                                                          </tr>
                                                                        );
                                                                      },
                                                                    )}
                                                                  </tbody>
                                                                </table>
                                                              </div>
                                                            )}
                                                          </div>
                                                        )}
                                                      </div>
                                                    );
                                                  },
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
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
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-2">
                          <FiLayers className="w-4 h-4" /> Manage Custom Select
                          Detail Options
                        </h4>
                        <p className="text-xs text-orange-700 leading-relaxed">
                          These options appear under the{" "}
                          <strong>"SELECT DETAIL"</strong> section on the
                          product page (e.g. <em>Printing Side</em>,{" "}
                          <em>Corner Finishing</em>, <em>Foil Color</em>).
                        </p>

                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={newMainOptionName}
                            onChange={(e) =>
                              setNewMainOptionName(e.target.value)
                            }
                            placeholder="e.g. Corner Type, Foil Color, Printing"
                            className="flex-1 px-3 py-2 text-xs border border-orange-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddMainOption}
                            className="px-4 py-2 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center gap-1"
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
                                      const updatedOptions = [
                                        ...formData.options,
                                      ];
                                      updatedOptions[optionIdx].name =
                                        e.target.value;
                                      setFormData((prev) => ({
                                        ...prev,
                                        options: updatedOptions,
                                      }));
                                    }}
                                    className="font-bold text-xs text-slate-900 px-2 py-1 border border-slate-300 rounded"
                                  />
                                  <label className="flex items-center space-x-1.5 text-xs text-slate-600 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={opt.required !== false}
                                      onChange={(e) => {
                                        const updatedOptions = [
                                          ...formData.options,
                                        ];
                                        updatedOptions[optionIdx].required =
                                          e.target.checked;
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
                                  onClick={() =>
                                    handleRemoveMainOption(optionIdx)
                                  }
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
                                  <div
                                    key={valIdx}
                                    className="flex items-center space-x-2 text-xs"
                                  >
                                    <input
                                      type="text"
                                      value={val.label}
                                      onChange={(e) => {
                                        const updatedOptions = [
                                          ...formData.options,
                                        ];
                                        updatedOptions[optionIdx].values[
                                          valIdx
                                        ].label = e.target.value;
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
                                          const updatedOptions = [
                                            ...formData.options,
                                          ];
                                          updatedOptions[optionIdx].values[
                                            valIdx
                                          ].priceAdjustment = Number(
                                            e.target.value,
                                          );
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
                                        handleRemoveMainOptionValue(
                                          optionIdx,
                                          valIdx,
                                        )
                                      }
                                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                    >
                                      <FiX className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddMainOptionValue(optionIdx)
                                  }
                                  className="text-xs font-bold text-orange-600 hover:underline inline-flex items-center gap-1 pt-1"
                                >
                                  <FiPlus className="w-3.5 h-3.5" /> Add
                                  Dropdown Choice
                                </button>
                              </div>
                            </div>
                          ))
                        )}

                        {/* MAIN PRODUCT COMBINATION MATRIX */}
                        {(() => {
                          const comboPrices = formData.combinationPrices || [];

                          return (
                            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50/70 via-slate-50 to-amber-50/50 rounded-xl border border-orange-200/80 shadow-2xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-100 pb-2.5">
                                <div>
                                  <h5 className="text-xs font-black text-orange-950 uppercase tracking-wide flex items-center gap-1.5">
                                    <FiGrid className="w-4 h-4 text-orange-600" />
                                    Main Product Attribute Combination &
                                    Quantity Matrix
                                  </h5>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Define non-additive package prices for
                                    combinations of the select detail options
                                    above per quantity tier.
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={handleSyncMainCombinations}
                                    className="px-2.5 py-1 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                                  >
                                    <FiRefreshCw className="w-3 h-3" />
                                    <span>
                                      Sync Combinations ({comboPrices.length})
                                    </span>
                                  </button>
                                  {comboPrices.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          combinationPrices: [],
                                        }))
                                      }
                                      className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 rounded border border-slate-200"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              </div>

                              {comboPrices.length === 0 ? (
                                <div className="py-4 text-center text-xs text-slate-500 bg-white/70 rounded-lg border border-dashed border-orange-200">
                                  <p className="font-semibold text-slate-700">
                                    No combination matrix generated yet.
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    Add 2 or more options above, then click{" "}
                                    <strong>
                                      &quot;Sync Combinations&quot;
                                    </strong>
                                    .
                                  </p>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {comboPrices.map((combo, cIdx) => {
                                    const comboKey = `main_combo_${cIdx}`;
                                    const isExpanded =
                                      expandedCombos[comboKey] !== false;
                                    const qpList = combo.quantityPrices || [];

                                    return (
                                      <div
                                        key={cIdx}
                                        className="bg-white rounded-lg border border-orange-100 shadow-2xs overflow-hidden"
                                      >
                                        <div className="p-2.5 bg-slate-50/80 hover:bg-orange-50/30 border-b border-orange-100 flex items-center justify-between gap-2 flex-wrap">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                              Combo #{cIdx + 1}:
                                            </span>
                                            {Object.entries(
                                              combo.attributes || {},
                                            ).map(([aKey, aVal], aIdx) => (
                                              <span
                                                key={aIdx}
                                                className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100/80 text-orange-900 border border-orange-200/70"
                                              >
                                                <span className="text-orange-600 font-normal">
                                                  {aKey}:{" "}
                                                </span>
                                                {aVal}
                                              </span>
                                            ))}
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                              {qpList.length} Tiers
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                toggleComboExpand(comboKey)
                                              }
                                              className="px-2 py-0.5 text-[11px] font-bold text-orange-700 hover:bg-orange-100/70 rounded flex items-center gap-1"
                                            >
                                              {isExpanded ? (
                                                <>
                                                  <span>Collapse</span>
                                                  <FiChevronUp className="w-3.5 h-3.5" />
                                                </>
                                              ) : (
                                                <>
                                                  <span>
                                                    Edit Tiers ({qpList.length})
                                                  </span>
                                                  <FiChevronDown className="w-3.5 h-3.5" />
                                                </>
                                              )}
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDeleteMainCombination(
                                                  cIdx,
                                                )
                                              }
                                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                            >
                                              <FiTrash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {isExpanded && (
                                          <div className="p-3 bg-white space-y-2">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[10px] font-bold uppercase text-slate-500">
                                                Quantity Pricing & Last Price
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  handleAddMainCombinationPriceRow(
                                                    cIdx,
                                                  )
                                                }
                                                className="px-2 py-0.5 text-[10px] font-bold bg-orange-600 hover:bg-orange-700 text-white rounded flex items-center gap-0.5"
                                              >
                                                <FiPlus className="w-3 h-3" />{" "}
                                                Add Qty
                                              </button>
                                            </div>

                                            {qpList.length > 0 && (
                                              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                                <table className="w-full text-left text-xs border-collapse">
                                                  <thead>
                                                    <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold">
                                                      <th className="p-1.5 pl-2.5">
                                                        Quantity (Pcs)
                                                      </th>
                                                      <th className="p-1.5">
                                                        Price (₹)
                                                      </th>
                                                      <th className="p-1.5">
                                                        Last Price (₹)
                                                      </th>
                                                      <th className="p-1.5">
                                                        Rate / Pc
                                                      </th>
                                                      <th className="p-1.5 pr-2.5 text-right">
                                                        Action
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-100">
                                                    {qpList.map((qp, qpIdx) => {
                                                      const unitRate =
                                                        qp.qty &&
                                                        Number(qp.qty) > 0 &&
                                                        qp.price
                                                          ? (
                                                              Number(qp.price) /
                                                              Number(qp.qty)
                                                            ).toFixed(2)
                                                          : null;

                                                      return (
                                                        <tr
                                                          key={qpIdx}
                                                          className="hover:bg-orange-50/20"
                                                        >
                                                          <td className="p-1.5 pl-2.5">
                                                            <input
                                                              type="number"
                                                              value={qp.qty}
                                                              onChange={(e) =>
                                                                handleUpdateMainCombinationPrice(
                                                                  cIdx,
                                                                  qpIdx,
                                                                  "qty",
                                                                  e.target
                                                                    .value,
                                                                )
                                                              }
                                                              className="w-24 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-bold text-slate-900"
                                                              placeholder="1000"
                                                            />
                                                          </td>
                                                          <td className="p-1.5">
                                                            <div className="flex items-center gap-1">
                                                              <span className="text-slate-400 font-bold">
                                                                ₹
                                                              </span>
                                                              <input
                                                                type="number"
                                                                step="any"
                                                                value={qp.price}
                                                                onChange={(e) =>
                                                                  handleUpdateMainCombinationPrice(
                                                                    cIdx,
                                                                    qpIdx,
                                                                    "price",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-24 px-1.5 py-0.5 text-xs border border-orange-200 rounded font-bold text-orange-950 bg-orange-50/20"
                                                                placeholder="0"
                                                              />
                                                            </div>
                                                          </td>
                                                          <td className="p-1.5">
                                                            <div className="flex items-center gap-1">
                                                              <span className="text-slate-400 font-bold">
                                                                ₹
                                                              </span>
                                                              <input
                                                                type="number"
                                                                step="any"
                                                                value={
                                                                  qp.lastPrice !==
                                                                  undefined
                                                                    ? qp.lastPrice
                                                                    : ""
                                                                }
                                                                onChange={(e) =>
                                                                  handleUpdateMainCombinationPrice(
                                                                    cIdx,
                                                                    qpIdx,
                                                                    "lastPrice",
                                                                    e.target
                                                                      .value,
                                                                  )
                                                                }
                                                                className="w-24 px-1.5 py-0.5 text-xs border border-slate-300 rounded font-bold text-slate-800"
                                                                placeholder="Hover Cost"
                                                              />
                                                            </div>
                                                          </td>
                                                          <td className="p-1.5">
                                                            {unitRate ? (
                                                              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                                                ₹{unitRate}/pc
                                                              </span>
                                                            ) : (
                                                              <span className="text-[10px] text-slate-400">
                                                                —
                                                              </span>
                                                            )}
                                                          </td>
                                                          <td className="p-1.5 pr-2.5 text-right">
                                                            <button
                                                              type="button"
                                                              onClick={() =>
                                                                handleRemoveMainCombinationPrice(
                                                                  cIdx,
                                                                  qpIdx,
                                                                )
                                                              }
                                                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                                            >
                                                              <FiTrash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                          </td>
                                                        </tr>
                                                      );
                                                    })}
                                                  </tbody>
                                                </table>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
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
                          {Object.entries(formData.specifications).map(
                            ([key, val]) => (
                              <div
                                key={key}
                                className="flex items-center space-x-2"
                              >
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
                            ),
                          )}
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
                              importantNotes: e.target.value
                                .split("\n")
                                .filter(Boolean),
                            }))
                          }
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                      className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving to MongoDB...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="w-4 h-4" />
                          <span>
                            {editingProduct
                              ? "Save Changes to MongoDB"
                              : "Create in MongoDB"}
                          </span>
                        </>
                      )}
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
