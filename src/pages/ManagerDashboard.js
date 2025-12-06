import React from "react";
import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

const ManagerDashboard = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h2 className="text-xl font-semibold mb-4">Manager Dashboard (Stage 1)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow">Total employees: 0</div>
            <div className="bg-white p-4 rounded shadow">Active projects: 0</div>
            <div className="bg-white p-4 rounded shadow">Monthly attendance: -</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
