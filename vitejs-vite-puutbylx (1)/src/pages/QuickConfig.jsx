import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "../context/QuotesContext";
import { useProducts } from "../context/ProductsContext";
import { SOFTWARE } from "../softwareMatrix.js";
import "./QuickConfig.css";

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
const protocolOptions = ["Wiegand", "OSDP"];
const deploymentOptions = ["In", "In & out"];
const commsTypeOptions = ["IP", "RS-485", "Mixed (RS-485 & IP)"];
const systemTypeOptions = ["Cloud", "On-Prem"];
const defaultSelectOption = "- Select -";

const getInitialCtrlState = () => CONTROLLERS.reduce((acc, ctrl) => { acc[ctrl.model] = 0; return acc; }, {});
const findControllerInfo = (modelName) => CONTROLLERS.find(c => c.model === modelName);
const findSoftwareInfo = (key) => SOFTWARE_PARTS[key];

export default function QuickConfig() {
  const { addQuote, currentUser } = useQuotes() || {};
  const { products, loading: productsLoading } = useProducts() || {};
  const navigate = useNavigate();

  console.log("QuickConfig: QuotesContext:", { addQuote, currentUser });
  console.log("QuickConfig: ProductsContext:", { products, productsLoading });
  console.log("QuickConfig: SOFTWARE:", SOFTWARE);

  const [formData, setFormData] = useState({
    name: '',
    client: '',
    date: new Date().toISOString().slice(0, 10),
    projectType: 'Quick Config',
    notes: ''
  });
  const [doors, setDoors] = useState(0);
  const [readersIn, setReadersIn] = useState(0);
  const [readersOut, setReadersOut] = useState(0);
  const [reqInputs, setReqInputs] = useState(0);
  const [reqOutputs, setReqOutputs] = useState(0);
  const [protocol, setProtocol] = useState("");
  const [deployment, setDeployment] = useState("");
  const [commsType, setCommsType] = useState("");
  const [targetDoorsPerController, setTargetDoorsPerController] = useState("");
  const [excludeSynAppDoor, setExcludeSynAppDoor] = useState(false);
  const [systemType, setSystemType] = useState("");
  const [systemUsers, setSystemUsers] = useState(0);
  const [ctrls, setCtrls] = useState(getInitialCtrlState());
  const [availableDeployments, setAvailableDeployments] = useState(deploymentOptions);
  const [availableCommsTypes, setAvailableCommsTypes] = useState([]);
  const [availableTargetCapacities, setAvailableTargetCapacities] = useState([]);
  const [isOutReaderDisabled, setIsOutReaderDisabled] = useState(true);

  useEffect(() => { setReadersIn(doors); }, [doors]);
  useEffect(() => { if (readersOut > doors) { setReadersOut(doors); } }, [doors, readersOut]);
  useEffect(() => {
    let dp = ['In', 'In & out'];
    if (protocol === 'Wiegand' && commsType === 'IP') {
      dp = ['In'];
      if (deployment === 'In & out') setDeployment('In');
    }
    setAvailableDeployments(dp);
    if (protocol && !dp.includes(deployment)) setDeployment("");
  }, [protocol, commsType, deployment]);
  useEffect(() => {
    let co = [];
    let dis = true;
    if (protocol === 'Wiegand') {
      if (deployment === 'In') {
        co = ['IP', 'RS-485'];
        dis = true;
      } else if (deployment === 'In & out') {
        co = ['RS-485'];
        dis = false;
      }
    } else if (protocol === 'OSDP') {
      co = ['IP', 'RS-485', 'Mixed (RS-485 & IP)'];
      dis = (deployment === 'In');
    }
    setAvailableCommsTypes(co);
    setIsOutReaderDisabled(dis);
    if (!co.includes(commsType)) { setCommsType(""); }
    if (dis && readersOut > 0) { setReadersOut(0); }
    setTargetDoorsPerController("");
  }, [protocol, deployment, commsType, readersOut]);

  const availableControllerData = useMemo(() => {
    if (!protocol || !deployment || !commsType) return [];
    let mdls = [];
    let caps = {};
    if (protocol === 'Wiegand') {
      if (deployment === 'In') {
        if (commsType === 'IP') {
          mdls = ['SynApp', 'SynOne'];
          caps = {
            'SynApp': { doors: 1, readers: 1, wiegand: 1, requiresSynApp: true },
            'SynOne': { doors: 1, readers: 1, wiegand: 1, requiresSynApp: false }
          };
        } else if (commsType === 'RS-485') {
          mdls = ['SynApp', 'SynConSC'];
          caps = {
            'SynApp': { doors: 1, readers: 1, wiegand: 1, requiresSynApp: true },
            'SynConSC': { doors: 2, readers: 2, wiegand: 2, requiresSynApp: true }
          };
        }
      } else {
        if (commsType === 'RS-485') {
          mdls = ['SynApp', 'SynConSC'];
          caps = {
            'SynApp': { doors: 0, readers: 0, wiegand: 0, requiresSynApp: true },
            'SynConSC': { doors: 1, readers: 2, wiegand: 2, requiresSynApp: true }
          };
        }
      }
    } else if (protocol === 'OSDP') {
      if (commsType === 'IP') {
        mdls = ['SynApp', 'SynConEvo', 'SynOne'];
        caps = {
          'SynApp': { doors: 1, readers: 2, wiegand: 0, requiresSynApp: true },
          'SynConEvo': { doors: 8, readers: 16, wiegand: 0, requiresSynApp: true },
          'SynOne': { doors: 1, readers: 2, wiegand: 0, requiresSynApp: false }
        };
      } else if (commsType === 'RS-485') {
        mdls = ['SynApp', 'SynConSC', 'SynConDuoDuo', 'SynConEvo'];
        caps = {
          'SynApp': { doors: 1, readers: 2, wiegand: 0, requiresSynApp: true },
          'SynConSC': { doors: 2, readers: 4, wiegand: 0, requiresSynApp: true },
          'SynConDuoDuo': { doors: 4, readers: 8, wiegand: 0, requiresSynApp: true },
          'SynConEvo': { doors: 8, readers: 16, wiegand: 0, requiresSynApp: true }
        };
      } else if (commsType === 'Mixed (RS-485 & IP)') {
        mdls = ['SynApp', 'SynConSC', 'SynConDuoDuo', 'SynConEvo', 'SynOne'];
        caps = {
          'SynApp': { doors: 1, readers: 2, wiegand: 0, requiresSynApp: true },
          'SynConSC': { doors: 2, readers: 4, wiegand: 0, requiresSynApp: true },
          'SynConDuoDuo': { doors: 4, readers: 8, wiegand: 0, requiresSynApp: true },
          'SynConEvo': { doors: 8, readers: 16, wiegand: 0, requiresSynApp: true },
          'SynOne': { doors: 1, readers: 2, wiegand: 0, requiresSynApp: false }
        };
      }
    }
    return mdls.map(m => {
      const b = findControllerInfo(m);
      const e = caps[m] || {};
      const r = e.requiresSynApp !== false;
      return {
        model: m,
        description: b?.description || 'Unknown',
        effectiveDoors: e.doors ?? b?.baseDoors ?? 0,
        effectiveReaders: e.readers ?? b?.baseReaders ?? 0,
        effectiveWiegand: e.wiegand ?? b?.baseWiegand ?? 0,
        requiresSynAppInitially: r,
        quoteHardware: b?.quoteHardware,
        quoteSoftwarePrem: b?.quoteSoftwarePrem,
        quoteSoftwareCloud: b?.quoteSoftwareCloud
      };
    }).filter(c => !(protocol === 'Wiegand' && c.model === 'SynConEvo'));
  }, [protocol, deployment, commsType]);

  useEffect(() => {
    const uc = [...new Set(availableControllerData.filter(c => c.model !== 'SynApp' && c.model !== 'SynIO' && c.effectiveDoors > 0).map(c => c.effectiveDoors))].sort((a, b) => a - b);
    setAvailableTargetCapacities(uc);
    if (targetDoorsPerController && !uc.includes(parseInt(targetDoorsPerController))) {
      setTargetDoorsPerController("");
    }
  }, [availableControllerData, targetDoorsPerController]);

  const totalReqReaders = useMemo(() => readersIn + readersOut, [readersIn, readersOut]);
  const { totalProvidedDoors, totalProvidedReaders, totalProvidedWiegandPorts, maxWiegandInOnlySupport, maxWiegandInOutSupport, totalProvidedInputs, totalProvidedOutputs } = useMemo(() => {
    let d = 0, tR = 0, wR = 0, i = 0, o = 0;
    Object.entries(ctrls).forEach(([m, c]) => {
      if (c > 0) {
        const cd = availableControllerData.find(x => x.model === m);
        const bi = findControllerInfo(m);
        const isEx = m === 'SynApp' && excludeSynAppDoor;
        const drC = isEx ? 0 : (cd?.effectiveDoors ?? bi?.baseDoors ?? 0);
        let rdrC = 0;
        if (!isEx) {
          rdrC = (protocol === 'OSDP') ? (cd?.effectiveReaders ?? bi?.baseReaders ?? 0) : (cd?.effectiveWiegand ?? bi?.baseWiegand ?? 0);
        }
        const wC = isEx ? 0 : (cd?.effectiveWiegand ?? bi?.baseWiegand ?? 0);
        const iC = isEx ? 0 : (bi?.baseInputs ?? 0);
        const oC = isEx ? 0 : (bi?.baseOutputs ?? 0);
        d += c * drC;
        tR += c * rdrC;
        wR += c * wC;
        i += c * iC;
        o += c * oC;
      }
    });
    const ioS = wR;
    const ioOS = Math.floor(wR / 2);
    return {
      totalProvidedDoors: d,
      totalProvidedReaders: tR,
      totalProvidedWiegandPorts: wR,
      maxWiegandInOnlySupport: ioS,
      maxWiegandInOutSupport: ioOS,
      totalProvidedInputs: i,
      totalProvidedOutputs: o
    };
  }, [ctrls, availableControllerData, excludeSynAppDoor, protocol]);

  useEffect(() => {
    if (protocol && deployment && commsType && availableControllerData && doors >= 0 && readersIn >= 0 && readersOut >= 0 && reqInputs >= 0 && reqOutputs >= 0) {
      console.log("Running calculateControllers with:", { commsType, protocol, deployment, doors, readersIn, readersOut, targetDoorsPerController, reqInputs, reqOutputs });
      try {
        const calcCtrls = calculateControllers(commsType, protocol, deployment, doors, readersIn, readersOut, targetDoorsPerController, reqInputs, reqOutputs, availableControllerData, excludeSynAppDoor);
        setCtrls(calcCtrls);
      } catch (error) {
        console.error("Error during calculateControllers execution:", error);
      }
    } else {
      console.log("Skipping calculateControllers - incomplete.");
      setCtrls(getInitialCtrlState());
    }
  }, [protocol, commsType, deployment, doors, readersIn, readersOut, targetDoorsPerController, reqInputs, reqOutputs, availableControllerData, excludeSynAppDoor]);

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
        const productDetail = products.find(p => p.articleNumber === hardwareArticleNumber);
        items.push({
          articleNumber: hardwareArticleNumber,
          model: controllerInfo.quoteModelNameHW || modelKey,
          description: productDetail?.descriptionEN || controllerInfo?.description || 'Unknown Hardware',
          method: productDetail?.method || 'Upfront',
          msrpGBP: productDetail?.msrpGBP ?? 0,
          msrp: productDetail?.msrpGBP ?? 0,
          discountStandard: productDetail?.discountStandard ?? 0,
          qty: qty,
          costType: productDetail?.type?.toLowerCase().includes('recurring') || productDetail?.method?.toLowerCase().includes('recurring') ? 'Monthly' : 'One-Off',
          smc: productDetail?.smc ?? 0,
        });
      }
    });
    if (systemType && SOFTWARE && Array.isArray(SOFTWARE)) {
      const platformArticleNumber = systemType === 'Cloud' ? basePlatformArticleCloud : basePlatformArticlePrem;
      const platformProductDetail = products.find(p => p.articleNumber === platformArticleNumber);
      const platformBaseInfoKey = systemType === 'Cloud' ? "H-Synguard-Platform" : "Synguard-Platform";
      const platformBaseInfo = findSoftwareInfo(platformBaseInfoKey);
      items.push({
        articleNumber: platformArticleNumber,
        model: platformBaseInfo?.quoteModelName || 'Platform',
        description: platformProductDetail?.descriptionEN || platformBaseInfo?.description || 'Unknown Software',
        method: platformProductDetail?.method || (systemType === 'Cloud' ? 'Recurring' : 'Upfront'),
        msrpGBP: platformProductDetail?.msrpGBP ?? 0,
        msrp: platformProductDetail?.msrpGBP ?? 0,
        discountStandard: platformProductDetail?.discountStandard ?? 0,
        qty: 1,
        costType: platformProductDetail?.type?.toLowerCase().includes('recurring') || productDetail?.method?.toLowerCase().includes('recurring') ? 'Monthly' : 'One-Off',
        smc: platformProductDetail?.smc ?? 0,
      });
      if (systemUsers > 0) {
        const userSwArticleNumber = systemType === 'Cloud' ? baseUserArticleCloud : baseUserArticlePrem;
        const userSoftwareProductDetail = products.find(p => p.articleNumber === userSwArticleNumber);
        const userSoftwareBaseInfoKey = systemType === 'Cloud' ? "H-Synguard" : "Synguard";
        const userSoftwareBaseInfo = findSoftwareInfo(userSoftwareBaseInfoKey);
        items.push({
          articleNumber: userSwArticleNumber,
          model: userSoftwareBaseInfo?.quoteModelName || 'User License',
          description: userSoftwareProductDetail?.descriptionEN || `${userSoftwareBaseInfo?.description || 'User License'} (${systemType})` || 'Unknown Software',
          method: userSoftwareProductDetail?.method || (systemType === 'Cloud' ? 'Recurring' : 'Upfront'),
          msrpGBP: userSoftwareProductDetail?.msrpGBP ?? 0,
          msrp: userSoftwareProductDetail?.msrpGBP ?? 0,
          discountStandard: userSoftwareProductDetail?.discountStandard ?? 0,
          qty: systemUsers,
          costType: userSoftwareProductDetail?.type?.toLowerCase().includes('recurring') || productDetail?.method?.toLowerCase().includes('recurring') ? 'Monthly' : 'One-Off',
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
  }, [ctrls, systemType, systemUsers, excludeSynAppDoor, products, productsLoading]);

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
      if (tech === 'Wiegand' && deploy === 'In & out' && selectedControllerModel === 'SynConSC') {
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

  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
    if (!formData.name.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!protocol || !deployment || !commsType) {
      alert("Please complete all System Configuration selections.");
      return;
    }
    if (!systemType) {
      alert("Please select a System Type.");
      return;
    }
    if (systemUsers <= 0) {
      alert("Please enter the number of System Users (> 0).");
      return;
    }
    if (doors <= 0 && reqInputs <= 0 && reqOutputs <= 0 && Object.values(ctrls).every(qty => qty === 0)) {
      alert("Please specify requirements (Doors, Inputs, Outputs) or System Users (> 0).");
      return;
    }
    if (calculatedQuoteItems.length === 0 && (doors > 0 || reqInputs > 0 || reqOutputs > 0 || systemUsers > 0)) {
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
      method: item.method || 'one-off',
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
      name: formData.name.trim(),
      created: new Date().toISOString(),
      status: "Quick Config",
      company: currentUser?.company || "N/A",
      items: finalItems,
      systemDetails: {
        protocol,
        deployment,
        commsType,
        targetDoorsPerController: targetDoorsPerController || "Default",
        doors,
        readersIn,
        readersOut,
        reqInputs,
        reqOutputs,
        excludeSynAppDoor,
        systemType,
        systemUsers
      },
      projectType: systemType,
      totalOneOff: calculateTotalForType(finalItems, 'One-Off'),
      totalMonthly: calculateTotalForType(finalItems, 'Monthly'),
      smcCost: systemType === 'On-Prem' ? smcCostValue.toFixed(2) : '0.00',
      currency: 'GBP',
      approvalStatus: "Pending",
      client: formData.client,
      date: formData.date,
      notes: formData.notes,
    };

    try {
      if (typeof addQuote === 'function') {
        addQuote(quoteObject);
        alert(`Quote "${quoteObject.name}" saved successfully!`);
        navigate("/");
      } else {
        console.error("Error: addQuote is not a function.");
        alert("Error: Could not save quote (addQuote not available).");
      }
    } catch (error) {
      console.error("Error saving quote via addQuote:", error);
      alert(`Failed to save quote. Error: ${error.message}`);
    }
  }

  const handleNumberChange = (setter) => (e) => {
    setter(Math.max(0, parseInt(e.target.value, 10) || 0));
  };

  return (
    <div className="quick-config-page">
      <div className="header-bar"><div className="header-title">Synguard Quick Config</div></div>
      <div style={{ display: 'flex', gap: '20px', padding: '0 20px', flexWrap: 'wrap' }}>
        <div className="inputs-panel panel" style={{ flex: '1 1 400px', minWidth: '350px' }}>
          <h3>Project & Configuration</h3>
          <label>
            Project Name <span style={{ color: 'red' }}>*</span>
            <input
              name="name"
              value={formData.name}
              onChange={handleFormDataChange}
              placeholder="Enter project name..."
              required
            />
          </label>
          <div className="config-box">
            <h4>System Configuration</h4>
            <label>
              1. Reader Protocol <span style={{ color: 'red' }}>*</span>
              <select value={protocol} onChange={e => setProtocol(e.target.value)} required>
                <option value="" disabled>{defaultSelectOption}</option>
                {protocolOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label>
              2. Reader Deployment <span style={{ color: 'red' }}>*</span>
              <select value={deployment} onChange={e => setDeployment(e.target.value)} disabled={!protocol} required>
                <option value="" disabled>{defaultSelectOption}</option>
                {availableDeployments.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label>
              3. Comms Type <span style={{ color: 'red' }}>*</span>
              <select value={commsType} onChange={e => setCommsType(e.target.value)} disabled={!protocol || !deployment} required>
                <option value="" disabled>{defaultSelectOption}</option>
                {availableCommsTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label>
              4. Target Doors per Controller <small>(Optional)</small>
              <select value={targetDoorsPerController} onChange={e => setTargetDoorsPerController(e.target.value)} disabled={!commsType || availableTargetCapacities.length === 0}>
                <option value="">Default (Highest Capacity)</option>
                {availableTargetCapacities.map(cap => <option key={cap} value={cap}>{cap} Doors</option>)}
              </select>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={excludeSynAppDoor} onChange={(e) => setExcludeSynAppDoor(e.target.checked)} />
              Exclude SynApp Built-in Door/Resources
            </label>
          </div>
          <div className="config-box">
            <h4>Requirements</h4>
            <label>
              System Type <span style={{ color: 'red' }}>*</span>
              <select value={systemType} onChange={e => setSystemType(e.target.value)} required>
                <option value="" disabled>{defaultSelectOption}</option>
                {systemTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label>
              System Users <span style={{ color: 'red' }}>*</span>
              <input
                type="number"
                min="1"
                value={systemUsers}
                onChange={handleNumberChange(setSystemUsers)}
                placeholder="Enter number of users (min 1)"
                required
              />
            </label>
            <hr style={{ margin: '15px 0' }} />
            <label>
              Doors
              <input type="number" min="0" value={doors} onChange={handleNumberChange(setDoors)} />
            </label>
            <label>
              In Readers <small>(Equals Doors)</small>
              <input type="number" min="0" value={readersIn} readOnly className="readonly-input" />
            </label>
            <label>
              Out Readers <small>(No. of Doors needing Out)</small>
              <input
                type="number"
                min="0"
                max={doors}
                value={readersOut}
                onChange={handleNumberChange(setReadersOut)}
                disabled={isOutReaderDisabled}
                style={{ backgroundColor: isOutReaderDisabled ? '#e9ecef' : 'white', cursor: isOutReaderDisabled ? 'not-allowed' : 'text' }}
                title={isOutReaderDisabled ? "Out readers disabled for this configuration" : "Enter number of out readers"}
              />
            </label>
            <label>
              Additional Inputs <small>(Beyond door sensors/REX)</small>
              <input type="number" min="0" value={reqInputs} onChange={handleNumberChange(setReqInputs)} />
            </label>
            <label>
              Additional Outputs <small>(Beyond lock relays)</small>
              <input type="number" min="0" value={reqOutputs} onChange={handleNumberChange(setReqOutputs)} />
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: '1 1 400px', minWidth: '350px' }}>
          <div className="overview-panel panel" style={{ flex: '1' }}>
            <h3>System Overview</h3>
            {protocol && deployment && commsType && systemType ? (
              <p className="config-summary">
                <strong>Config:</strong> {systemType} | {protocol} | {deployment} | {commsType}
                {targetDoorsPerController && ` | Target: ${targetDoorsPerController} Doors`}
                {excludeSynAppDoor && " | Excl. SynApp"}
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
                  <th>Provided {excludeSynAppDoor && <small>(Excl. SynApp)</small>}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Users</td>
                  <td>{systemUsers}</td>
                  <td>{systemUsers > 0 ? 'Licensing Added' : '-'}</td>
                </tr>
                <tr>
                  <td>Doors</td>
                  <td>{doors}</td>
                  <td style={{ color: totalProvidedDoors < doors ? '#dc3545' : '#28a745', fontWeight: totalProvidedDoors < doors ? 'bold' : 'normal' }}>
                    {totalProvidedDoors}
                  </td>
                </tr>
                {protocol === 'Wiegand' ? (
                  <>
                    <tr>
                      <td>Wiegand Readers (In)</td>
                      <td>{readersIn}</td>
                      <td style={{ color: maxWiegandInOnlySupport < readersIn ? '#dc3545' : '#28a745', fontWeight: maxWiegandInOnlySupport < readersIn ? 'bold' : 'normal' }}>
                        {maxWiegandInOnlySupport}
                      </td>
                    </tr>
                    {readersOut > 0 && (
                      <tr>
                        <td>Wiegand Readers (Out)</td>
                        <td>{readersOut}</td>
                        <td style={{ color: maxWiegandInOutSupport < readersOut ? '#dc3545' : '#28a745', fontWeight: maxWiegandInOutSupport < readersOut ? 'bold' : 'normal' }}>
                          {maxWiegandInOutSupport} <small>(Pairs)</small>
                        </td>
                      </tr>
                    )}
                  </>
                ) : protocol === 'OSDP' ? (
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
                  <td>{reqInputs}</td>
                  <td style={{ color: totalProvidedInputs < reqInputs ? '#dc3545' : '#28a745', fontWeight: totalProvidedInputs < reqInputs ? 'bold' : 'normal' }}>
                    {totalProvidedInputs}
                  </td>
                </tr>
                <tr>
                  <td>Outputs</td>
                  <td>{reqOutputs}</td>
                  <td style={{ color: totalProvidedOutputs < reqOutputs ? '#dc3545' : '#28a745', fontWeight: totalProvidedOutputs < reqOutputs ? 'bold' : 'normal' }}>
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
                protocol && deployment && commsType && (doors > 0 || reqInputs > 0 || reqOutputs > 0) ?
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
          disabled={!formData.name || !protocol || !deployment || !commsType || !systemType || systemUsers <= 0}
          title={!formData.name || !protocol || !deployment || !commsType || !systemType || systemUsers <= 0 ? "Please complete all required fields" : "Save Quote"}
        >
          💾 Save Quote
        </button>
      </div>
    </div>
  );
}