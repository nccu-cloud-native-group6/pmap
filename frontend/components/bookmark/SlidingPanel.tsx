"use client";

import React from "react";

interface SlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full z-99 bg-white shadow-lg transition-transform transform border-l ${
        isOpen ? "translate-x-0 w-1/3" : "translate-x-full w-0"
      }`}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500"
      >
        Close
      </button>

      {/* Panel Content */}
      <div className="p-6">
        <h2 className="text-lg font-bold">Your Bookmarks</h2>
        <ul className="mt-4 space-y-2">
          <li className="p-2 bg-gray-100 rounded">Region 1</li>
          <li className="p-2 bg-gray-100 rounded">Region 2</li>
          <li className="p-2 bg-gray-100 rounded">Region 3</li>
        </ul>
      </div>
    </div>
  );
};

export default SlidingPanel;
