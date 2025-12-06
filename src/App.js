import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ManagerDashboard from "./pages/ManagerDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AddData from "./components/AddData";
import DisplayData from "./components/DisplayData";
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <ManagerDashboard />
            </ProtectedRoute>
          } />

          {/* Example role-based routes */}
          <Route path="/manager" element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/employee" element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<div className="p-8">404 - Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
