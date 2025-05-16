import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuickConfig } from "../context/QuickConfigContext";
import "../pages/QuickConfig.css";

const systemTypeOptions = ["Cloud", "On-Prem"];
const defaultSelectOption = "- Select -";

export default function ProjectDetails() {
  const { configState, updateConfigState } = useQuickConfig();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateConfigState({ [name]: value });
  };

  const handleNext = () => {
    if (!configState.name.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!configState.systemType) {
      alert("Please select a system type.");
      return;
    }
    navigate("/quick/system");
  };

  return (
    <div className="quick-config-page">
      <div className="header-bar">
        <div className="header-title">Quick Config - Project Details</div>
      </div>
      <div className="inputs-panel panel" style={{ maxWidth: "600px", margin: "20px auto" }}>
        <h3>Project Details</h3>
        <label>
          Project Name <span style={{ color: "red" }}>*</span>
          <input
            name="name"
            value={configState.name}
            onChange={handleChange}
            placeholder="Enter project name..."
            required
          />
        </label>
        <label>
          Client
          <input
            name="client"
            value={configState.client}
            onChange={handleChange}
            placeholder="Enter client name..."
          />
        </label>
        <label>
          Date
          <input
            type="date"
            name="date"
            value={configState.date}
            onChange={handleChange}
          />
        </label>
        <label>
          System Type <span style={{ color: "red" }}>*</span>
          <select
            name="systemType"
            value={configState.systemType}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              {defaultSelectOption}
            </option>
            {systemTypeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <div className="floating-save">
          <button onClick={handleNext}>Next: System Configuration</button>
        </div>
      </div>
    </div>
  );
}