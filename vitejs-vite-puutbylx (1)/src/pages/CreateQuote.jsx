import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "../context/QuotesContext";

export default function CreateQuote() {
  const { addQuote } = useQuotes();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [items, setItems] = useState([
    { model: "", description: "", msrp: 0, discount: 0, qty: 1, costType: "one-off" },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === "qty" || field === "msrp" || field === "discount" ? parseFloat(value) || 0 : value;
    setItems(updated);
  };

  const saveQuote = () => {
    if (!name.trim()) {
      alert("Enter quote name");
      return;
    }
    addQuote({ name, status: "Normal", items });
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create New Quote</h2>
      <input
        type="text"
        placeholder="Quote name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "0.5rem", width: "300px", marginBottom: "1rem" }}
      />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Model</th>
            <th>Description</th>
            <th>MSRP</th>
            <th>Discount %</th>
            <th>Qty</th>
            <th>Cost Type</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td><input value={item.model} onChange={(e) => handleChange(i, "model", e.target.value)} /></td>
              <td><input value={item.description} onChange={(e) => handleChange(i, "description", e.target.value)} /></td>
              <td><input type="number" value={item.msrp} onChange={(e) => handleChange(i, "msrp", e.target.value)} /></td>
              <td><input type="number" value={item.discount} onChange={(e) => handleChange(i, "discount", e.target.value)} /></td>
              <td><input type="number" value={item.qty} onChange={(e) => handleChange(i, "qty", e.target.value)} /></td>
              <td>
                <select value={item.costType} onChange={(e) => handleChange(i, "costType", e.target.value)}>
                  <option value="one-off">One-Off</option>
                  <option value="monthly">Monthly</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveQuote} style={{ marginTop: "1rem" }}>💾 Save Quote</button>
    </div>
  );
}
