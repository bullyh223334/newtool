import React, { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import UploadModal from "../components/UploadModal";
import * as XLSX from "xlsx";
import "../pages/ProductManager.css";

const TABLE_TYPES = ["Controllers", "Software", "Pricing"];

export default function Tables() {
  const { products } = useProducts();
  const [tableType, setTableType] = useState("Controllers");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [fileSelected, setFileSelected] = useState(false);

  const controllerData = [
    { model: "SynApp", doors: 1, readers: 2, inputs: 3, outputs: 2, supportsWiegand: true },
    { model: "SynOne", doors: 1, readers: 2, inputs: 3, outputs: 2, supportsWiegand: true },
    // Add more
  ];

  const softwareData = [
    { type: "Basic Access Control", partCodeOnPrem: "SW-AC-ONPREM", partCodeCloud: "SW-AC-CLOUD" },
    // Add more
  ];

  const pricingData = products; // Reuse products for pricing

  const getTableData = () => {
    switch (tableType) {
      case "Controllers":
        return controllerData;
      case "Software":
        return softwareData;
      case "Pricing":
        return pricingData;
      default:
        return [];
    }
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setPreviewData(rawData);
      setFileSelected(true);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    // Update table data (e.g., save to context or local storage)
    setFileSelected(false);
    setPreviewData([]);
  };

  const filteredData = getTableData().filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="product-manager-page">
      <h2>Table Management</h2>
      <select value={tableType} onChange={(e) => setTableType(e.target.value)}>
        {TABLE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button onClick={() => setShowUpload(true)}>📤 Upload Table Data</button>
      <input
        placeholder="Search table..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {fileSelected && previewData.length > 0 && (
        <button onClick={handleImport}>✅ Import {previewData.length} Rows</button>
      )}
      <table className="product-table">
        <thead>
          <tr>
            {tableType === "Controllers" && (
              <>
                <th>Model</th>
                <th>Doors</th>
                <th>Readers</th>
                <th>Inputs</th>
                <th>Outputs</th>
                <th>Supports Wiegand</th>
              </>
            )}
            {tableType === "Software" && (
              <>
                <th>Type</th>
                <th>Part Code (On-Prem)</th>
                <th>Part Code (Cloud)</th>
              </>
            )}
            {tableType === "Pricing" && (
              <>
                <th>Article Number</th>
                <th>Model</th>
                <th>Description</th>
                <th>MSRP (£)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, i) => (
            <tr key={i}>
              {tableType === "Controllers" && (
                <>
                  <td>{item.model}</td>
                  <td>{item.doors}</td>
                  <td>{item.readers}</td>
                  <td>{item.inputs}</td>
                  <td>{item.outputs}</td>
                  <td>{item.supportsWiegand ? "Yes" : "No"}</td>
                </>
              )}
              {tableType === "Software" && (
                <>
                  <td>{item.type}</td>
                  <td>{item.partCodeOnPrem}</td>
                  <td>{item.partCodeCloud}</td>
                </>
              )}
              {tableType === "Pricing" && (
                <>
                  <td>{item.articleNumber}</td>
                  <td>{item.model}</td>
                  <td>{item.descriptionEN}</td>
                  <td>{item.msrpGBP?.toFixed(2)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {showUpload && (
        <UploadModal
          onFileUpload={(file) => {
            parseExcel(file);
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}