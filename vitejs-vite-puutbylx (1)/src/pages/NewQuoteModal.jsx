import React, { useState } from "react";
import { useQuotes } from "../context/QuotesContext";
import "./SoftwareModal.css";

const systemTypeOptions = ["Cloud", "On-Prem"];
const defaultSelectOption = "- Select -";

export default function NewQuoteModal({ onAction, onClose }) {
  const { addQuote, currentUser } = useQuotes();
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    systemType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualQuote = () => {
    if (!formData.name.trim()) {
      alert("Please enter a quote name.");
      return;
    }
    if (!formData.systemType) {
      alert("Please select a system type.");
      return;
    }

    const quoteObject = {
      id: String(Date.now()),
      name: formData.name.trim(),
      created: new Date().toISOString(),
      status: "Manual Quote",
      company: currentUser?.company || "N/A",
      items: [],
      systemDetails: {
        systemType: formData.systemType,
      },
      projectType: formData.systemType,
      totalOneOff: "0.00",
      totalMonthly: "0.00",
      smcCost: "0.00",
      currency: "GBP",
      approvalStatus: "Pending",
      client: "N/A",
      date: formData.date,
      notes: "",
    };

    try {
      if (typeof addQuote === "function") {
        console.log("Saving manual quote:", quoteObject);
        addQuote(quoteObject);
        onAction("manual", quoteObject);
      } else {
        console.error("Error: addQuote is not a function.");
        alert("Error: Could not save quote.");
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      alert(`Failed to save quote. Error: ${error.message}`);
    }
  };

  const handleSystemConfig = () => {
    if (!formData.name.trim()) {
      alert("Please enter a quote name.");
      return;
    }
    if (!formData.systemType) {
      alert("Please select a system type.");
      return;
    }
    onAction("system", formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Create New Quote</h2>
        <label>
          Quote Name <span style={{ color: "red" }}>*</span>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter quote name..."
            required
          />
        </label>
        <label>
          Date
          <input
            type="date"
            name="date"
            value={formData.date}
            readOnly
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
        <div className="modal-actions">
          <button onClick={handleManualQuote}>Manual Quote</button>
          <button onClick={handleSystemConfig}>Continue to System Configuration</button>
          <button onClick={onClose}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}