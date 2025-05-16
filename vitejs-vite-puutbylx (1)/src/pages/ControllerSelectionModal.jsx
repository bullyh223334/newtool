import React, { useState } from "react";
import "../pages/SoftwareModal.css";

const CONTROLLERS = [
  { model: "SynApp", description: "Main Site Controller" },
  { model: "SynOne", description: "1-Door IP Controller" },
  { model: "SynConSC", description: "2-Door RS-485 Controller" },
  { model: "SynConDuoDuo", description: "4-Door RS-485 Controller" },
  { model: "SynConEvo", description: "8-Door IP Controller (OSDP only)" },
  { model: "SynIO", description: "I/O Module" },
];

export default function ControllerSelectionModal({ initialSelections = {}, onSave, onClose }) {
  const [selections, setSelections] = useState(
    CONTROLLERS.reduce((acc, ctrl) => {
      acc[ctrl.model] = initialSelections[ctrl.model] || 0;
      return acc;
    }, {})
  );

  const handleChange = (model, value) => {
    setSelections((prev) => ({
      ...prev,
      [model]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const handleSave = () => {
    onSave(selections);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Select Controllers</h2>
        {CONTROLLERS.map((ctrl) => (
          <div key={ctrl.model} className="software-category">
            <h4>{ctrl.model}</h4>
            <div className="software-option">
              <label>
                Quantity
                <input
                  type="number"
                  min="0"
                  value={selections[ctrl.model]}
                  onChange={(e) => handleChange(ctrl.model, e.target.value)}
                />
              </label>
              <p>{ctrl.description}</p>
            </div>
          </div>
        ))}
        <div className="modal-actions">
          <button onClick={handleSave}>Save Selections</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}