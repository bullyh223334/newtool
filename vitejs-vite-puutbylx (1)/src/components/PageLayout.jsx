import React from "react";
import "./PageLayout.css"; // Optional: contains your header styling

export default function PageLayout({ title, children }) {
  return (
    <div className="page-wrapper">
      <header className="header-bar">
        <div>
          <div className="header-title">Synguard Quote Tool</div>
          <div className="header-sub">{title}</div>
        </div>
      </header>
      {children}
    </div>
  );
}