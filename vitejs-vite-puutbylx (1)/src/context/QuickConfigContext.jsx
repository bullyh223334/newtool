import React, { createContext, useContext, useState } from "react";

const QuickConfigContext = createContext();

export const useQuickConfig = () => useContext(QuickConfigContext);

export const QuickConfigProvider = ({ children }) => {
  const [configState, setConfigState] = useState({
    name: "",
    client: "",
    date: new Date().toISOString().slice(0, 10),
    projectType: "Quick Config",
    notes: "",
    doors: 0,
    readersIn: 0,
    readersOut: 0,
    reqInputs: 0,
    reqOutputs: 0,
    protocol: "",
    deployment: "",
    commsType: "",
    targetDoorsPerController: "",
    excludeSynAppDoor: false,
    systemType: "",
    systemUsers: 0,
    softwareSelections: {},
  });

  const updateConfigState = (updates) => {
    console.log("QuickConfigContext: Updating configState", updates);
    setConfigState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <QuickConfigContext.Provider value={{ configState, updateConfigState }}>
      {children}
    </QuickConfigContext.Provider>
  );
};