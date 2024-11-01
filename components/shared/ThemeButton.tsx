"use client";
import React from "react";
import { useTheme } from "next-themes";
import { FaMoon } from "react-icons/fa";

const ThemeButton = () => {
   const { systemTheme, theme, setTheme } = useTheme();
   const currentTheme = theme === "system" ? systemTheme : theme;

   return (
      <button
         onClick={() =>
            theme == "dark" ? setTheme("light") : setTheme("dark")
         }
      >
         <FaMoon size={20} />
      </button>
   );
};

export default ThemeButton;
