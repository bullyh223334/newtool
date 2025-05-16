import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useQuotes } from "../context/QuotesContext";
import "./ProductUpload.css";

export default function ProductManager() {
  const { products, setProducts } = useQuotes();
  const [preview, setPreview] = useState([]);
  const [fileName, setFileName] = useState("");
  const [search, setSearch] = useState("");

  const expectedHeaders = [
    "ID",
    "Article Number",
    "Type",
    "Method",
    "Product",
    "Description NL",
    "Description EN",
    "Status",
    "MRSP (€)",
    "MRSP (£)",
    "Discount (%)",
    "Voume discount",
    "SMC (%)",
  ];

  const normalizeHeader = (header) =>
    header
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[€]/g, "euro")
      .replace(/[£]/g, "gbp")
      .replace(/[^a-z0-9]/gi, "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) readExcel(file);
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary", cellDates: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      const raw = XLSX.utils.sheet_to_json(ws, { defval: "", header: 1 });
      const originalHeaders = raw[0];
      const cleanedHeaders = originalHeaders.map(normalizeHeader);

      const rows = raw.slice(1).map((r) =>
        originalHeaders.reduce((obj, h, i) => {
          obj[h] = r[i];
          return obj;
        }, {})
      );

      const missing = expectedHeaders.filter(
        (h) => !cleanedHeaders.includes(normalizeHeader(h))
      );
      if (missing.length > 0) {
        alert(`Missing headers: ${missing.join(", ")}`);
        return;
      }

      setPreview(rows);
      setFileName(file.name);
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = () => {
    if (preview.length === 0) return alert("No data to import.");
    setProducts(preview);
    alert("✅ Product list imported!");
    setPreview([]);
  };

  const filteredProducts = products.filter((product) =>
    Object.values(product)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const formatSMC = (value) => {
    if (!value) return "";
    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : Math.round(parsed * 100);
  };

  return (
    <div className="product-upload-page">
      <div className="upload-header">
        <h2>Product Manager</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        {fileName && <p className="file-name">📄 {fileName}</p>}
        {preview.length > 0 && (
          <button className="import-btn" onClick={handleImport}>
            ✅ Import Products
          </button>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search all columns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <h3>Current Products</h3>
      {filteredProducts.length > 0 ? (
        <div className="preview-table">
          <table>
            <thead>
              <tr>
                {expectedHeaders.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((row, i) => (
                <tr key={i}>
                  {expectedHeaders.map((key, j) => (
                    <td key={j}>
                      {key === "SMC (%)" ? formatSMC(row[key]) : row[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No products to display.</p>
      )}
    </div>
  );
}
