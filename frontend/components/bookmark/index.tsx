"use client";

import React from "react";
import BookmarkIcon from "./BookmarkIcon";

interface HeaderBookmarkProps {
  onTogglePanel: () => void; // 控制 Sliding Panel 開關的回調
}

const HeaderBookmark: React.FC<HeaderBookmarkProps> = ({ onTogglePanel }) => {
  const [isClicked, setIsClicked] = React.useState(false);

  return (
    <button
      onClick={() => {
        setIsClicked(!isClicked);
        onTogglePanel();
      }}
      className="p-2 rounded-full"
    >
      <BookmarkIcon initialClicked={isClicked} />
    </button>
  );
};

export default HeaderBookmark;
