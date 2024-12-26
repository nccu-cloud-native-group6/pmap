"use client";

import React from "react";
import { VisuallyHidden, useSwitch } from "@nextui-org/react";
import { SunIcon } from "./SunIcon";
import { MoonIcon } from "./MoonIcon";

interface ThemeSwitchProps {
  isSelected: boolean;
  onChange: () => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ isSelected, onChange }) => {
  const { Component, slots, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
    isSelected,
    onChange,
  });

  return (
    <div>
      <Component {...getBaseProps()}>
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          className={slots.wrapper({
            class: [
              "w-10 h-10",
              "flex items-center justify-center",
              "rounded-lg",
              isSelected
                ? "bg-black" 
                : "bg-white",
            ],
          })}
          style={{
            backgroundColor: isSelected ? "#000000" : undefined, 
          }}
        >
          {isSelected ? <MoonIcon /> : <SunIcon />}
        </div>
      </Component>
    </div>
  );
};

export default ThemeSwitch;
