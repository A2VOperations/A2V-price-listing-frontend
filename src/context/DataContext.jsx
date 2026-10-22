import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [error, setError] = useState(null);

  const loadDataFromApi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedCats, fetchedProds] = await Promise.all([
        fetchCategoriesApi(),
        fetchProductsApi(),
      ]);

      setCategories(Array.isArray(fetchedCats) ? fetchedCats : []);
      setProducts(Array.isArray(fetchedProds) ? fetchedProds : []);
      setIsBackendConnected(true);
    } catch (err) {
      console.error("MongoDB Backend API connection failed:", err.message);
      setIsBackendConnected(false);
      setError(err.message || "Failed to load data from MongoDB backend.");
      setCategories([]);
      setProducts([]);
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
    return categories.find((c) => c.slug === slug || c.id === slug);
  };

  const getProductBySlug = (slug) => {
    return products.find((p) => p.slug === slug || p.id === slug || p.code === slug);
  };

  const getProductsByCategory = (categoryId) => {
    return products.filter((p) => p.categoryId === categoryId);
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
