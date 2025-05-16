import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuotes } from "../context/QuotesContext";
import ConfigModal from "./ConfigModal";
import SoftwareModal from "./SoftwareModal";
import "./QuickConfig.css";

export default function AdvancedConfig() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { addQuote, currentUser } = useQuotes();
  const [config, setConfig] = useState({
    name: state?.projectName || "",
    systemType: state?.systemType || "",
    client: state?.client || "",
    date: state?.date || new Date().toISOString().slice(0, 10),
    protocol: "",
    doorComms: "",
    useOutReaders: false,
    softwareSelections: {},
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSoftwareModal, setShowSoftwareModal] = useState(false);

  const handleConfigSave = (modalConfig) => {
    setConfig((prev) => ({
      ...prev,
      protocol: modalConfig.protocol,
      doorComms: modalConfig.doorComms,
      useOutReaders: modalConfig.useOutReaders,
    }));
    setShowConfigModal(false);
  };

  const handleSoftwareSave = (selectedItems) => {
    const selections = {};
    selectedItems.forEach((item) => {
      selections[item.name] = true;
    });
    setConfig((prev) => ({ ...prev, softwareSelections: selections }));
    setShowSoftwareModal(false);
  };

  const handleSave = () => {
    if (!config.name.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!config.systemType) {
      alert("Please select a system type.");
      return;
    }

    const quoteObject = {
      id: String(Date.now()),
      name: config.name.trim(),
      created: new Date().toISOString(),
      status: "Advanced Config",
      company: currentUser?.company || "N/A",
      items: [], // Placeholder for advanced config items
      systemDetails: {
        systemType: config.systemType,
        protocol: config.protocol,
        doorComms: config.doorComms,
        useOutReaders: config.useOutReaders,
        softwareSelections: config.softwareSelections,
      },
      projectType: config.systemType,
      totalOneOff: "0.00",
      totalMonthly: "0.00",
      smcCost: "0.00",
      currency: "GBP",
      approvalStatus: "Pending",
      client: config.client || "N/A",
      date: config.date,
      notes: "",
    };

    try {
      if (typeof addQuote === "function") {
        console.log("Saving advanced quote:", quoteObject);
        addQuote(quoteObject);
        alert(`Quote "${quoteObject.name}" saved successfully!`);
        navigate("/");
      } else {
        console.error("Error: addQuote is not a function.");
        alert("Error: Could not save quote (addQuote not available).");
      }
    } catch (error) {
      console.error("Error saving advanced quote:", error);
      alert(`Failed to save quote. Error: ${error.message}`);
    }
  };

  return (
    <div className="quick-config-page">
      <div className="header-bar">
        <div className="header-title">Advanced Configuration</div>
      </div>
      <div className="inputs-panel panel" style={{ maxWidth: "600px", margin: "20px auto" }}>
        <h3>Quote Details</h3>
        <div className="config-box">
          <label>
            Project Name
            <input
              value={config.name}
              onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name..."
              readOnly
            />
          </label>
          <label>
            System Type
            <input value={config.systemType} readOnly />
            <button onClick={() => setShowConfigModal(true)}>Edit System Config</button>
          </label>
          <label>
            Software Selections
            <input
              value={Object.keys(config.softwareSelections).join(", ") || "None"}
              readOnly
            />
            <button onClick={() => setShowSoftwareModal(true)}>Edit Software</button>
          </label>
        </div>
        <div className="floating-save">
          <button onClick={() => navigate("/")}>Back</button>
          <button onClick={handleSave}>Save Quote</button>
        </div>
      </div>
      {showConfigModal && (
        <ConfigModal
          initial={{
            protocol: config.protocol,
            doorComms: config.doorComms,
            useOutReaders: config.useOutReaders,
            cloudMode: config.systemType.toLowerCase(),
          }}
          onSave={handleConfigSave}
          onClose={() => setShowConfigModal(false)}
        />
      )}
      {showSoftwareModal && (
        <SoftwareModal
          isCloud={config.systemType === "Cloud"}
          initialSelections={config.softwareSelections}
          onSave={handleSoftwareSave}
          onClose={() => setShowSoftwareModal(false)}
        />
      )}
    </div>
  );
}