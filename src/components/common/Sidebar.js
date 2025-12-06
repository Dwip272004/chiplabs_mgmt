import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r p-4">
      <nav className="space-y-2">
        <Link to="/" className="block p-2 rounded hover:bg-gray-100">Dashboard</Link>
        <Link to="/projects" className="block p-2 rounded hover:bg-gray-100">Projects</Link>
        <Link to="/employees" className="block p-2 rounded hover:bg-gray-100">Employees</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
