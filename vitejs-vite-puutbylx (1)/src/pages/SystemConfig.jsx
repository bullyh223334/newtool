import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuickConfig } from "../context/QuickConfigContext";
import ConfigModal from "./ConfigModal";
import "../pages/QuickConfig.css";

const protocolOptions = ["Wiegand", "OSDP"];
const deploymentOptions = ["In", "In & out"];
const defaultSelectOption = "- Select -";

export default function SystemConfig() {
  const { configState, updateConfigState } = useQuickConfig();
  const navigate = useNavigate();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [availableDeployments, setAvailableDeployments] = useState(deploymentOptions);
  const [availableCommsTypes, setAvailableCommsTypes] = useState([]);
  const [availableTargetCapacities, setAvailableTargetCapacities] = useState([]);
  const [isOutReaderDisabled, setIsOutReaderDisabled] = useState(true);

  // Update available deployments based on protocol and commsType
  useEffect(() => {
    console.log("SystemConfig: Updating availableDeployments", { protocol: configState.protocol, commsType: configState.commsType });
    let dp = ["In", "In & out"];
    if (configState.protocol === "Wiegand" && configState.commsType === "IP") {
      dp = ["In"];
      if (configState.deployment === "In & out") {
        console.log("SystemConfig: Resetting deployment to 'In' due to Wiegand + IP");
        updateConfigState({ deployment: "In" });
      }
    }
    setAvailableDeployments(dp);
    // Only reset deployment if protocol changes and current deployment is invalid
    if (configState.protocol && configState.deployment && !dp.includes(configState.deployment)) {
      console.log("SystemConfig: Resetting deployment to empty due to invalid selection");
      updateConfigState({ deployment: "" });
    }
  }, [configState.protocol, configState.commsType, configState.deployment, updateConfigState]);

  // Update available comms types based on protocol and deployment
  useEffect(() => {
    console.log("SystemConfig: Updating availableCommsTypes", { protocol: configState.protocol, deployment: configState.deployment });
    let co = [];
    let dis = true;
    if (configState.protocol === "Wiegand") {
      if (configState.deployment === "In") {
        co = ["IP", "RS-485"];
        dis = true;
      } else if (configState.deployment === "In & out") {
        co = ["RS-485"];
        dis = false;
      }
    } else if (configState.protocol === "OSDP") {
      co = ["IP", "RS-485", "Mixed (RS-485 & IP)"];
      dis = configState.deployment === "In";
    }
    setAvailableCommsTypes(co);
    if (configState.commsType && !co.includes(configState.commsType)) {
      console.log("SystemConfig: Resetting commsType to empty due to invalid selection");
      updateConfigState({ commsType: "" });
    }
    updateConfigState({ readersOut: dis ? 0 : configState.readersOut });
    setIsOutReaderDisabled(dis);
  }, [configState.protocol, configState.deployment, configState.commsType, updateConfigState]);

  // Update target doors per controller options
  useEffect(() => {
    const uc = [...new Set([1, 2, 4, 8])].sort((a, b) => a - b);
    setAvailableTargetCapacities(uc);
    if (configState.targetDoorsPerController && !uc.includes(parseInt(configState.targetDoorsPerController))) {
      updateConfigState({ targetDoorsPerController: "" });
    }
  }, [configState.targetDoorsPerController, updateConfigState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("SystemConfig: handleChange", { name, value, type, checked });
    updateConfigState({ [name]: type === "checkbox" ? checked : value });
  };

  const handleConfigSave = (config) => {
    console.log("SystemConfig: Saving config from modal", config);
    updateConfigState({
      protocol: config.protocol,
      deployment: config.useOutReaders ? "In & out" : "In",
      commsType: config.doorComms,
    });
    setIsOutReaderDisabled(!config.useOutReaders);
    setShowConfigModal(false);
  };

  const handleNext = () => {
    if (!configState.protocol || !configState.deployment || !configState.commsType) {
      alert("Please complete all system configuration selections.");
      return;
    }
    navigate("/quick/requirements");
  };

  return (
    <div className="quick-config-page">
      <div className="header-bar">
        <div className="header-title">Quick Config - System Configuration</div>
      </div>
      <div className="inputs-panel panel" style={{ maxWidth: "600px", margin: "20px auto" }}>
        <h3>System Configuration</h3>
        <button onClick={() => setShowConfigModal(true)}>Open Configuration Modal</button>
        <div className="config-box">
          <label>
            Reader Protocol <span style={{ color: "red" }}>*</span>
            <select
              name="protocol"
              value={configState.protocol}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                {defaultSelectOption}
              </option>
              {protocolOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label>
            Reader Deployment <span style={{ color: "red" }}>*</span>
            <select
              name="deployment"
              value={configState.deployment}
              onChange={handleChange}
              disabled={!configState.protocol}
              required
            >
              <option value="" disabled>
                {defaultSelectOption}
              </option>
              {availableDeployments.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label>
            Comms Type <span style={{ color: "red" }}>*</span>
            <select
              name="commsType"
              value={configState.commsType}
              onChange={handleChange}
              disabled={!configState.protocol || !configState.deployment}
              required
            >
              <option value="" disabled>
                {defaultSelectOption}
              </option>
              {availableCommsTypes.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label>
            Target Doors per Controller <small>(Optional)</small>
            <select
              name="targetDoorsPerController"
              value={configState.targetDoorsPerController}
              onChange={handleChange}
              disabled={!configState.commsType || availableTargetCapacities.length === 0}
            >
              <option value="">Default (Highest Capacity)</option>
              {availableTargetCapacities.map((cap) => (
                <option key={cap} value={cap}>
                  {cap} Doors
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="excludeSynAppDoor"
              checked={configState.excludeSynAppDoor}
              onChange={handleChange}
            />
            Exclude SynApp Built-in Door/Resources
          </label>
        </div>
        <div className="floating-save">
          <button onClick={() => navigate("/quick/project")}>Back</button>
          <button onClick={handleNext}>Next: Requirements</button>
        </div>
      </div>
      {showConfigModal && (
        <ConfigModal
          initial={{
            protocol: configState.protocol,
            systemType: configState.systemType === "balanced" ? "balanced" : "balanced",
            doorComms: configState.commsType,
            useOutReaders: configState.deployment === "In & out",
            cloudMode: configState.systemType.toLowerCase(),
          }}
          onSave={handleConfigSave}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}