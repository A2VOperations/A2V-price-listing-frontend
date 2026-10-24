import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import AdminLayout from "./AdminLayout";
import ProductImage from "@/components/common/ProductImage";
import { uploadImageApi } from "@/services/api";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiCheck,
  FiUploadCloud,
  FiImage,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiGrid,
  FiList,
  FiBox,
  FiExternalLink,
  FiCopy,
  FiFilter,
  FiSliders,
  FiAlertTriangle,
  FiFolder,
  FiEye,
  FiLink,
  FiZap,
  FiLock,
  FiUnlock,
} from "react-icons/fi";

// Standard preset cover images available in the public catalog
const PRESET_IMAGES = [
  { label: "Preset 1", url: "/assets/images/categories (1).webp" },
  { label: "Preset 2", url: "/assets/images/categories (2).webp" },
  { label: "Preset 3", url: "/assets/images/categories (3).webp" },
  { label: "Preset 4", url: "/assets/images/categories (4).webp" },
  { label: "Preset 5", url: "/assets/images/categories (5).webp" },
  { label: "Preset 6", url: "/assets/images/categories (6).webp" },
];

export default function CategoryManager() {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    loading,
    refreshData,
  } = useData();

  // Search, Filter, Sort & View Modes
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'with-products' | 'empty' | 'missing-image'
  const [sortBy, setSortBy] = useState("name-asc"); // 'name-asc' | 'name-desc' | 'products-desc' | 'products-asc' | 'slug-asc'
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("a2v_cat_view_mode") || "grid";
  });

  // Persistent view mode
  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("a2v_cat_view_mode", mode);
  };

  // State for Toast / Notification
  const [notice, setNotice] = useState(null);
  const showNotice = (type, message) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  // State for Copy Feedback
  const [copiedSlug, setCopiedSlug] = useState(null);
  const handleCopySlug = (slug, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(slug);
    setCopiedSlug(slug);
    showNotice("info", `Copied slug "${slug}" to clipboard`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [autoSlugSync, setAutoSlugSync] = useState(true);
  const [modalTab, setModalTab] = useState("details"); // 'details' | 'preview'

  // Delete Confirmation Modal State
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refresh State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    slug: "",
    description: "",
    image: "",
  });

  // Helper to slugify text
  const slugify = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Precompute product counts per category
  const productCountMap = useMemo(() => {
    const map = {};
    if (Array.isArray(categories)) {
      categories.forEach((c) => {
        const idKey = c.id || c.slug;
        map[idKey] = 0;
      });
    }
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p.categoryId) {
          map[p.categoryId] = (map[p.categoryId] || 0) + 1;
        }
      });
    }
    return map;
  }, [categories, products]);

  // Statistics
  const stats = useMemo(() => {
    const totalCats = categories.length;
    let totalLinkedProducts = 0;
    let catsWithProducts = 0;
    let catsWithCustomImage = 0;

    categories.forEach((c) => {
      const count = productCountMap[c.id] || productCountMap[c.slug] || 0;
      totalLinkedProducts += count;
      if (count > 0) catsWithProducts += 1;
      if (c.image && !c.image.includes("categories (1).webp")) {
        catsWithCustomImage += 1;
      }
    });

    const emptyCats = totalCats - catsWithProducts;

    return {
      totalCats,
      totalLinkedProducts,
      catsWithProducts,
      emptyCats,
      catsWithCustomImage,
    };
  }, [categories, productCountMap]);

  // Filter & Sort Logic
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.slug?.toLowerCase().includes(q) ||
          c.id?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    // Category Status / Coverage Filter
    if (activeFilter === "with-products") {
      result = result.filter((c) => {
        const count = productCountMap[c.id] || productCountMap[c.slug] || 0;
        return count > 0;
      });
    } else if (activeFilter === "empty") {
      result = result.filter((c) => {
        const count = productCountMap[c.id] || productCountMap[c.slug] || 0;
        return count === 0;
      });
    } else if (activeFilter === "missing-image") {
      result = result.filter((c) => !c.image || c.image.trim() === "");
    }

    // Sorting
    result.sort((a, b) => {
      const countA = productCountMap[a.id] || productCountMap[a.slug] || 0;
      const countB = productCountMap[b.id] || productCountMap[b.slug] || 0;

      switch (sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "");
        case "products-desc":
          return countB - countA;
        case "products-asc":
          return countA - countB;
        case "slug-asc":
          return (a.slug || "").localeCompare(b.slug || "");
        default:
          return 0;
      }
    });

    return result;
  }, [categories, searchQuery, activeFilter, sortBy, productCountMap]);

  // Modal Handlers
  const openCreateModal = () => {
    setEditingCategory(null);
    setAutoSlugSync(true);
    setModalTab("details");
    setFormData({
      id: "",
      name: "",
      slug: "",
      description: "",
      image: "/assets/images/categories (1).webp",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setAutoSlugSync(false);
    setModalTab("details");
    setFormData({
      id: category.id || "",
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
    });
    setIsModalOpen(true);
  };

  // Auto slug handler
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: autoSlugSync ? slugify(newName) : prev.slug,
    }));
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      showNotice("success", "Catalog categories refreshed from database.");
    } catch (err) {
      showNotice("error", "Failed to refresh: " + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotice("error", "Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadImageApi(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      showNotice("success", "Image uploaded successfully.");
    } catch (err) {
      showNotice("error", "Image upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotice("error", "Category name is required.");
      return;
    }

    const finalSlug = (formData.slug.trim() || slugify(formData.name)) || "category";
    const payload = {
      ...formData,
      name: formData.name.trim(),
      slug: finalSlug,
      id: formData.id || finalSlug,
      description: formData.description.trim(),
      image: formData.image.trim() || "/assets/images/categories (1).webp",
    };

    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showNotice("success", `Category "${payload.name}" updated successfully.`);
      } else {
        await addCategory(payload);
        showNotice("success", `Category "${payload.name}" created successfully.`);
      }
      setIsModalOpen(false);
    } catch (err) {
      showNotice("error", "Failed to save category: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsDeleting(true);
      await deleteCategory(deleteCandidate.id);
      showNotice("success", `Category "${deleteCandidate.name}" removed.`);
      setDeleteCandidate(null);
    } catch (err) {
      showNotice("error", "Failed to delete category: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Floating Notification Toast */}
        {notice && (
          <div
            className={`fixed top-6 right-6 z-50 max-w-md p-4 rounded-xl shadow-xl flex items-center justify-between gap-3 text-sm font-medium border backdrop-blur-md transition-all duration-300 animate-slideDown ${
              notice.type === "success"
                ? "bg-emerald-500/95 text-white border-emerald-600 shadow-emerald-500/20"
                : notice.type === "error"
                ? "bg-rose-500/95 text-white border-rose-600 shadow-rose-500/20"
                : "bg-slate-900/95 text-white border-slate-700 shadow-slate-900/30"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notice.type === "success" && <FiCheckCircle className="w-5 h-5 flex-shrink-0" />}
              {notice.type === "error" && <FiAlertCircle className="w-5 h-5 flex-shrink-0" />}
              {notice.type === "info" && <FiCopy className="w-5 h-5 flex-shrink-0 text-orange-300" />}
              <span>{notice.message}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 rounded-md">
                Catalog Management
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-slate-500">
                {categories.length} Categories configured
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
              Categories & Collections
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Organize your print & design offerings into customer-facing categories, custom URL slugs, and featured banners.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 active:scale-95 disabled:opacity-50"
              title="Sync latest categories with database"
            >
              <FiRefreshCw
                className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing || loading ? "animate-spin text-orange-600" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl transition-all shadow-md shadow-orange-600/20 active:scale-95 whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Statistics & KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveFilter("all")}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all duration-200 ${
              activeFilter === "all"
                ? "border-orange-500 ring-2 ring-orange-500/20 shadow-xs"
                : "border-slate-200 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Categories
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <FiFolder className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats.totalCats}</span>
              <span className="text-[11px] font-medium text-slate-400">active</span>
            </div>
          </div>

          <div
            onClick={() => setActiveFilter("with-products")}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all duration-200 ${
              activeFilter === "with-products"
                ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                : "border-slate-200 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Catalog Products
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiBox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats.totalLinkedProducts}</span>
              <span className="text-[11px] font-medium text-emerald-600 font-semibold">
                in {stats.catsWithProducts} categories
              </span>
            </div>
          </div>

          <div
            onClick={() => setActiveFilter("empty")}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all duration-200 ${
              activeFilter === "empty"
                ? "border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                : "border-slate-200 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Empty Categories
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiAlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{stats.emptyCats}</span>
              <span className="text-[11px] font-medium text-slate-400">0 products</span>
            </div>
          </div>

          <div
            onClick={() => setActiveFilter("missing-image")}
            className={`cursor-pointer bg-white p-4 rounded-xl border transition-all duration-200 ${
              activeFilter === "missing-image"
                ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                : "border-slate-200 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Custom Visuals
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FiImage className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600">
                {stats.catsWithCustomImage}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                of {stats.totalCats} customized
              </span>
            </div>
          </div>
        </div>

        {/* Filter, Search & View Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by category name, slug or keywords..."
                className="w-full pl-10 pr-9 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                  title="Clear search"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5">
                <FiSliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] font-semibold text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="name-asc">Name (A → Z)</option>
                  <option value="name-desc">Name (Z → A)</option>
                  <option value="products-desc">Most Products First</option>
                  <option value="products-asc">Fewest Products First</option>
                  <option value="slug-asc">Slug (A → Z)</option>
                </select>
              </div>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => handleSetViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-orange-600 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Grid View (Cards)"
                >
                  <FiGrid className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Cards</span>
                </button>
                <button
                  onClick={() => handleSetViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    viewMode === "table"
                      ? "bg-white text-orange-600 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Table View (Dense List)"
                >
                  <FiList className="w-4 h-4" />
                  <span className="hidden sm:inline text-[11px]">Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
              <FiFilter className="w-3 h-3" /> Filter:
            </span>

            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Categories ({categories.length})
            </button>

            <button
              onClick={() => setActiveFilter("with-products")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === "with-products"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50"
              }`}
            >
              With Products ({stats.catsWithProducts})
            </button>

            <button
              onClick={() => setActiveFilter("empty")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === "empty"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/50"
              }`}
            >
              Empty / No Products ({stats.emptyCats})
            </button>

            <button
              onClick={() => setActiveFilter("missing-image")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                activeFilter === "missing-image"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/50"
              }`}
            >
              Needs Custom Visuals
            </button>

            {(searchQuery || activeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="ml-auto text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
              >
                <FiX className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section: Loading Skeleton or Content or Empty */}
        {loading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse"
                >
                  <div className="h-44 bg-slate-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-10 bg-slate-100 rounded w-full" />
                    <div className="flex justify-between pt-2">
                      <div className="h-8 bg-slate-200 rounded w-20" />
                      <div className="h-8 bg-slate-200 rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
              <div className="flex flex-col items-center justify-center space-y-3 py-12">
                <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-slate-600">
                  Loading categories from catalog...
                </span>
              </div>
            </div>
          )
        ) : filteredCategories.length === 0 ? (
          /* Empty Search / Filters State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <FiFolder className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No categories found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No categories match "${searchQuery}". Try a different keyword or reset filters.`
                : "No categories match the active filter criteria."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              {(searchQuery || activeFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={openCreateModal}
                className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl transition-colors shadow-xs"
              >
                + Add New Category
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* ========================================================== */
          /* CARD GRID VIEW                                              */
          /* ========================================================== */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCategories.map((cat) => {
              const productCount = productCountMap[cat.id] || productCountMap[cat.slug] || 0;
              const isCopied = copiedSlug === cat.slug;

              return (
                <div
                  key={cat.id || cat.slug}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative"
                >
                  {/* Image Container with Badges */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <ProductImage
                      src={cat.image}
                      alt={cat.name}
                      categoryName={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                    {/* Product Count Pill */}
                    <Link
                      to={`/admin/products`}
                      className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-white rounded-lg flex items-center gap-1.5 shadow-xs hover:bg-orange-600 transition-colors"
                      title="View products in this category"
                    >
                      <FiBox className="w-3.5 h-3.5 text-orange-400" />
                      <span>{productCount} {productCount === 1 ? "Product" : "Products"}</span>
                    </Link>

                    {/* Slug Pill on image footer */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                      <div
                        onClick={(e) => handleCopySlug(cat.slug || cat.id, e)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/50 backdrop-blur-xs rounded text-[10px] font-mono cursor-pointer hover:bg-black/80 transition-colors"
                        title="Click to copy slug"
                      >
                        {isCopied ? (
                          <FiCheck className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <FiCopy className="w-3 h-3 text-slate-300" />
                        )}
                        <span className="truncate max-w-[140px]">{cat.slug || cat.id}</span>
                        {isCopied && <span className="text-emerald-400 font-bold ml-1">Copied!</span>}
                      </div>

                      {/* External preview link */}
                      <Link
                        to={`/category/${cat.slug || cat.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-black/40 hover:bg-black/70 backdrop-blur-xs text-slate-200 hover:text-white rounded-lg transition-colors"
                        title="Open customer view in new tab"
                      >
                        <FiExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {cat.description || (
                          <span className="italic text-slate-400">No description provided yet.</span>
                        )}
                      </p>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/category/${cat.slug || cat.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-orange-600 transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Edit category details"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setDeleteCandidate(cat)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete category"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================== */
          /* TABLE VIEW                                                 */
          /* ========================================================== */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 w-20">Media</th>
                    <th className="py-3.5 px-4">Category Name</th>
                    <th className="py-3.5 px-4">Slug / Identifier</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-center">Products</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((cat) => {
                    const productCount = productCountMap[cat.id] || productCountMap[cat.slug] || 0;
                    const isCopied = copiedSlug === cat.slug;

                    return (
                      <tr
                        key={cat.id || cat.slug}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="w-14 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                            <ProductImage
                              src={cat.image}
                              alt={cat.name}
                              categoryName={cat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{cat.name}</span>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-3 px-4 font-mono text-xs text-orange-600">
                          <button
                            onClick={() => handleCopySlug(cat.slug || cat.id)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-md transition-colors"
                            title="Click to copy slug"
                          >
                            {isCopied ? (
                              <FiCheck className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <FiCopy className="w-3.5 h-3.5 text-orange-500" />
                            )}
                            <span>{cat.slug || cat.id}</span>
                          </button>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4 max-w-sm text-slate-500 line-clamp-2 leading-relaxed">
                          {cat.description || (
                            <span className="italic text-slate-400">No description</span>
                          )}
                        </td>

                        {/* Products Badge */}
                        <td className="py-3 px-4 text-center">
                          <Link
                            to="/admin/products"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                              productCount > 0
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                            }`}
                            title="Manage products in this category"
                          >
                            <FiBox className="w-3.5 h-3.5" />
                            <span>{productCount}</span>
                          </Link>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/category/${cat.slug || cat.id}`}
                              target="_blank"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Preview on live store"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Edit category"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteCandidate(cat)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete category"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* CREATE / EDIT CATEGORY MODAL                                */}
        {/* ========================================================== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-scaleUp">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
                    <FiFolder className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {editingCategory ? "Edit Category Details" : "Create New Category"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {editingCategory
                        ? `Updating collection "${editingCategory.name}"`
                        : "Configure title, URL identifier, and display media"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* 2-Column Responsive Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Metadata */}
                  <div className="space-y-4">
                    {/* Category Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Category Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleNameChange}
                        placeholder="e.g. Visiting Cards, Flex Board, Stickers"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none transition-all font-medium text-slate-900"
                      />
                    </div>

                    {/* Slug / URL Key */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span>URL Slug</span>
                          <span className="text-[10px] font-normal text-slate-400">(key)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setAutoSlugSync(!autoSlugSync)}
                          className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                          title={autoSlugSync ? "Auto-generating slug from name" : "Slug is unlinked"}
                        >
                          {autoSlugSync ? (
                            <>
                              <FiLock className="w-3 h-3" /> Auto-sync ON
                            </>
                          ) : (
                            <>
                              <FiUnlock className="w-3 h-3 text-slate-400" /> Custom
                            </>
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => {
                            setAutoSlugSync(false);
                            setFormData((prev) => ({
                              ...prev,
                              slug: slugify(e.target.value),
                            }));
                          }}
                          placeholder="e.g. visiting-cards"
                          className="w-full pl-3 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none font-mono text-orange-600 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              slug: slugify(prev.name),
                            }));
                            setAutoSlugSync(true);
                          }}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-orange-600"
                          title="Generate from name"
                        >
                          <FiZap className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        Route: <span className="font-mono text-slate-600">/category/{formData.slug || "your-slug"}</span>
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Description
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {formData.description?.length || 0} chars
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief summary explaining what kinds of products are in this collection..."
                        className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none leading-relaxed text-slate-800 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Media & Live Preview */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Category Cover Visual
                      </label>

                      {/* Cover Preview Card */}
                      <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                        <ProductImage
                          src={formData.image}
                          alt="Category preview"
                          categoryName={formData.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                          Preview Card Cover
                        </div>
                      </div>

                      {/* Image URL input */}
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              image: e.target.value,
                            }))
                          }
                          placeholder="Paste image URL or CDN link..."
                          className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white focus:outline-none text-slate-700"
                        />
                      </div>

                      {/* Upload to Cloudinary Button */}
                      <div className="mt-2">
                        <label className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors border border-slate-300 active:scale-95">
                          {uploadingImage ? (
                            <FiRefreshCw className="w-4 h-4 text-orange-600 animate-spin" />
                          ) : (
                            <FiUploadCloud className="w-4 h-4 text-orange-600" />
                          )}
                          <span>
                            {uploadingImage
                              ? "Uploading to Cloudinary..."
                              : "Upload Cover to Cloudinary"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage || isSubmitting}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Quick Preset Images */}
                      <div className="mt-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Quick Preset Covers:
                        </span>
                        <div className="grid grid-cols-6 gap-1.5">
                          {PRESET_IMAGES.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  image: preset.url,
                                }))
                              }
                              className={`h-9 rounded-lg overflow-hidden border-2 transition-all ${
                                formData.image === preset.url
                                  ? "border-orange-500 ring-2 ring-orange-500/30 scale-105"
                                  : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                              }`}
                              title={preset.label}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving Category...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4 stroke-[2.5]" />
                        <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* DELETE CONFIRMATION DIALOG                                 */}
        {/* ========================================================== */}
        {deleteCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scaleUp">
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <FiAlertTriangle className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Delete Category?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Are you sure you want to delete{" "}
                    <strong className="text-slate-900">"{deleteCandidate.name}"</strong>? This action cannot be reversed.
                  </p>
                </div>

                {/* Warning if category contains products */}
                {(productCountMap[deleteCandidate.id] || productCountMap[deleteCandidate.slug] || 0) > 0 && (
                  <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs text-left flex items-start gap-2.5">
                    <FiAlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold">Contains linked products:</strong>
                      <p className="mt-0.5 text-amber-800">
                        There are currently{" "}
                        <span className="font-bold">
                          {productCountMap[deleteCandidate.id] || productCountMap[deleteCandidate.slug]} products
                        </span>{" "}
                        attached to this category. Deleting this category will leave these items uncategorized.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteCandidate(null)}
                    disabled={isDeleting}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-md shadow-rose-600/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete Permanently</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
