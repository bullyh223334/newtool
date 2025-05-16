import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "../context/QuotesContext";
import ConfigModal from "./ConfigModal";
import NewQuoteModal from "./NewQuoteModal";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { quotes } = useQuotes();
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
  const [quickQuoteConfig, setQuickQuoteConfig] = useState(null);

  const handleQuickQuote = (config) => {
    navigate("/quick/requirements", { state: { ...quickQuoteConfig, ...config } });
    setShowQuickModal(false);
    setQuickQuoteConfig(null);
  };

  const handleNewQuote = (action, config) => {
    if (action === "manual") {
      navigate(`/edit/${config.id}`, { state: config });
    } else if (action === "system") {
      setQuickQuoteConfig(config);
      setShowQuickModal(true);
    }
    setShowNewQuoteModal(false);
  };

  // Sample sales contacts data (replace with actual data source if available)
  const salesContacts = [
    { id: 1, name: "John Smith", email: "john.smith@synguard.com", phone: "+44 20 1234 5678", region: "UK" },
    { id: 2, name: "Emma Johnson", email: "emma.johnson@synguard.com", phone: "+1 555 987 6543", region: "US" },
    { id: 3, name: "Liam Brown", email: "liam.brown@synguard.com", phone: "+33 1 2345 6789", region: "EU" },
  ];

  return (
    <div className="dashboard-page">
      <h1>Synguard Quote Tool Dashboard</h1>
      <div className="actions">
        <button
          className="quick-quote-btn"
          onClick={() => setShowQuickModal(true)}
          title="Quick Quote"
        >
          ⚡
        </button>
        <button className="action-btn" onClick={() => setShowNewQuoteModal(true)} title="New Quote">
          New Quote
        </button>
        <button className="action-btn" onClick={() => navigate("/products")} title="Product Manager">
          Products
        </button>
        <button className="action-btn" onClick={() => navigate("/users")} title="User Management">
          Users
        </button>
        <button className="action-btn" onClick={() => navigate("/advanced")} title="Advanced Config">
          Advanced Config
        </button>
      </div>
      <div className="dashboard-content">
        <section className="quotes-section">
          <h2>Existing Quotes</h2>
          {quotes.length === 0 ? (
            <p className="no-data">No quotes available. Create a new quote to get started.</p>
          ) : (
            <table className="quotes-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Client</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td>{quote.name}</td>
                    <td>{quote.client || "N/A"}</td>
                    <td>{new Date(quote.date).toLocaleDateString()}</td>
                    <td>{quote.status || "Pending"}</td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/edit/${quote.id}`)}
                        title={`Edit ${quote.name}`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section className="sales-contacts-section">
          <h2>Sales Contacts</h2>
          {salesContacts.length === 0 ? (
            <p className="no-data">No sales contacts available.</p>
          ) : (
            <table className="contacts-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {salesContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>{contact.name}</td>
                    <td>
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </td>
                    <td>{contact.phone}</td>
                    <td>{contact.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
      {showQuickModal && (
        <ConfigModal
          initial={{ protocol: "", doorComms: "", deployment: "In Only", targetDoorsPerController: "", cloudMode: quickQuoteConfig?.systemType?.toLowerCase() || "" }}
          onSave={handleQuickQuote}
          onClose={() => {
            setShowQuickModal(false);
            setQuickQuoteConfig(null);
          }}
        />
      )}
      {showNewQuoteModal && (
        <NewQuoteModal
          onAction={handleNewQuote}
          onClose={() => setShowNewQuoteModal(false)}
        />
      )}
    </div>
  );
}