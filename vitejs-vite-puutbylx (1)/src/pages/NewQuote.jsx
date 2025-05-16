import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NewQuote.css";

const systemTypeOptions = ["Cloud", "On-Prem"];
const defaultSelectOption = "- Select -";

export default function NewQuote() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    date: new Date().toISOString().slice(0, 10),
    systemType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickQuote = () => {
    if (!formData.name.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!formData.systemType) {
      alert("Please select a system type.");
      return;
    }
    navigate("/quick/system", { state: formData });
  };

  const handleAdvancedConfig = () => {
    if (!formData.name.trim()) {
      alert("Please enter a project name.");
      return;
    }
    navigate("/advanced", { state: { projectName: formData.name } });
  };

  return (
    <div className="new-quote-page">
      <h1>Create New Quote</h1>
      <p>Enter project details to start your quote.</p>
      <div className="inputs-panel">
        <label>
          Project Name <span style={{ color: "red" }}>*</span>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name..."
            required
          />
        </label>
        <label>
          Client
          <input
            name="client"
            value={formData.client}
            onChange={handleChange}
            placeholder="Enter client name..."
          />
        </label>
        <label>
          Date
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </label>
        <label>
          System Type <span style={{ color: "red" }}>*</span>
          <select
            name="systemType"
            value={formData.systemType}
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
      </div>
      <div className="actions">
        <button onClick={() => navigate("/")} title="Back to Dashboard">
          Back to Dashboard
        </button>
        <button onClick={handleQuickQuote} title="Continue with Quick Quote">
          Continue with Quick Quote
        </button>
        <button onClick={handleAdvancedConfig} title="Advanced Configuration">
          Start Advanced Configuration
        </button>
      </div>
    </div>
  );
}