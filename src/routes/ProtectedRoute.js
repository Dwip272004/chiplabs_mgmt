import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) return null; // or spinner

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Unauthorized - redirect or show message
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
