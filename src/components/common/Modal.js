import React, { useEffect } from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow max-w-lg w-full p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
