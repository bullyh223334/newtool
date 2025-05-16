import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuotes } from "../context/QuotesContext";
import { useProducts } from "../context/ProductsContext";
import { useQuickConfig } from "../context/QuickConfigContext";
import SoftwareModal from "./SoftwareModal";
import ControllerSelectionModal from "./ControllerSelectionModal";
import ConfigModal from "./ConfigModal";
import "../pages/QuickConfig.css";

// Constants
const CONTROLLERS = [
  { model: "SynApp", quoteHardware: "S03835", quoteModelNameHW: "SynApp-DIN-HW" },
  { model: "SynOne", quoteHardware: "S12345", quoteModelNameHW: "Synone-HW" },
  { model: "SynConSC", quoteHardware: "S03850", quoteModelNameHW: "SynConSC-HW" },
  { model: "SynConDuoDuo", quoteHardware: "S03846", quoteModelNameHW: "SynCon-HW" },
  { model: "SynConEvo", quoteHardware: "S03855", quoteModelNameHW: "SynConEvo-DIN-HW" },
  { model: "SynIO", quoteHardware: "S03869", quoteModelNameHW: "SynIO-DIN-HW" },
];
const SOFTWARE_PARTS = {};
const SYNAPP_MAX_DOOR_CONTROLLERS = 32;
const SYNAPP_MAX_READERS = 128;

const getInitialCtrlState = () => CONTROLLERS.reduce((acc, ctrl) => { acc[ctrl.model] = 0; return acc; }, {});
const findControllerInfo = (modelName) => CONTROLLERS.find(c => c.model === modelName);
const findSoftwareInfo = (key) => SOFTWARE_PARTS[key];

