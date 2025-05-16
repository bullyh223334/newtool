import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuotes } from "../context/QuotesContext";

export default function QuoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotes, updateQuoteItem, addQuoteItem, deleteQuoteItem, getQuoteTotals } = useQuotes();

  const quote = quotes.find(q => q.id === id);
  const totals = getQuoteTotals(quote);

  if (!quote) {
    return <div>Quote not found</div>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <h2>Edit Quote: {quote.name}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead style={{ background: "#f5f5f5" }}>
          <tr>
            <th style={cellStyle}>Model</th>
            <th style={cellStyle}>Description</th>
            <th style={cellStyle}>MSRP</th>
            <th style={cellStyle}>Discount %</th>
            <th style={cellStyle}>Qty</th>
            <th style={cellStyle}>Cost Type</th>
            <th style={cellStyle}>Line Total</th>
            <th style={cellStyle}></th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item, index) => (
            <tr key={index}>
              {["model", "description", "msrp", "discount", "quantity"].map(field => (
                <td key={field} style={cellStyle}>
                  <input
                    value={item[field]}
                    onChange={e => updateQuoteItem(quote.id, index, field, e.target.value)}
                    style={inputStyle}
                  />
                </td>
              ))}
              <td style={cellStyle}>
                <select
                  value={item.costType}
                  onChange={e => updateQuoteItem(quote.id, index, "costType", e.target.value)}
                  style={inputStyle}
                >
                  <option value="one-off">One-Off</option>
                  <option value="monthly">Monthly</option>
                </select>
              </td>
              <td style={cellStyle}>{item.lineTotal.toFixed(2)}</td>
              <td style={cellStyle}>
                <button onClick={() => deleteQuoteItem(quote.id, index)} style={deleteBtn}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={() => addQuoteItem(quote.id)} style={addBtn}>➕ Add Line</button>

      <div style={{ marginTop: "2rem", fontSize: "1.1rem" }}>
        <p><strong>One-Off Total:</strong> £{totals.oneOff.toFixed(2)}</p>
        <p><strong>Monthly Total:</strong> £{totals.monthly.toFixed(2)}</p>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <button onClick={() => navigate("/")} style={saveBtn}>← Back to Dashboard</button>
      </div>
    </div>
  );
}

const cellStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "left"
};

const inputStyle = {
  width: "100%",
  padding: "6px",
  borderRadius: "4px",
  border: "1px solid #ccc"
};

const addBtn = {
  marginTop: "1rem",
  padding: "0.6rem 1.2rem",
  fontSize: "1rem",
  background: "#007aff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const saveBtn = {
  padding: "0.6rem 1.2rem",
  background: "#eee",
  border: "1px solid #ccc",
  borderRadius: "6px",
  cursor: "pointer"
};

const deleteBtn = {
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  cursor: "pointer"
};
