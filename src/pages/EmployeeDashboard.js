import React from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-xl font-semibold mb-4">Employee Dashboard (Stage 1)</h2>
          <div className="bg-white p-4 rounded shadow">Your tasks will appear here.</div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