export default function Requirements() {
  const { configState, updateConfigState } = useQuickConfig();
  const { addQuote, currentUser } = useQuotes();
  const { products, loading: productsLoading } = useProducts();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [ctrls, setCtrls] = useState(getInitialCtrlState());
  const [showSoftwareModal, setShowSoftwareModal] = useState(false);
  const [showControllerModal, setShowControllerModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    if (state) {
      updateConfigState({
        name: state.name || "",
        systemType: state.systemType || "",
        date: state.date || new Date().toISOString().slice(0, 10),
        protocol: state.protocol || "",
        commsType: state.doorComms || "",
        deployment: state.deployment || "In Only",
        targetDoorsPerController: state.targetDoorsPerController || "",
        excludeSynAppDoor: state.excludeSynAppDoor || false,
      });
    }
  }, [state, updateConfigState]);

  const handleNumberChange = (fieldName) => (e) => {
    const value = Math.max(0, parseInt(e.target.value, 10) || 0);
    console.log("Requirements: handleNumberChange", { fieldName, value });
    updateConfigState({ [fieldName]: value });
  };

  const handleExcludeSynAppChange = (e) => {
    const checked = e.target.checked;
    console.log("Requirements: handleExcludeSynAppChange", { excludeSynAppDoor: checked });
    updateConfigState({ excludeSynAppDoor: checked });
  };

  const handleSoftwareSave = (selectedItems) => {
    console.log("Requirements: handleSoftwareSave", { selectedItems });
    const selections = {};
    selectedItems.forEach((item) => {
      selections[item.name] = true;
    });
    updateConfigState({ softwareSelections: selections });
    setShowSoftwareModal(false);
  };

  const handleControllerSave = (selections) => {
    console.log("Requirements: handleControllerSave", { selections });
    setCtrls(selections);
    setShowControllerModal(false);
  };

  const handleConfigSave = (config) => {
    console.log("Requirements: handleConfigSave", { config });
    updateConfigState({
      protocol: config.protocol,
      commsType: config.doorComms,
      deployment: config.deployment,
      targetDoorsPerController: config.targetDoorsPerController,
    });
    setShowConfigModal(false);
  };

  // Controller calculation logic
  const availableControllerData = useMemo(() => {
    if (!configState.protocol || !configState.deployment || !configState.commsType) return [];
    let mdls = [];
    let caps = {};
    if (configState.protocol === "Wiegand") {
      if (configState.deployment === "In Only") {
        if (configState.commsType === "IP") {
          mdls = ["SynApp", "SynOne"];
          caps = {
            SynApp: { doors: 1, readers: 1, wiegand: 1, requiresSynApp: true },
            SynOne: { doors: 1, readers: 1, wiegand: 1, requiresSynApp: false },
          };
        } else if (configState.commsType === "RS-485") {
          mdls = ["SynApp", "SynConSC"];
          caps = {
            SynApp: { doors: 1, readers: 1, wiegand: 1, requiresSynApp: true },
            SynConSC: { doors: 2, readers: 2, wiegand: 2, requiresSynApp: true },
          };
        }
      } else if (configState.deployment === "In & Out") {
        if (configState.commsType === "RS-485") {
          mdls = ["SynApp", "SynConSC"];
          caps = {
            SynApp: { doors: 0, readers: 0, wiegand: 0, requiresSynApp: true },
            SynConSC: { doors: 1, readers: 2, wiegand: 2, requiresSynApp: true },
          };
        }
      }
    } else if (configState.protocol === "OSDP") {
      if (configState.commsType === "IP") {
        mdls = ["SynApp", "SynConEvo", "SynOne"];
        caps = {
          SynApp: { doors: 1, readers: 2, wiegand: 0, requiresSynApp: true },
          SynConEvo: { doors: 8, readers: 16, wiegand: 0, requiresSynApp: true },
          SynOne: { doors: 1, readers: 2, wiegand: 0, requiresSynApp: false },
        };
      } else if (configState.commsType === "RS-485") {
        mdls = ["SynApp", "SynConSC", "SynConDuoDuo", "SynConEvo"];
        caps = {
          SynApp: { doors: 1, readers: 2, wiegand: 0, requiresSynApp: true },
          SynConSC: { doors: 2, readers: 4, wiegand: 0, requiresSynApp: true },
          SynConDuoDuo: { doors: 4, readers: 8, wiegand: 0, requiresSynApp: true },
          SynConEvo: { doors: 8, readers: 16, wiegand: 0, requiresSynApp: true },
        };
      } else if (configState.commsType === "Mixed (RS-485 & IP)") {
        mdls = ["SynApp", "SynConSC", "SynConDuoDuo", "SynConEvo", "SynOne"];
        caps = {
          SynApp: { doors: 1, readers: 2, wiegand: 0, requiresSynApp: true },
          SynConSC: { doors: 2, readers: 4, wiegand: 0, requiresSynApp: true },
          SynConDuoDuo: { doors: 4, readers: 8, wiegand: 0, requiresSynApp: true },
          SynConEvo: { doors: 8, readers: 16, wiegand: 0, requiresSynApp: true },
          SynOne: { doors: 1, readers: 2, wiegand: 0, requiresSynApp: false },
        };
      }
    }
    return mdls.map((m) => {
      const b = findControllerInfo(m);
      const e = caps[m] || {};
      const r = e.requiresSynApp !== false;
      return {
        model: m,
        description: b?.description || "Unknown",
        effectiveDoors: e.doors ?? b?.baseDoors ?? 0,
        effectiveReaders: e.readers ?? b?.baseReaders ?? 0,
        effectiveWiegand: e.wiegand ?? b?.baseWiegand ?? 0,
        requiresSynAppInitially: r,
        quoteHardware: b?.quoteHardware,
      };
    }).filter((c) => !(configState.protocol === "Wiegand" && c.model === "SynConEvo"));
  }, [configState.protocol, configState.deployment, configState.commsType]);

  useEffect(() => {
    if (configState.doors) updateConfigState({ readersIn: configState.doors });
  }, [configState.doors, updateConfigState]);

  useEffect(() => {
    if (configState.readersOut > configState.doors) {
      updateConfigState({ readersOut: configState.doors });
    }
  }, [configState.doors, configState.readersOut, updateConfigState]);

  useEffect(() => {
    if (
      configState.protocol &&
      configState.deployment &&
      configState.commsType &&
      availableControllerData.length > 0
    ) {
      const calcCtrls = calculateControllers(
        configState.commsType,
        configState.protocol,
        configState.deployment,
        configState.doors,
        configState.readersIn,
        configState.readersOut,
        configState.targetDoorsPerController,
        configState.reqInputs,
        configState.reqOutputs,
        availableControllerData,
        configState.excludeSynAppDoor
      );
      setCtrls(calcCtrls);
    } else {
      setCtrls(getInitialCtrlState());
    }
  }, [
    configState.protocol,
    configState.deployment,
    configState.commsType,
    configState.doors,
    configState.readersIn,
    configState.readersOut,
    configState.targetDoorsPerController,
    configState.reqInputs,
    configState.reqOutputs,
    configState.excludeSynAppDoor,
    availableControllerData,
  ]);

  const totalReqReaders = useMemo(() => configState.readersIn + configState.readersOut, [
    configState.readersIn,
    configState.readersOut,
  ]);

  const { totalProvidedDoors, totalProvidedReaders, totalProvidedInputs, totalProvidedOutputs } = useMemo(() => {
    let d = 0,
      tR = 0,
      i = 0,
      o = 0;
    Object.entries(ctrls).forEach(([m, c]) => {
      if (c > 0) {
        const cd = availableControllerData.find((x) => x.model === m);
        const bi = findControllerInfo(m);
        const isEx = m === "SynApp" && configState.excludeSynAppDoor;
        const drC = isEx ? 0 : (cd?.effectiveDoors ?? bi?.baseDoors ?? 0);
        const rdrC = isEx ? 0 : (cd?.effectiveReaders ?? bi?.baseReaders ?? 0);
        const iC = isEx ? 0 : (bi?.baseInputs ?? 0);
        const oC = isEx ? 0 : (bi?.baseOutputs ?? 0);
        d += c * drC;
        tR += c * rdrC;
        i += c * iC;
        o += c * oC;
      }
    });
    return {
      totalProvidedDoors: d,
      totalProvidedReaders: tR,
      totalProvidedInputs: i,
      totalProvidedOutputs: o,
    };
  }, [ctrls, availableControllerData, configState.excludeSynAppDoor]);

  const calculatedQuoteItems = useMemo(() => {
    console.log("Calculating detailed quote items for GBP...");
    const items = [];
    if (productsLoading || !Array.isArray(products) || products.length === 0) {
      console.warn("Products data not available yet. Preview may be incomplete.");
      return [];
    }
    const basePlatformArticlePrem = "S00531";
    const basePlatformArticleCloud = "S00531H";
    const baseUserArticlePrem = "S00524";
    const baseUserArticleCloud = "S00524H";
    Object.entries(ctrls).forEach(([modelKey, qty]) => {
      if (qty > 0) {
        const controllerInfo = findControllerInfo(modelKey);
        if (!controllerInfo) return;
        const hardwareArticleNumber = controllerInfo.quoteHardware;
        if (!hardwareArticleNumber) return;
        const productDetail = products.find((p) => p.articleNumber === hardwareArticleNumber);
        items.push({
          articleNumber: hardwareArticleNumber,
          model: controllerInfo.quoteModelNameHW || modelKey,
          description: productDetail?.descriptionEN || controllerInfo?.description || "Unknown Hardware",
          method: productDetail?.method || "Upfront",
          msrpGBP: productDetail?.msrpGBP ?? 0,
          msrp: productDetail?.msrpGBP ?? 0,
          discountStandard: productDetail?.discountStandard ?? 0,
          qty: qty,
          costType: productDetail?.type?.toLowerCase().includes("recurring") ? "Monthly" : "One-Off",
          smc: productDetail?.smc ?? 0,
        });
      }
    });
    if (configState.systemType) {
      const platformArticleNumber = configState.systemType === 'Cloud' ? basePlatformArticleCloud : basePlatformArticlePrem;
      const platformProductDetail = products.find(p => p.articleNumber === platformArticleNumber);
      const platformBaseInfoKey = configState.systemType === 'Cloud' ? "H-Synguard-Platform" : "Synguard-Platform";
      const platformBaseInfo = findSoftwareInfo(platformBaseInfoKey);
      items.push({
        articleNumber: platformArticleNumber,
        model: platformBaseInfo?.quoteModelName || 'Platform',
        description: platformProductDetail?.descriptionEN || platformBaseInfo?.description || 'Unknown Software',
        method: platformProductDetail?.method || (configState.systemType === 'Cloud' ? 'Recurring' : 'Upfront'),
        msrpGBP: platformProductDetail?.msrpGBP ?? 0,
        msrp: platformProductDetail?.msrpGBP ?? 0,
        discountStandard: platformProductDetail?.discountStandard ?? 0,
        qty: 1,
        costType: platformProductDetail?.type?.toLowerCase().includes('recurring') ? 'Monthly' : 'One-Off',
        smc: platformProductDetail?.smc ?? 0,
      });
      if (configState.systemUsers > 0) {
        const userSwArticleNumber = configState.systemType === 'Cloud' ? baseUserArticleCloud : baseUserArticlePrem;
        const userSoftwareProductDetail = products.find(p => p.articleNumber === userSwArticleNumber);
        const userSoftwareBaseInfoKey = configState.systemType === 'Cloud' ? "H-Synguard" : "Synguard";
        const userSoftwareBaseInfo = findSoftwareInfo(userSoftwareBaseInfoKey);
        items.push({
          articleNumber: userSwArticleNumber,
          model: userSoftwareBaseInfo?.quoteModelName || 'User License',
          description: userSoftwareProductDetail?.descriptionEN || `${userSoftwareBaseInfo?.description || 'User License'} (${configState.systemType})` || 'Unknown Software',
          method: userSoftwareProductDetail?.method || (configState.systemType === 'Cloud' ? 'Recurring' : 'Upfront'),
          msrpGBP: userSoftwareProductDetail?.msrpGBP ?? 0,
          msrp: userSoftwareProductDetail?.msrpGBP ?? 0,
          discountStandard: userSoftwareProductDetail?.discountStandard ?? 0,
          qty: configState.systemUsers,
          costType: userSoftwareProductDetail?.type?.toLowerCase().includes('recurring') ? 'Monthly' : 'One-Off',
          smc: userSoftwareProductDetail?.smc ?? 0,
        });
      }
    }
    return items.sort((a, b) => {
      const mO = { 'Upfront': 1, 'Recurring': 2 };
      const mA = a.method || '';
      const mB = b.method || '';
      const mC = (mO[mA] || 3) - (mO[mB] || 3);
      if (mC !== 0) return mC;
      return (a.articleNumber || '').localeCompare(b.articleNumber || '');
    });
  }, [ctrls, configState.systemType, configState.systemUsers, configState.excludeSynAppDoor, products, productsLoading]);

  function calculateControllers(comm, tech, deploy, requiredDoors, rIn, rOut, targetCapacityStr, requiredInputs, requiredOutputs, availableData, excludeSynAppDoorFlag) {
    console.log('--- calculateControllers entered ---');
    const C = getInitialCtrlState();
    let doorsToAllocate = requiredDoors;
    const initialSynAppRequiredByAnyComponent = availableData.some(c => c.requiresSynAppInitially);
    let isSynOneOnlyScenario = false;
    const synAppData = availableData.find(c => c.model === 'SynApp');
    if (initialSynAppRequiredByAnyComponent) {
      C.SynApp = 1;
    } else {
      C.SynApp = (synAppData && synAppData.effectiveDoors > 0 && !excludeSynAppDoorFlag) ? 1 : 0;
    }
    if (C.SynApp > 0 && synAppData && synAppData.effectiveDoors > 0 && doorsToAllocate > 0 && !excludeSynAppDoorFlag) {
      doorsToAllocate -= synAppData.effectiveDoors;
      doorsToAllocate = Math.max(0, doorsToAllocate);
    }
    let potentialDoorControllers = availableData.filter(c => c.model !== 'SynApp' && c.model !== 'SynIO' && c.effectiveDoors > 0);
    if (potentialDoorControllers.length === 0 && synAppData && synAppData.effectiveDoors > 0 && !excludeSynAppDoorFlag) {
      potentialDoorControllers = [synAppData];
    }
    let selectedControllerModel = null;
    let selectedCapacity = 0;
    const targetCapInt = parseInt(targetCapacityStr);
    if (targetCapacityStr && !isNaN(targetCapInt)) {
      const targetController = potentialDoorControllers.find(c => c.effectiveDoors === targetCapInt);
      if (targetController) {
        selectedControllerModel = targetController.model;
        selectedCapacity = targetController.effectiveDoors;
      }
    }
    if (!selectedControllerModel && potentialDoorControllers.length > 0) {
      potentialDoorControllers.sort((a, b) => b.effectiveDoors - a.effectiveDoors);
      selectedControllerModel = potentialDoorControllers[0].model;
      selectedCapacity = potentialDoorControllers[0].effectiveDoors;
    }
    if (selectedControllerModel && requiredDoors > 0) {
      let quantityNeeded = 0;
      if (tech === 'Wiegand' && deploy === 'In & Out' && selectedControllerModel === 'SynConSC') {
        const controllersForInOut = rOut;
        const remainingInOnlyDoors = Math.max(0, requiredDoors - rOut);
        const controllersForInOnly = remainingInOnlyDoors > 0 ? Math.ceil(remainingInOnlyDoors / 2) : 0;
        quantityNeeded = controllersForInOut + controllersForInOnly;
        C[selectedControllerModel] = (C[selectedControllerModel] || 0) + quantityNeeded;
        doorsToAllocate = 0;
      } else if (doorsToAllocate > 0 && selectedCapacity > 0) {
        quantityNeeded = Math.ceil(doorsToAllocate / selectedCapacity);
        C[selectedControllerModel] = (C[selectedControllerModel] || 0) + quantityNeeded;
        doorsToAllocate = 0;
      }
    }
    const doorCtrlModelsUsed = Object.keys(C).filter(m => m !== 'SynApp' && m !== 'SynIO' && C[m] > 0);
    const synOneDataInThisConfig = availableData.find(d => d.model === 'SynOne');
    if (doorCtrlModelsUsed.length === 1 && doorCtrlModelsUsed[0] === 'SynOne' && synOneDataInThisConfig && !synOneDataInThisConfig.requiresSynAppInitially) {
      isSynOneOnlyScenario = true;
    }
    finalizeSynAppCount(C, rIn + rOut, isSynOneOnlyScenario);
    calculateSynIO(C, requiredInputs, requiredOutputs, excludeSynAppDoorFlag);
    return C;
  }

  function finalizeSynAppCount(currentCounts, totalRequiredReaders, isSynOneOnly) {
    if (isSynOneOnly) {
      currentCounts.SynApp = 0;
      return;
    }
    const depModels = availableControllerData.filter(c => c.requiresSynAppInitially).map(c => c.model);
    let depCount = 0;
    depModels.forEach(m => {
      if (m !== 'SynApp') {
        depCount += currentCounts[m] || 0;
      }
    });
    const neededByCtrl = depCount > 0 ? Math.ceil(depCount / SYNAPP_MAX_DOOR_CONTROLLERS) : 0;
    const neededByRdr = totalRequiredReaders > 0 ? Math.ceil(totalRequiredReaders / SYNAPP_MAX_READERS) : 0;
    const initSynApp = currentCounts.SynApp > 0 ? 1 : 0;
    currentCounts.SynApp = Math.max(neededByCtrl, neededByRdr, initSynApp);
  }

  function calculateSynIO(currentCounts, requiredInputs, requiredOutputs, excludeSynAppDoorFlag) {
    let provI = 0;
    let provO = 0;
    CONTROLLERS.forEach(ci => {
      if (ci.model !== "SynIO") {
        const qty = currentCounts[ci.model] || 0;
        if (qty > 0) {
          const isEx = ci.model === 'SynApp' && excludeSynAppDoorFlag;
          const i2a = isEx ? 0 : (ci.baseInputs ?? 0);
          const o2a = isEx ? 0 : (ci.baseOutputs ?? 0);
          provI += qty * i2a;
          provO += qty * o2a;
        }
      }
    });
    const iDef = Math.max(0, requiredInputs - provI);
    const oDef = Math.max(0, requiredOutputs - provO);
    if (iDef > 0 || oDef > 0) {
      const ioInfo = findControllerInfo("SynIO");
      const iPer = ioInfo?.baseInputs || 16;
      const oPer = ioInfo?.baseOutputs || 16;
      const ioNeededI = (iPer > 0) ? Math.ceil(iDef / iPer) : 0;
      const ioNeededO = (oPer > 0) ? Math.ceil(oDef / oPer) : 0;
      currentCounts.SynIO = Math.max(ioNeededI, ioNeededO);
    } else {
      currentCounts.SynIO = 0;
    }
  }

  const calculateTotalForType = (items, type) => {
    if (!Array.isArray(items)) {
      console.error("calculateTotalForType received non-array:", items);
      return '0.00';
    }
    return items.reduce((total, item) => {
      if (item && typeof item === 'object' && item.costType === type) {
        const msrp = item.msrp ?? 0;
        const discount = item.discountStandard ?? 0;
        const quantity = item.qty ?? 0;
        if (typeof msrp === 'number' && typeof discount === 'number' && typeof quantity === 'number') {
          const lineTotal = msrp * (1 - discount / 100) * quantity;
          return total + lineTotal;
        } else {
          console.warn("Invalid item data for total calculation:", item);
          return total;
        }
      }
      return total;
    }, 0).toFixed(2);
  };

  function handleSave() {
    if (!configState.name.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!configState.protocol || !configState.deployment || !configState.commsType) {
      alert("Please complete all System Configuration selections.");
      return;
    }
    if (!configState.systemType) {
      alert("Please select a System Type.");
      return;
    }
    if (configState.systemUsers <= 0) {
      alert("Please enter the number of System Users (> 0).");
      return;
    }
    if (configState.doors <= 0 && configState.reqInputs <= 0 && configState.reqOutputs <= 0 && Object.values(ctrls).every(qty => qty === 0)) {
      alert("Please specify requirements (Doors, Inputs, Outputs) or System Users (> 0).");
      return;
    }
    if (calculatedQuoteItems.length === 0 && (configState.doors > 0 || configState.reqInputs > 0 || configState.reqOutputs > 0 || configState.systemUsers > 0)) {
      alert("Calculation resulted in no quote items despite requirements. Please check configuration or product data availability.");
      return;
    }
    if (calculatedQuoteItems.length === 0) {
      alert("No items to save in the quote.");
      return;
    }

    const finalItems = calculatedQuoteItems.map(item => ({
      articleNumber: item.articleNumber || '',
      model: item.model || '',
      description: item.description || '',
      method: item.method || 'Upfront',
      msrpGBP: item.msrpGBP ?? 0,
      msrp: item.msrp ?? 0,
      discountStandard: item.discountStandard ?? 0,
      qty: item.qty ?? 0,
      costType: item.costType || 'One-Off',
      smc: item.smc ?? 0,
    }));

    const smcCostValue = finalItems.reduce((total, item) => {
      if (item.costType === 'One-Off' && item.smc > 0) {
        const msrp = item.msrp ?? 0;
        const discount = item.discountStandard ?? 0;
        const quantity = item.qty ?? 0;
        if (typeof msrp === 'number' && typeof discount === 'number' && typeof quantity === 'number' && typeof item.smc === 'number') {
          const netPrice = msrp * (1 - discount / 100) * quantity;
          const smcValueForItem = netPrice * (item.smc / 100);
          return total + smcValueForItem;
        }
      }
      return total;
    }, 0);

    const quoteObject = {
      id: String(Date.now()),
      name: configState.name.trim(),
      created: new Date().toISOString(),
      status: "Quick Config",
      company: currentUser?.company || "N/A",
      items: finalItems,
      systemDetails: {
        protocol: configState.protocol,
        deployment: configState.deployment,
        commsType: configState.commsType,
        targetDoorsPerController: configState.targetDoorsPerController || "Default",
        doors: configState.doors,
        readersIn: configState.readersIn,
        readersOut: configState.readersOut,
        reqInputs: configState.reqInputs,
        reqOutputs: configState.reqOutputs,
        excludeSynAppDoor: configState.excludeSynAppDoor,
        systemType: configState.systemType,
        systemUsers: configState.systemUsers,
        softwareSelections: configState.softwareSelections || {}
      },
      projectType: configState.systemType,
      totalOneOff: calculateTotalForType(finalItems, 'One-Off'),
      totalMonthly: calculateTotalForType(finalItems, 'Monthly'),
      smcCost: configState.systemType === 'On-Prem' ? smcCostValue.toFixed(2) : '0.00',
      currency: 'GBP',
      approvalStatus: "Pending",
      client: configState.client || "N/A",
      date: configState.date || new Date().toISOString().slice(0, 10),
      notes: configState.notes || "",
    };

    try {
      if (typeof addQuote === 'function') {
        console.log("Saving quote:", quoteObject);
        addQuote(quoteObject);
        alert(`Quote "${quoteObject.name}" saved successfully!`);
        navigate("/");
      } else {
        console.error("Error: addQuote is not a function.");
        alert("Error: Could not save quote (addQuote not available).");
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      alert(`Failed to save quote. Error: ${error.message}`);
    }
  }

  return (
    <div className="quick-config-page">
      <div className="header-bar">
        <div className="header-title">Quick Config - Requirements</div>
      </div>
      <div style={{ display: 'flex', gap: '20px', padding: '0 20px', flexWrap: 'wrap' }}>
        <div className="inputs-panel panel" style={{ flex: '1 1 400px', minWidth: '350px' }}>
          <h3>Requirements</h3>
          <button onClick={() => setShowConfigModal(true)}>Adjust System Configuration</button>
          <button onClick={() => setShowSoftwareModal(true)}>Select Software</button>
          <button onClick={() => setShowControllerModal(true)}>Select Controllers</button>
          <div className="config-box">
            <label>
              System Users <span style={{ color: 'red' }}>*</span>
              <input
                type="number"
                min="1"
                name="systemUsers"
                value={configState.systemUsers}
                onChange={handleNumberChange("systemUsers")}
                placeholder="Enter number of users (min 1)"
                required
              />
            </label>
            <hr style={{ margin: '15px 0' }} />
            <label>
              Doors
              <input
                type="number"
                min="0"
                name="doors"
                value={configState.doors}
                onChange={handleNumberChange("doors")}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
              <input
                type="checkbox"
                name="excludeSynAppDoor"
                checked={configState.excludeSynAppDoor}
                onChange={handleExcludeSynAppChange}
                style={{ marginRight: '8px' }}
              />
              Exclude SynApp Door
            </label>
            <label>
              In Readers <small>(Equals Doors)</small>
              <input
                type="number"
                min="0"
                value={configState.readersIn}
                readOnly
                className="readonly-input"
              />
            </label>
            <label>
              Out Readers <small>(No. of Doors needing Out)</small>
              <input
                type="number"
                min="0"
                max={configState.doors}
                name="readersOut"
                value={configState.readersOut}
                onChange={handleNumberChange("readersOut")}
                disabled={configState.deployment === "In Only"}
                style={{ backgroundColor: configState.deployment === "In Only" ? '#e9ecef' : 'white', cursor: configState.deployment === "In Only" ? 'not-allowed' : 'text' }}
                title={configState.deployment === "In Only" ? "Out readers disabled for this configuration" : "Enter number of out readers"}
              />
            </label>
            <label>
              Additional Inputs <small>(Beyond door sensors/REX)</small>
              <input
                type="number"
                min="0"
                name="reqInputs"
                value={configState.reqInputs}
                onChange={handleNumberChange("reqInputs")}
              />
            </label>
            <label>
              Additional Outputs <small>(Beyond lock relays)</small>
              <input
                type="number"
                min="0"
                name="reqOutputs"
                value={configState.reqOutputs}
                onChange={handleNumberChange("reqOutputs")}
              />
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '1 1 400px', minWidth: '350px' }}>
          <div className="overview-panel panel" style={{ flex: '1' }}>
            <h3>System Overview</h3>
            {configState.protocol && configState.deployment && configState.commsType && configState.systemType ? (
              <p className="config-summary">
                <strong>Config:</strong> {configState.systemType} | {configState.protocol} | {configState.deployment} | {configState.commsType}
                {configState.targetDoorsPerController && ` | Target: ${configState.targetDoorsPerController} Doors`}
                {configState.excludeSynAppDoor && " | Excl. SynApp"}
              </p>
            ) : (
              <p style={{ fontSize: '0.9em', color: '#777', fontStyle: 'italic' }}>
                Complete System Configuration selections to calculate.
              </p>
            )}
            <h4>Resource Summary</h4>
            <table className="overview-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Required</th>
                  <th>Provided {configState.excludeSynAppDoor && <small>(Excl. SynApp)</small>}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Users</td>
                  <td>{configState.systemUsers}</td>
                  <td>{configState.systemUsers > 0 ? 'Licensing Added' : '-'}</td>
                </tr>
                <tr>
                  <td>Doors</td>
                  <td>{configState.doors}</td>
                  <td style={{ color: totalProvidedDoors < configState.doors ? '#dc3545' : '#28a745', fontWeight: totalProvidedDoors < configState.doors ? 'bold' : 'normal' }}>
                    {totalProvidedDoors}
                  </td>
                </tr>
                {configState.protocol === 'Wiegand' ? (
                  <>
                    <tr>
                      <td>Wiegand Readers (In)</td>
                      <td>{configState.readersIn}</td>
                      <td style={{ color: totalProvidedReaders < configState.readersIn ? '#dc3545' : '#28a745', fontWeight: totalProvidedReaders < configState.readersIn ? 'bold' : 'normal' }}>
                        {totalProvidedReaders}
                      </td>
                    </tr>
                    {configState.readersOut > 0 && (
                      <tr>
                        <td>Wiegand Readers (Out)</td>
                        <td>{configState.readersOut}</td>
                        <td style={{ color: totalProvidedReaders < totalReqReaders ? '#dc3545' : '#28a745', fontWeight: totalProvidedReaders < totalReqReaders ? 'bold' : 'normal' }}>
                          {totalProvidedReaders} <small>(Pairs)</small>
                        </td>
                      </tr>
                    )}
                  </>
                ) : configState.protocol === 'OSDP' ? (
                  <tr>
                    <td>OSDP Readers</td>
                    <td>{totalReqReaders}</td>
                    <td style={{ color: totalProvidedReaders < totalReqReaders ? '#dc3545' : '#28a745', fontWeight: totalProvidedReaders < totalReqReaders ? 'bold' : 'normal' }}>
                      {totalProvidedReaders}
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td>Readers</td>
                    <td>{totalReqReaders > 0 ? totalReqReaders : '-'}</td>
                    <td>-</td>
                  </tr>
                )}
                <tr>
                  <td>Inputs</td>
                  <td>{configState.reqInputs}</td>
                  <td style={{ color: totalProvidedInputs < configState.reqInputs ? '#dc3545' : '#28a745', fontWeight: totalProvidedInputs < configState.reqInputs ? 'bold' : 'normal' }}>
                    {totalProvidedInputs}
                  </td>
                </tr>
                <tr>
                  <td>Outputs</td>
                  <td>{configState.reqOutputs}</td>
                  <td style={{ color: totalProvidedOutputs < configState.reqOutputs ? '#dc3545' : '#28a745', fontWeight: totalProvidedOutputs < configState.reqOutputs ? 'bold' : 'normal' }}>
                    {totalProvidedOutputs}
                  </td>
                </tr>
              </tbody>
            </table>
            <h4>Calculated Hardware</h4>
            <ul className="controller-summary-list">
              {Object.entries(ctrls).filter(([_, qty]) => qty > 0).sort((a, b) => {
                if (a[0] === 'SynApp') return -1;
                if (b[0] === 'SynApp') return 1;
                if (a[0] === 'SynIO') return -1;
                if (b[0] === 'SynIO') return 1;
                return a[0].localeCompare(b[0]);
              }).map(([model, qty]) => (
                <li key={model}>{findControllerInfo(model)?.description || model}: <strong>{qty}</strong></li>
              ))}
              {Object.entries(ctrls).filter(([_, q]) => q > 0).length === 0 && (
                configState.protocol && configState.deployment && configState.commsType && (configState.doors > 0 || configState.reqInputs > 0 || configState.reqOutputs > 0) ?
                  <li>Calculating...</li> :
                  <li>(Complete configuration and requirements)</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="quote-preview-section panel">
        <h3>Quote Preview</h3>
        {productsLoading && <p>Loading product details...</p>}
        {!productsLoading && calculatedQuoteItems.length === 0 && (
          <p style={{ fontStyle: 'italic', color: '#6c757d' }}>
            Complete configuration and requirements above to generate quote items.
          </p>
        )}
        {!productsLoading && calculatedQuoteItems.length > 0 && (
          <table className="quote-preview-table">
            <thead>
              <tr>
                <th>Article No.</th>
                <th>Model</th>
                <th>Description</th>
                <th>Cost Type</th>
                <th>Qty</th>
                <th>MSRP (GBP)</th>
                <th>Line Total (GBP)</th>
              </tr>
            </thead>
            <tbody>
              {calculatedQuoteItems.map((item, index) => (
                <tr key={item.articleNumber || `${item.model}-${index}`}>
                  <td>{item.articleNumber}</td>
                  <td>{item.model}</td>
                  <td>{item.description}</td>
                  <td>{item.costType}</td>
                  <td style={{ textAlign: 'center' }}>{item.qty}</td>
                  <td>{(item.msrp ?? 0).toFixed(2)}</td>
                  <td>{((item.msrp ?? 0) * (1 - (item.discountStandard ?? 0) / 100) * (item.qty ?? 0)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="floating-save">
        <button
          onClick={handleSave}
          disabled={!configState.name || !configState.protocol || !configState.deployment || !configState.commsType || !configState.systemType || configState.systemUsers <= 0}
          title={!configState.name || !configState.protocol || !configState.deployment || !configState.commsType || !configState.systemType || configState.systemUsers <= 0 ? "Please complete all required fields" : "Save Quote"}
        >
          💾 Save Quote
        </button>
        <button onClick={() => navigate("/")}>Back</button>
      </div>
      {showSoftwareModal && (
        <SoftwareModal
          isCloud={configState.systemType === 'Cloud'}
          initialSelections={configState.softwareSelections}
          onSave={handleSoftwareSave}
          onClose={() => setShowSoftwareModal(false)}
        />
      )}
      {showControllerModal && (
        <ControllerSelectionModal
          initialSelections={ctrls}
          onSave={handleControllerSave}
          onClose={() => setShowControllerModal(false)}
        />
      )}
      {showConfigModal && (
        <ConfigModal
          initial={{
            protocol: configState.protocol,
            doorComms: configState.commsType,
            deployment: configState.deployment,
            targetDoorsPerController: configState.targetDoorsPerController,
            cloudMode: configState.systemType.toLowerCase(),
          }}
          onSave={handleConfigSave}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}