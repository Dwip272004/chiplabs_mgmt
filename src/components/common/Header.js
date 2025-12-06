import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-semibold">ERP System</h1>
      </div>
      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            <span className="text-sm">{currentUser?.profile?.firstName || currentUser.email}</span>
            <button onClick={logout} className="px-3 py-1 border rounded">Logout</button>
          </>
        ) : (
          <span className="text-sm">Not logged in</span>
        )}
      </div>
    </header>
  );
};

export default Header;
