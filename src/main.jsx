import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

// Check if user is already logged in
const isAuthenticated = () => {
  const userData = localStorage.getItem("user");
  return userData && JSON.parse(userData);
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
