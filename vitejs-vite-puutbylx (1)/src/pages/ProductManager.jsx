// src/pages/ProductManager.jsx
import React, { useState, useCallback } from "react";
import { useProducts } from "../context/ProductsContext";
import UploadModal from "../components/UploadModal";
import * as XLSX from "xlsx";
import "./ProductManager.css";

export default function ProductManager() {
  const { products, setProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [fileSelected, setFileSelected] = useState(false);

  const parseExcel = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

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

      const transformedData = rawData.map(row => {
        let obj = {};
        for (let header in headerMapping) {
          obj[headerMapping[header]] = row[header] || "";
        }
        obj.msrpEUR = parseFloat(obj.msrpEUR) || 0;
        obj.msrpGBP = parseFloat(obj.msrpGBP) || 0;
        obj.discountStandard = parseFloat(obj.discountStandard) || 0;
        obj.smc = parseFloat(obj.smc) || 0;
        return obj;
      });

      setPreviewData(transformedData);
      setFileSelected(true);
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleImport = () => {
    setProducts(previewData);
    setFileSelected(false);
    setPreviewData([]);
  };

  const filteredProducts = products.filter(product =>
    Object.values(product).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="product-manager-page">
      <h2>Product Management</h2>
      <button onClick={() => setShowUpload(true)}>📤 Upload Products</button>

      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {fileSelected && previewData.length > 0 && (
        <button onClick={handleImport}>
          ✅ Import {previewData.length} Products
        </button>
      )}

      <table className="product-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Article Number</th>
            <th>Type</th>
            <th>Method</th>
            <th>Product</th>
            <th>Description</th>
            <th>MSRP (€)</th>
            <th>MSRP (£)</th>
            <th>Discount %</th>
            <th>Volume Discount</th>
            <th>SMC %</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((p, i) => (
            <tr key={i}>
              <td>{p.id}</td>
              <td>{p.articleNumber}</td>
              <td>{p.type}</td>
              <td>{p.method}</td>
              <td>{p.product}</td>
              <td>{p.descriptionEN}</td>
              <td>{p.msrpEUR.toFixed(2)}</td>
              <td>{p.msrpGBP.toFixed(2)}</td>
              <td>{p.discountStandard}%</td>
              <td>{p.volumeDiscount}</td>
              <td>{p.smc}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showUpload && (
        <UploadModal
          onFileUpload={(file) => {
            parseExcel(file);  // Loads preview data
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
}
