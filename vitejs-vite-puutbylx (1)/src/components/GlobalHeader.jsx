// components/GlobalHeader.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import "./GlobalHeader.css";

export default function GlobalHeader() {
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname === "/quick") return "Quick Quote";
    if (location.pathname === "/new") return "Quote";
    if (location.pathname.includes("/edit")) return "Edit Quote";
    if (location.pathname === "/product-manager") return "Product Manager";
    return "";
  };

  return (
    <div className="global-header">
      <div className="header-left">Synguard Quote Tool</div>
      <div className="header-right">{getPageTitle()}</div>
    </div>
  );
}
