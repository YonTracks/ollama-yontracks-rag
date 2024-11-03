"use client";
import React from "react";
import { useTheme } from "next-themes";
import { FaMoon } from "react-icons/fa";

const ThemeButton = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => (theme == "dark" ? setTheme("light") : setTheme("dark"))}
    >
      <FaMoon size={20} />
    </button>
  );
};

export default ThemeButton;
