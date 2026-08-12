import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";

test("renders Smart Queue home page", () => {
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  const heading = screen.getByText(/Smart Queue System/i);
  expect(heading).toBeInTheDocument();
});