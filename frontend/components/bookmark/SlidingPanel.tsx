"use client";

import React from "react";

interface SlidingPanelProps {
  isOpen: boolean; // Panel 狀態
  onClose: () => void; // 關閉回調
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`h-full shadow-lg transition-transform ${
        isOpen ? "translate-x-0 w-1/3" : "translate-x-full w-0"
      }`}
    >
      {isOpen && (
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500"
          >
            Close
          </button>
          <h2 className="text-lg font-bold">Your Bookmarks</h2>
          <ul className="mt-4 space-y-2">
            <li className="p-2 bg-gray-100 rounded">Region 1</li>
            <li className="p-2 bg-gray-100 rounded">Region 2</li>
            <li className="p-2 bg-gray-100 rounded">Region 3</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SlidingPanel;
