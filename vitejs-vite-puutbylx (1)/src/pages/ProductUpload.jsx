// src/pages/ProductUpload.jsx
import React, { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { useProducts } from "../context/ProductsContext";
import "./ProductUpload.css";

const headerMapping = {
  "ID": "id",
  "Article Number": "articleNumber",
  "Type": "type",
  "Method": "method",
  "Product": "product",
  "Description EN": "descriptionEN",
  "MSRP (€)": "msrpEUR",
  "MSRP (£)": "msrpGBP",
  "Discount (%)": "discountStandard",
  "Volume Discount": "volumeDiscount",
  "SMC (%)": "smc"
};

export default function ProductUpload() {
  const { setProducts } = useProducts();
  const [transformedData, setTransformedData] = useState([]);
  const [error, setError] = useState("");
  const [importSuccess, setImportSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const processData = useCallback((rawData) => {
    try {
      const transformed = rawData.map(row => {
        let obj = {};
        Object.keys(headerMapping).forEach(header => {
          obj[headerMapping[header]] = row[header] || "";
        });
        obj.msrpEUR = parseFloat(obj.msrpEUR) || 0;
        obj.msrpGBP = parseFloat(obj.msrpGBP) || 0;
        obj.discountStandard = parseFloat(obj.discountStandard) || 0;
        obj.smc = parseFloat(obj.smc) || 0;
        return obj;
      });
      setTransformedData(transformed);
      setError("");
    } catch (err) {
      setError("Error transforming data: " + err.message);
    }
  }, []);

  const readExcel = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      processData(data);
    };
    reader.onerror = () => setError("Error reading file.");
    reader.readAsBinaryString(file);
  }, [processData]);

  const handleFileSelect = (file) => {
    if (file) {
      readExcel(file);
      setImportSuccess(false);
    }
  };

  const handleImport = () => {
    if (transformedData.length > 0) {
      setProducts(transformedData);
      setImportSuccess(true);
      setError("");
    } else {
      setError("No valid data to import.");
    }
  };

  return (
    <div className="product-upload-page">
      <h2>Product Upload</h2>

      <div
        className={`drop-zone ${dragOver ? "drag-over" : ""}`}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          handleFileSelect(file);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
      >
        {dragOver ? "Release to upload" : "Drag & drop file here or click to select"}
        <input
          type="file"
          accept=".xlsx, .xls"
          style={{ display: "none" }}
          onChange={(e) => handleFileSelect(e.target.files[0])}
        />
      </div>

      {transformedData.length > 0 && (
        <button onClick={handleImport}>
          Import {transformedData.length} Products
        </button>
      )}

      {importSuccess && <p className="success-message">✅ Products imported successfully!</p>}
      {error && <p className="error-message">⚠️ {error}</p>}
    </div>
  );
}
