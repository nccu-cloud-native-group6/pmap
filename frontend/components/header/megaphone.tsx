"use client";

import React from "react";
import MegaphoneIcon from "./megaphoneIcon";
import { useModal } from "../../contexts/ModalContext"; // 使用 ModalContext 打開模態框

interface MegaphoneProps {}

const Megaphone: React.FC<MegaphoneProps> = () => {
  const { dispatch } = useModal();

  const handleClick = () => {
    dispatch({ type: "OPEN_MODAL" }); // 打開模態框
  };

  return (
    <button
      className="p-2 rounded-md hover:fill-current pointer:cursor-pointer"
      onClick={handleClick}
      aria-label="Report an issue"
    >
      <MegaphoneIcon />
    </button>
  );
};

export default Megaphone;
