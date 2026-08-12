import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

function ThemeToggle() {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        background: darkMode ? "#ffc107" : "#343a40",
        color: darkMode ? "#000" : "#fff",
      }}
    >
      {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

export default ThemeToggle;