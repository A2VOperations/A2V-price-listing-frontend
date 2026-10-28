import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import DashboardPage from "@/pages/DashboardPage";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import QuotesPage from "@/pages/QuotesPage";
import CalculatorsPage from "@/pages/CalculatorsPage";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CategoryManager from "@/pages/admin/CategoryManager";
import ProductManager from "@/pages/admin/ProductManager";
import UserManager from "@/pages/admin/UserManager";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function App() {
  return (
    <PageContainer>
      <Routes>
        {/* Global Login Section */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Protected Overall Project Storefront Routes (Accessible by both User and Admin) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculators"
          element={
            <ProtectedRoute>
              <CalculatorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculators/:type"
          element={
            <ProtectedRoute>
              <CalculatorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculator/:type"
          element={
            <ProtectedRoute>
              <CalculatorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category/:slug"
          element={
            <ProtectedRoute>
              <CategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes"
          element={
            <ProtectedRoute>
              <QuotesPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes (Only Accessible by Admin role) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requireAdmin>
              <CategoryManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireAdmin>
              <ProductManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <UserManager />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageContainer>
  );
}
