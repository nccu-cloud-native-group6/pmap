"use client";

import React from "react";
import BookmarkIcon from "./BookmarkIcon";

interface HeaderBookmarkProps {
  onTogglePanel: () => void; // 控制 Sliding Panel 開關的回調
}

const HeaderBookmark: React.FC<HeaderBookmarkProps> = ({ onTogglePanel }) => {
  return (
    <button
      onClick={onTogglePanel}
      className="p-2 rounded-full"
    >
      <BookmarkIcon />
    </button>
  );
};

export default HeaderBookmark;
