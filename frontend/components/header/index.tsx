"use client";

import React from "react";
import Notification from "../notification";
import Login from "../login";

export default function Header() {
  return (
    <header className="p-4 flex flex-row justify-end space-x-6 align-center">
      <Notification />
      <Login />
    </header>
  );
}
