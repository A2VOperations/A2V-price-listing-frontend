import React from "react";
import { Routes, Route } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import DashboardPage from "@/pages/DashboardPage";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import QuotesPage from "@/pages/QuotesPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CategoryManager from "@/pages/admin/CategoryManager";
import ProductManager from "@/pages/admin/ProductManager";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";

export default function App() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        
        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminProtectedRoute>
              <CategoryManager />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminProtectedRoute>
              <ProductManager />
            </AdminProtectedRoute>
          }
        />

        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </PageContainer>
  );
}
