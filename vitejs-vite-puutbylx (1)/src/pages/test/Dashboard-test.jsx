import React, { useState } from "react";
import { useQuotes } from "../context/QuotesContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const { quotes, currentUser, companies, products } = useQuotes();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const isPartner = currentUser?.userType === "Partner";
  const visibleQuotes = quotes
    .filter((q) => (isPartner ? q.company === currentUser.company : true))
    .filter((q) => q.name.toLowerCase().includes(search.toLowerCase()));

  const getCompanyByName = (companyName) =>
    companies.find((c) => c.name === companyName);

  const getProductById = (id) => products.find((p) => p.id === id || p.product === id);

  const getTotals = (items, companyName) => {
    let oneOff = 0;
    let monthly = 0;
    const company = getCompanyByName(companyName);
    const profile = company?.priceProfile || "Standard";

    items.forEach((item) => {
      const baseProduct = getProductById(item.model);
      const msrp = item.msrp || baseProduct?.msrpGBP || 0;
      const discount = item.discountPercent ?? baseProduct?.[`discount${profile}`] ?? 0;
      const price = msrp * (1 - discount / 100);
      const qty = Number(item.qty) || 0;

      if (item.costType === "monthly") {
        monthly += price * qty;
      } else {
        oneOff += price * qty;
      }
    });

    return { oneOff, monthly };
  };

  const updateStatus = (index, newStatus) => {
    quotes[index].status = newStatus;
  };

  return (
    <div className="dashboard-page">
      <div className="header-bar">
        <div className="header-left">
          <img src="/src/assets/synguard-logo.png" alt="Synguard Logo" className="synguard-logo" />
          <div className="header-sub"></div>
        </div>
        <div className="header-center-title">Synguard Dashboard</div>
        <div className="dashboard-buttons">
          <button className="new-quote-btn" onClick={() => navigate("/new")}>+ New Quote</button>
          <button className="quick-quote-btn" onClick={() => navigate("/quick")}>⚡ Quick Quote</button>
          <button className="product-manager-btn" onClick={() => navigate("/products")}>🛠 Manage Products</button>
          <button className="user-btn" onClick={() => navigate("/users")}>👤 User Management</button>
        </div>
      </div>

      <div className="filter-row">
        <input
          type="text"
          placeholder="Search by quote name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="quote-table">
        <thead>
          <tr>
            <th>Quote Name</th>
            <th>Created</th>
            <th>One-Off Total</th>
            <th>Monthly Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleQuotes.map((quote, index) => {
            const totals = getTotals(quote.items || [], quote.company);
            return (
              <tr key={index}>
                <td>{quote.name}</td>
                <td>{new Date(quote.created).toLocaleDateString()}</td>
                <td>£{totals.oneOff.toFixed(2)}</td>
                <td>£{totals.monthly.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${quote.status === "Pending Price Review" ? "pending" : "normal"}`}>
                    {quote.status}
                  </span>
                </td>
                <td>
                  <button onClick={() => navigate(`/edit/${quote.id}`)}>Edit</button>
                  <button
                    onClick={() => {
                      updateStatus(index, "Pending Price Review");
                      alert("Request sent for price review.");
                    }}
                  >
                    Request Discount
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
