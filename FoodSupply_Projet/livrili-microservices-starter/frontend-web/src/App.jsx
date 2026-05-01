import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import SupplierDashboard from "./pages/Supplier/SupplierDashboard";
import RestaurantDashboard from "./pages/Restaurant/RestaurantDashboard";

function AppShell() {
  const { isAuthenticated, role } = useAuth();
  const pageBg =
    role === "restaurant"
      ? "min-h-screen bg-gradient-to-b from-livrili-orangePale to-white"
      : "min-h-screen bg-gradient-to-b from-livrili-greenPale to-white";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-livrili-greenPale to-white">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className={pageBg}>
      <div className="mx-auto flex max-w-6xl">
        <Sidebar role={role} />
        <main className="flex-1 p-4 sm:p-6">
          <Routes>
            <Route
              path="/"
              element={
                role === "supplier" ? (
                  <Navigate to="/supplier" replace />
                ) : (
                  <Navigate to="/restaurant" replace />
                )
              }
            />
            <Route
              path="/supplier"
              element={
                <ProtectedRoute requiredRole="supplier">
                  <SupplierDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant"
              element={
                <ProtectedRoute requiredRole="restaurant">
                  <RestaurantDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
