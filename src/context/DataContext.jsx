import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import initialCategories from "@/data/categories.json";
import initialProducts from "@/data/products.json";
import {
  fetchCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
  fetchProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
} from "@/services/api";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [error, setError] = useState(null);

  const loadDataFromApi = useCallback(async () => {
    try {
      setError(null);
      const [fetchedCats, fetchedProds] = await Promise.all([
        fetchCategoriesApi(),
        fetchProductsApi(),
      ]);

      if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
        setCategories(fetchedCats);
      }
      if (Array.isArray(fetchedProds) && fetchedProds.length > 0) {
        setProducts(fetchedProds);
      }
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("MongoDB Backend API connection failed, using local dataset fallback:", err.message);
      setIsBackendConnected(false);
      // Seamlessly keep fallback categories & products so UI is always functional
      setCategories((prev) => (prev.length > 0 ? prev : initialCategories));
      setProducts((prev) => (prev.length > 0 ? prev : initialProducts));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromApi();
  }, [loadDataFromApi]);

  const addCategory = async (categoryData) => {
    const newCat = await createCategoryApi(categoryData);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = async (id, categoryData) => {
    const updatedCat = await updateCategoryApi(id, categoryData);
    setCategories((prev) =>
      prev.map((c) => (c.id === id || c.slug === id ? updatedCat : c))
    );
    return updatedCat;
  };

  const deleteCategory = async (id) => {
    await deleteCategoryApi(id);
    setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
  };

  const addProduct = async (productData) => {
    const newProd = await createProductApi(productData);
    setProducts((prev) => [...prev, newProd]);
    return newProd;
  };

  const updateProduct = async (id, productData) => {
    const updatedProd = await updateProductApi(id, productData);
    setProducts((prev) => prev.map((p) => (p.id === id ? updatedProd : p)));
    return updatedProd;
  };

  const deleteProduct = async (id) => {
    await deleteProductApi(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getCategoryBySlug = (slug) => {
    if (!slug) return null;
    const clean = slug.toLowerCase().trim();
    return categories.find((c) => {
      const cSlug = (c.slug || "").toLowerCase();
      const cId = (c.id || "").toLowerCase();
      return (
        cSlug === clean ||
        cId === clean ||
        (clean === "visiting-cards" && (cSlug === "visiting-card" || cId === "visiting-card")) ||
        (clean === "visiting-card" && (cSlug === "visiting-cards" || cId === "visiting-cards"))
      );
    });
  };

  const getProductBySlug = (slug) => {
    return products.find((p) => p.slug === slug || p.id === slug || p.code === slug);
  };

  const getProductsByCategory = (categoryId) => {
    if (!categoryId) return [];
    const clean = categoryId.toLowerCase().trim();
    return products.filter((p) => {
      const pCat = (p.categoryId || "").toLowerCase();
      return (
        pCat === clean ||
        (clean === "visiting-cards" && (pCat === "visiting-card" || pCat === "visiting-cards")) ||
        (clean === "visiting-card" && (pCat === "visiting-cards" || pCat === "visiting-card"))
      );
    });
  };

  const searchProducts = (query) => {
    if (!query || query.trim() === "") return [];
    const q = query.toLowerCase().trim();
    return products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.specifications?.material &&
          p.specifications.material.toLowerCase().includes(q))
    );
  };

  return (
    <DataContext.Provider
      value={{
        categories,
        products,
        loading,
        isBackendConnected,
        error,
        refreshData: loadDataFromApi,
        addCategory,
        updateCategory,
        deleteCategory,
        addProduct,
        updateProduct,
        deleteProduct,
        getCategoryBySlug,
        getProductBySlug,
        getProductsByCategory,
        searchProducts,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
