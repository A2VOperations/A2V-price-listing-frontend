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
import PrintingRatesManager from "@/pages/admin/PrintingRatesManager";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function App() {
  return (
    <PageContainer>
      <Routes>
        {/* Global Login Section */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Protected Overall Project Storefront Routes (Accessible by User, Manager, Admin) */}
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

        {/* Protected Admin & Manager Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireManagerOrAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requireManagerOrAdmin>
              <CategoryManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requireManagerOrAdmin>
              <ProductManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/printing-rates"
          element={
            <ProtectedRoute requireManagerOrAdmin>
              <PrintingRatesManager />
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
