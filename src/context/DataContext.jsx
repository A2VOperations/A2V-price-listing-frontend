import React, { createContext, useContext, useState, useEffect } from "react";
import { categories as initialCategories } from "@/data/categories";
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
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [error, setError] = useState(null);

  const loadDataFromApi = async () => {
    try {
      setLoading(true);
      const [fetchedCats, fetchedProds] = await Promise.all([
        fetchCategoriesApi(),
        fetchProductsApi(),
      ]);
      setCategories(fetchedCats);
      setProducts(fetchedProds);
      setIsBackendConnected(true);
      setError(null);
    } catch (err) {
      console.warn("Backend API not reachable, falling back to static dataset:", err.message);
      setIsBackendConnected(false);
      // Keep initialCategories and initialProducts as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromApi();
  }, []);

  const addCategory = async (categoryData) => {
    if (isBackendConnected) {
      const newCat = await createCategoryApi(categoryData);
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    } else {
      const newCat = {
        ...categoryData,
        id: categoryData.id || categoryData.slug || Date.now().toString(),
      };
      setCategories((prev) => [...prev, newCat]);
      return newCat;
    }
  };

  const updateCategory = async (id, categoryData) => {
    if (isBackendConnected) {
      const updatedCat = await updateCategoryApi(id, categoryData);
      setCategories((prev) =>
        prev.map((c) => (c.id === id || c.slug === id ? updatedCat : c))
      );
      return updatedCat;
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === id || c.slug === id ? { ...c, ...categoryData } : c))
      );
      return { id, ...categoryData };
    }
  };

  const deleteCategory = async (id) => {
    if (isBackendConnected) {
      await deleteCategoryApi(id);
    }
    setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
  };

  const addProduct = async (productData) => {
    if (isBackendConnected) {
      const newProd = await createProductApi(productData);
      setProducts((prev) => [...prev, newProd]);
      return newProd;
    } else {
      const newProd = {
        ...productData,
        id: productData.id || `AP-${Date.now()}`,
      };
      setProducts((prev) => [...prev, newProd]);
      return newProd;
    }
  };

  const updateProduct = async (id, productData) => {
    if (isBackendConnected) {
      const updatedProd = await updateProductApi(id, productData);
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProd : p)));
      return updatedProd;
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
      );
      return { id, ...productData };
    }
  };

  const deleteProduct = async (id) => {
    if (isBackendConnected) {
      await deleteProductApi(id);
    }
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
