import React, { useState } from "react";
import "./SoftwareModal.css";

export default function ConfigModal({ initial, onSave, onClose }) {
  const [config, setConfig] = useState({
    protocol: initial.protocol || "",
    doorComms: initial.doorComms || "",
    deployment: initial.deployment || "In Only",
    targetDoorsPerController: initial.targetDoorsPerController || "",
    cloudMode: initial.cloudMode || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "protocol" || name === "deployment" ? { doorComms: "" } : {}), // Reset doorComms on protocol/deployment change
    }));
  };

  const handleSave = () => {
    if (!config.protocol) {
      alert("Please select a Reader Protocol.");
      return;
    }
    if (!config.deployment) {
      alert("Please select a Reader Deployment.");
      return;
    }
    if (!config.doorComms) {
      alert("Please select a Door Comms option.");
      return;
    }
    if (!config.targetDoorsPerController) {
      alert("Please select a Target Doors per Controller.");
      return;
    }
    onSave(config);
  };

  const commsOptions = () => {
    if (config.protocol === "Wiegand") {
      if (config.deployment === "In Only") {
        return ["IP", "RS-485"];
      } else if (config.deployment === "In & Out") {
        return ["RS-485"];
      }
    } else if (config.protocol === "OSDP") {
      return ["IP", "RS-485", "Mixed (RS-485 & IP)"];
    }
    return [];
  };

  const doorCountOptions = ["Default", "1", "2", "4", "8"];

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>System Configuration</h2>
        <label>
          Reader Protocol <span style={{ color: "red" }}>*</span>
          <select name="protocol" value={config.protocol} onChange={handleChange}>
            <option value="">Select Protocol</option>
            <option value="Wiegand">Wiegand</option>
            <option value="OSDP">OSDP</option>
          </select>
        </label>
        <label>
          Reader Deployment <span style={{ color: "red" }}>*</span>
          <select name="deployment" value={config.deployment} onChange={handleChange}>
            <option value="">Select Deployment</option>
            <option value="In Only">In Only</option>
            <option value="In & Out">In & Out</option>
          </select>
        </label>
        <label>
          Door Comms <span style={{ color: "red" }}>*</span>
          <select name="doorComms" value={config.doorComms} onChange={handleChange}>
            <option value="">Select Comms</option>
            {commsOptions().map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          Target Doors per Controller <span style={{ color: "red" }}>*</span>
          <select
            name="targetDoorsPerController"
            value={config.targetDoorsPerController}
            onChange={handleChange}
          >
            <option value="">Select Door Count</option>
            {doorCountOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}