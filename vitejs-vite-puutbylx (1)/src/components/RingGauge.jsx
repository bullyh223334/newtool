import React from "react";
import "./RingGauge.css"; // Make sure you also create this!

export default function RingGauge({ label, required, available }) {
  const percent = available && required ? Math.min((available / required) * 100, 100) : 0;
  const isWarning = available < required;

  return (
    <div className="ring-gauge-container">
      <div className={`ring-gauge ${isWarning ? "red" : "green"}`}>
        <svg viewBox="0 0 36 36">
          <path
            className="circle-bg"
            d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="circle"
            strokeDasharray={`${percent}, 100`}
            d="M18 2.0845
             a 15.9155 15.9155 0 0 1 0 31.831
             a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <text x="18" y="20.35" className="percentage">{available}/{required}</text>
        </svg>
      </div>
      <div className="ring-gauge-label">{label}</div>
    </div>
  );
}
