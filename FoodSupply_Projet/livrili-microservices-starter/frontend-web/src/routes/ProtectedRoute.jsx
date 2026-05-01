import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ requiredRole, children }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div className="p-6 text-gray-700">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === "supplier" ? "/supplier" : "/restaurant"} replace />;
  }
  return children;
}

