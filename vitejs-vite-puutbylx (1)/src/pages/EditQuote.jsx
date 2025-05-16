import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuotes } from "../context/QuotesContext";
import { useProducts } from "../context/ProductsContext";
import { v4 as uuid } from "uuid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./QuickConfig.css";

export default function EditQuote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotes, updateQuote, currentUser } = useQuotes();
  const { products, loading: productsLoading } = useProducts();
  const pdfRef = useRef();

  const [quoteName, setQuoteName] = useState("");
  const [client, setClient] = useState("");
  const [systemType, setSystemType] = useState("");
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [country, setCountry] = useState("UK");
  const [items, setItems] = useState([]);

  const systemTypeOptions = ["Cloud", "On-Prem"];
  const countryOptions = [
    "UK", "Ireland", "Belgium", "Italy", "Spain", "Netherlands", "Germany",
    "France", "Poland", "Finland", "Sweden", "Denmark", "UAE", "US"
  ];

  const currencyMap = {
    UK: "£", Ireland: "£", Belgium: "€", Italy: "€", Spain: "€", Netherlands: "€",
    Germany: "€", France: "€", Poland: "PLN", Finland: "€", Sweden: "SEK",
    Denmark: "DKK", UAE: "AED", US: "$"
  };
  const vatRateMap = {
    UK: 0.2, Ireland: 0.2, Belgium: 0.21, Italy: 0.22, Spain: 0.21, Netherlands: 0.21,
    Germany: 0.19, France: 0.2, Poland: 0.23, Finland: 0.24, Sweden: 0.25,
    Denmark: 0.25, UAE: 0.05, US: 0
  };
  const countryContactMap = {
    UK: { phone: "+44 1234 567890", website: "www.synguard.com", email: "info@synguard.com" },
    Ireland: { phone: "+353 1 234 5678", website: "www.synguard.ie", email: "info@synguard.ie" },
    Belgium: { phone: "+32 11 249292", website: "www.synguard.be", email: "info@synguard.be" },
    Italy: { phone: "+39 02 123 4567", website: "www.synguard.it", email: "info@synguard.it" },
    Spain: { phone: "+34 91 234 5678", website: "www.synguard.es", email: "info@synguard.es" },
    Netherlands: { phone: "+31 20 123 4567", website: "www.synguard.nl", email: "info@synguard.nl" },
    Germany: { phone: "+49 30 123 4567", website: "www.synguard.de", email: "info@synguard.de" },
    France: { phone: "+33 1 234 5678", website: "www.synguard.fr", email: "info@synguard.fr" },
    Poland: { phone: "+48 22 123 4567", website: "www.synguard.pl", email: "info@synguard.pl" },
    Finland: { phone: "+358 9 123 4567", website: "www.synguard.fi", email: "info@synguard.fi" },
    Sweden: { phone: "+46 8 123 4567", website: "www.synguard.se", email: "info@synguard.se" },
    Denmark: { phone: "+45 33 123 456", website: "www.synguard.dk", email: "info@synguard.dk" },
    UAE: { phone: "+971 4 123 4567", website: "www.synguard.ae", email: "info@synguard.ae" },
    US: { phone: "+1 800 123 4567", website: "www.synguard.us", email: "info@synguard.us" }
  };
  const currency = currencyMap[country] || "£";
  const vatRate = vatRateMap[country] || 0;
  const countryContacts = countryContactMap[country] || countryContactMap.UK;

  const originalQuote = useMemo(() => {
    return quotes.find((q) => String(q.id) === String(id));
  }, [quotes, id]);

  useEffect(() => {
    if (originalQuote) {
      console.log("EditQuote: Loading quote data:", JSON.stringify(originalQuote, null, 2));
      setQuoteName(originalQuote.name || "");
      setClient(originalQuote.client || "");
      setSystemType(originalQuote.systemType || originalQuote.projectType || "");
      setTotalDiscount(parseFloat(originalQuote.totalDiscount) || 0);
      setCountry(originalQuote.country || "UK");
      if (Array.isArray(originalQuote.items)) {
        const initialItems = originalQuote.items.map((item) => ({
          uniqueId: uuid(),
          product: item.model,
          qty: item.qty ?? 1,
          discountStandard: item.discountStandard ?? 0,
          descriptionEN: item.description,
          msrpGBP: item.msrpGBP ?? 0,
          smc: item.smc ?? 0,
        }));
        console.log("EditQuote: Initialized editable items state:", initialItems);
        setItems(initialItems);
      } else {
        console.warn(`Quote ${id} items is not an array.`);
        setItems([]);
      }
    } else {
      console.warn(`Quote with ID ${id} not found.`);
    }
  }, [originalQuote, id]);

  const handleAddRow = () => {
    setItems([...items, { uniqueId: uuid(), product: "", qty: 1, discountStandard: 0, smc: 0 }]);
  };

  const handleRemoveRow = (uniqueId) => {
    setItems(items.filter((item) => item.uniqueId !== uniqueId));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      const currentItem = { ...updatedItems[index] };

      if (field === "product") {
        const selectedProduct = products.find((p) => p.product === value);
        updatedItems[index] = {
          ...currentItem,
          product: value,
          msrpGBP: selectedProduct?.msrpGBP ?? 0,
          descriptionEN: selectedProduct?.descriptionEN ?? "",
          discountStandard: selectedProduct?.discountStandard ? parseFloat(selectedProduct.discountStandard) || 0 : 0,
          smc: selectedProduct?.smc ?? 0,
        };
      } else if (field === "qty") {
        updatedItems[index] = { ...currentItem, qty: parseInt(value, 10) || 1 };
      } else if (field === "discountStandard" || field === "smc") {
        updatedItems[index] = { ...currentItem, [field]: parseFloat(value) || 0 };
      }

      return updatedItems;
    });
  };

  const productOptions = useMemo(() => {
    return products
      .filter((p) => {
        if (systemType === "Cloud") return p.type !== "Onprem Software";
        if (systemType === "On-Prem") return p.type !== "Cloud Software";
        return true;
      })
      .map((p) => p.product);
  }, [products, systemType]);

  const matchedProduct = useCallback(
    (productName) => products.find((p) => p.product === productName),
    [products]
  );

  const isRecurringProduct = (product) => {
    if (!product || !product.type) return false;
    const typeLower = product.type.toLowerCase();
    return (
      typeLower.includes("recurring") ||
      typeLower.includes("monthly") ||
      typeLower.includes("cloud") ||
      typeLower.includes("subscription")
    );
  };

  const calculateTotalForType = (items, type) => {
    if (!Array.isArray(items)) {
      console.error("calculateTotalForType received non-array:", items);
      return "0.00";
    }
    const total = items
      .reduce((sum, item) => {
        if (item && item.costType === type) {
          const msrp = item.msrpGBP ?? 0;
          const discount = item.discountStandard ?? 0;
          const quantity = item.qty ?? 0;
          const lineTotal = msrp * (1 - discount / 100) * quantity;
          return sum + lineTotal;
        }
        return sum;
      }, 0);
    const discountedTotal = type === "One-Off" ? total * (1 - (totalDiscount / 100)) : total;
    return discountedTotal.toFixed(2);
  };

  const calculateSMCCost = (items) => {
    if (!Array.isArray(items)) {
      console.error("calculateSMCCost received non-array:", items);
      return "0.00";
    }
    const totalSmc = items
      .reduce((sum, item) => {
        const msrp = item.msrpGBP ?? 0;
        const discount = item.discountStandard ?? 0;
        const quantity = item.qty ?? 0;
        const smc = item.smc ?? 0;
        if (smc > 0) {
          const netPrice = msrp * (1 - discount / 100) * quantity;
          const smcValueForItem = netPrice * (smc / 100);
          return sum + smcValueForItem;
        }
        return sum;
      }, 0);
    return totalSmc.toFixed(2);
  };

  const quoteItems = items
    .map((item) => {
      const product = matchedProduct(item.product);
      if (!product) return null;
      return {
        articleNumber: product.articleNumber || "N/A",
        model: product.product,
        description: product.descriptionEN || "N/A",
        method: product.method || "Upfront",
        msrpGBP: product.msrpGBP ?? 0,
        msrp: product.msrpGBP ?? 0,
        discountStandard: item.discountStandard ?? 0,
        qty: item.qty ?? 1,
        costType: systemType === "On-Prem"
          ? "One-Off"
          : isRecurringProduct(product)
            ? "Monthly"
            : "One-Off",
        smc: systemType === "On-Prem" ? (item.smc ?? 0) : 0,
      };
    })
    .filter(Boolean);

  const generatePDF = async () => {
    const quoteNumber = `SGD-${originalQuote.id}`;
    const quoteDate = new Date(originalQuote.created).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/');
    const expirationDate = new Date(new Date(originalQuote.created).setMonth(new Date(originalQuote.created).getMonth() + 1)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/');
    const netTotal = parseFloat(calculateTotalForType(quoteItems, "One-Off")) + parseFloat(calculateTotalForType(quoteItems, "Monthly")) + parseFloat(calculateSMCCost(quoteItems));
    const taxes = (netTotal * vatRate).toFixed(2);
    const total = (netTotal + parseFloat(taxes)).toFixed(2);
    const smcTotal = calculateSMCCost(quoteItems);
    const monthlyTotal = calculateTotalForType(quoteItems, "Monthly");
    const systemDetails = originalQuote.systemDetails || {};
    const systemSummary = [
      { label: "Protocol", value: systemDetails.protocol },
      { label: "Deployment", value: systemDetails.deployment },
      { label: "Communication Type", value: systemDetails.commsType },
      { label: "Target Doors per Controller", value: systemDetails.targetDoorsPerController },
      { label: "Doors", value: systemDetails.doors },
      { label: "Readers In", value: systemDetails.readersIn },
      { label: "Readers Out", value: systemDetails.readersOut },
      { label: "Required Inputs", value: systemDetails.reqInputs },
      { label: "Required Outputs", value: systemDetails.reqOutputs },
      { label: "Exclude SynApp Door", value: systemDetails.excludeSynAppDoor ? "Yes" : "No" },
      { label: "System Users", value: systemDetails.systemUsers }
    ].filter(item => item.value);

    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const pageHeight = 297;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - 20;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;
    }

    pdf.save(`quote-${quoteNumber}.pdf`);
  };

  const handleSaveQuote = () => {
    if (!quoteName.trim()) {
      alert("Please enter a quote name.");
      return;
    }
    if (!systemType) {
      alert("Please select a system type.");
      return;
    }
    if (items.length === 0) {
      alert("No items to save in the quote.");
      return;
    }
    if (quoteItems.length === 0) {
      alert("No valid items to save in the quote.");
      return;
    }

    const timestamp = new Date().toISOString();
    const updatedQuoteObject = {
      id: originalQuote.id,
      name: quoteName.trim(),
      created: originalQuote.created,
      status: "Quick Config",
      company: currentUser?.company || "N/A",
      systemType: systemType,
      items: quoteItems,
      systemDetails: {
        protocol: originalQuote.systemDetails?.protocol || "",
        deployment: originalQuote.systemDetails?.deployment || "",
        commsType: originalQuote.systemDetails?.commsType || "",
        targetDoorsPerController: originalQuote.systemDetails?.targetDoorsPerController || "",
        doors: originalQuote.systemDetails?.doors || 0,
        readersIn: originalQuote.systemDetails?.readersIn || 0,
        readersOut: originalQuote.systemDetails?.readersOut || 0,
        reqInputs: originalQuote.systemDetails?.reqInputs || 0,
        reqOutputs: originalQuote.systemDetails?.reqOutputs || 0,
        excludeSynAppDoor: originalQuote.systemDetails?.excludeSynAppDoor || false,
        systemType: systemType,
        systemUsers: originalQuote.systemDetails?.systemUsers || 0,
      },
      projectType: systemType,
      totalOneOff: calculateTotalForType(quoteItems, "One-Off"),
      totalMonthly: calculateTotalForType(quoteItems, "Monthly"),
      smcCost: calculateSMCCost(quoteItems),
      currency: currency,
      approvalStatus: "Pending",
      client: client || "",
      date: new Date().toISOString().slice(0, 10),
      notes: "",
      updated: timestamp,
      totalDiscount: totalDiscount.toFixed(2),
      country,
    };

    console.log("Updating quote:", JSON.stringify(updatedQuoteObject, null, 2));
    try {
      if (typeof updateQuote === "function") {
        updateQuote(updatedQuoteObject);
        console.log("updateQuote called from EditQuote");
        alert(`Quote "${updatedQuoteObject.name}" updated successfully!`);
        navigate("/");
      } else {
        console.error("Error: updateQuote is not a function.");
        alert("Error: Could not update quote (updateQuote not available).");
      }
    } catch (error) {
      console.error("Error saving quote via updateQuote:", error);
      alert(`Failed to update quote. Error: ${error.message}`);
    }
  };

  if (!originalQuote) {
    return <div>Quote not found.</div>;
  }

  return (
    <div className="quick-config-page">
      {/* Header */}
      <div className="header-bar">
        <div className="header-title">Edit Quote</div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: "flex", gap: "10px", padding: "0 20px", flexWrap: "wrap" }}>
        {/* Inputs Panel */}
        <div className="inputs-panel panel" style={{ flex: "1 1 400px", minWidth: "350px" }}>
          <h3 style={{ fontSize: "1.2em", marginBottom: "10px" }}>Quote Details</h3>
          <div className="config-box" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <label style={{ flex: "1 1 45%", fontSize: "0.9em" }}>
              Quote Name <span style={{ color: "red" }}>*</span>
              <input
                type="text"
                placeholder="Enter quote name"
                value={quoteName}
                onChange={(e) => setQuoteName(e.target.value)}
                required
                style={{ fontSize: "0.9em", padding: "5px" }}
              />
            </label>
            <label style={{ flex: "1 1 45%", fontSize: "0.9em" }}>
              System Type <span style={{ color: "red" }}>*</span>
              <select
                value={systemType}
                onChange={(e) => setSystemType(e.target.value)}
                required
                style={{ fontSize: "0.9em", padding: "5px" }}
              >
                <option value="" disabled>
                  Select System Type
                </option>
                {systemTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ flex: "1 1 45%", fontSize: "0.9em" }}>
              Client
              <input
                type="text"
                placeholder="Enter client name"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                style={{ fontSize: "0.9em", padding: "5px" }}
              />
            </label>
            <label style={{ flex: "1 1 45%", fontSize: "0.9em" }}>
              Country
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{ fontSize: "0.9em", padding: "5px" }}
              >
                {countryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

    {/* Quote Items Section  */}
<div className="quote-preview-section panel" style={{ margin: "20px" }}>
  <h3>Quote Items</h3>
  <button
    onClick={handleAddRow}
    style={{
      padding: "8px 12px",
      marginBottom: "15px",
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "0.9em"
    }}
  >
    ➕ Add Product
  </button>
  {productsLoading && <p>Loading product details...</p>}
  {items.length === 0 && (
    <p style={{ fontStyle: "italic", color: "#6c757d" }}>
      Add products to update your quote.
    </p>
  )}
  {items.length > 0 && (
    <>
      <table className="quote-preview-table">
        <thead>
          <tr>
            <th>Model</th>
            <th>Description</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Discount (%)</th>
            {systemType === "On-Prem" && <th>SMC (%)</th>}
            <th>MSRP ({currency})</th>
            <th>Line Total ({currency})</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const product = matchedProduct(item.product);
            const costType = systemType === "On-Prem"
              ? "One-Off"
              : isRecurringProduct(product)
                ? "Monthly"
                : "One-Off";
            const lineTotal = product
              ? (product.msrpGBP * (1 - item.discountStandard / 100) * item.qty).toFixed(2)
              : "0.00";

            return (
              <tr key={item.uniqueId}>
                <td>
                  <input
                    type="text"
                    list={`product-list-${index}`}
                    value={item.product}
                    onChange={(e) => handleItemChange(index, "product", e.target.value)}
                    disabled={productsLoading}
                    placeholder="Type or select product"
                    style={{ fontSize: "0.9em", padding: "5px", width: "100%" }}
                  />
                  <datalist id={`product-list-${index}`}>
                    {productOptions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </td>
                <td>{item.descriptionEN || "-"}</td>
                <td>{costType}</td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="number"
                    value={item.qty}
                    min="1"
                    style={{ width: "60px", textAlign: "center" }}
                    onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                  />
                </td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="number"
                    value={item.discountStandard}
                    min="0"
                    max="100"
                    step="0.01"
                    style={{ width: "60px", textAlign: "center" }}
                    onChange={(e) => handleItemChange(index, "discountStandard", e.target.value)}
                  />
                </td>
                {systemType === "On-Prem" && (
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="number"
                      value={item.smc}
                      min="0"
                      max="100"
                      step="0.01"
                      style={{ width: "60px", textAlign: "center" }}
                    />
                  </td>
                )}
                <td>{product?.msrpGBP?.toFixed(2) || "-"}</td>
                <td>{lineTotal}</td>
                <td style={{ textAlign: "center" }}>
                  <span
                    onClick={() => handleRemoveRow(item.uniqueId)}
                    style={{
                      color: "#d9534f",
                      fontSize: "1.2em",
                      cursor: "pointer",
                      display: "inline-block",
                      padding: "5px",
                      transition: "color 0.2s ease"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = "#c9302c"}
                    onMouseOut={(e) => e.currentTarget.style.color = "#d9534f"}
                    title="Delete"
                  >
                    ✖
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="panel" style={{ padding: "15px", marginTop: "20px", backgroundColor: "#f9fafc", border: "1px solid #e1e5ea", borderRadius: "5px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
        <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", color: "#495057" }}>
          Total Discount (%)
          <input
            type="number"
            value={totalDiscount}
            min="0"
            max="100"
            step="0.01"
            onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
            placeholder="Enter total discount percentage"
            style={{ width: "100px", marginLeft: "10px", padding: "5px", borderRadius: "4px", border: "1px solid #ced4da" }}
          />
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "1em", color: "#495057" }}>
          <div><strong style={{ fontWeight: "700" }}>Total One-Off Cost:</strong> {currency}{calculateTotalForType(quoteItems, "One-Off")}</div>
          {systemType === "Cloud" && (
            <div><strong style={{ fontWeight: "700" }}>Total Monthly Cost:</strong> {currency}{calculateTotalForType(quoteItems, "Monthly")}</div>
          )}
          {systemType === "On-Prem" && (
            <div><strong style={{ fontWeight: "700" }}>SMC Cost:</strong> {currency}{calculateSMCCost(quoteItems)}</div>
          )}
        </div>
      </div>
    </>
  )}
</div>

      {/* Hidden PDF Content */}
      <div ref={pdfRef} style={{ position: "absolute", left: "-9999px", width: "210mm", padding: "20px", backgroundColor: "#fff", fontFamily: "Arial, sans-serif", fontSize: "12pt" }}>
        {(() => {
          const quoteNumber = `SGD-${originalQuote.id}`;
          const quoteDate = new Date(originalQuote.created).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/');
          const expirationDate = new Date(new Date(originalQuote.created).setMonth(new Date(originalQuote.created).getMonth() + 1)).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('/');
          const netTotal = parseFloat(calculateTotalForType(quoteItems, "One-Off")) + parseFloat(calculateTotalForType(quoteItems, "Monthly")) + parseFloat(calculateSMCCost(quoteItems));
          const taxes = (netTotal * vatRate).toFixed(2);
          const total = (netTotal + parseFloat(taxes)).toFixed(2);
          const smcTotal = calculateSMCCost(quoteItems);
          const monthlyTotal = calculateTotalForType(quoteItems, "Monthly");
          const systemDetails = originalQuote.systemDetails || {};
          const systemSummary = [
            { label: "Protocol", value: systemDetails.protocol },
            { label: "Deployment", value: systemDetails.deployment },
            { label: "Communication Type", value: systemDetails.commsType },
            { label: "Target Doors per Controller", value: systemDetails.targetDoorsPerController },
            { label: "Doors", value: systemDetails.doors },
            { label: "Readers In", value: systemDetails.readersIn },
            { label: "Readers Out", value: systemDetails.readersOut },
            { label: "Required Inputs", value: systemDetails.reqInputs },
            { label: "Required Outputs", value: systemDetails.reqOutputs },
            { label: "Exclude SynApp Door", value: systemDetails.excludeSynAppDoor ? "Yes" : "No" },
            { label: "System Users", value: systemDetails.systemUsers }
          ].filter(item => item.value);

          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "2px solid #002C5F" }}>
                <div style={{ backgroundColor: "#f8f9fa", padding: "10px", borderRadius: "5px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                  <img src="/assets/synguard-logo.png" alt="Synguard Logo" style={{ width: "100mm" }} />
                </div>
                <div style={{ textAlign: "right", color: "#002C5F", fontSize: "10pt" }}>
                  <div>{countryContacts.phone}</div>
                  <div>{countryContacts.website}</div>
                  <div>{countryContacts.email}</div>
                </div>
              </div>
              <h2 style={{ textAlign: "center", color: "#002C5F", fontWeight: "700", marginBottom: "10px", borderBottom: "1px solid #002C5F", paddingBottom: "5px" }}>
                Quotation N° {quoteNumber}
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ backgroundColor: "#002C5F", color: "#fff" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Your Reference</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Quotation Date</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Expiration Date</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Country</th>
                    <th style={{ padding: "8px", textAlign: "left" }}>Payment Term</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e1e5ea" }}>
                    <td style={{ padding: "8px" }}>{quoteName || "-"}</td>
                    <td style={{ padding: "8px" }}>{quoteDate}</td>
                    <td style={{ padding: "8px" }}>{expirationDate}</td>
                    <td style={{ padding: "8px" }}>Synguard {country}</td>
                    <td style={{ padding: "8px" }}>30 days</td>
                  </tr>
                </tbody>
              </table>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px", overflow: "hidden" }}>
                <thead>
                  <tr style={{ backgroundColor: "#002C5F", color: "#fff" }}>
                    <th style={{ padding: "8px", textAlign: "left" }}>Description</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Quantity</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Unit Price</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Disc. (%)</th>
                    <th style={{ padding: "8px", textAlign: "right" }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteItems.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #e1e5ea" }}>
                      <td style={{ padding: "8px" }}>[{item.articleNumber}] {item.model}<br />{item.description}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>{item.qty.toFixed(2)} Unit(s)</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>{currency}{item.msrpGBP.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>{item.discountStandard.toFixed(2)}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>{currency}{(item.msrpGBP * (1 - item.discountStandard / 100) * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {systemSummary.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                  <h3 style={{ color: "#002C5F", fontWeight: "700", marginBottom: "10px" }}>System Setting Summary</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#f8f9fa", borderRadius: "5px", overflow: "hidden" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#002C5F", color: "#fff" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>Setting</th>
                        <th style={{ padding: "8px", textAlign: "left" }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemSummary.map((item, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #e1e5ea" }}>
                          <td style={{ padding: "8px" }}>{item.label}</td>
                          <td style={{ padding: "8px" }}>{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <table style={{ width: "100%", marginBottom: "15px" }}>
                <tr>
                  <td style={{ textAlign: "right", padding: "8px" }}><strong>Net Total:</strong></td>
                  <td style={{ textAlign: "right", width: "100px", padding: "8px" }}>{currency}{netTotal.toFixed(2)}</td>
                </tr>
                {systemType === "On-Prem" && (
                  <tr>
                    <td style={{ textAlign: "right", padding: "8px" }}><strong>SMC Total:</strong></td>
                    <td style={{ textAlign: "right", padding: "8px" }}>{currency}{smcTotal}</td>
                  </tr>
                )}
                {systemType === "Cloud" && (
                  <tr>
                    <td style={{ textAlign: "right", padding: "8px" }}><strong>Monthly Total:</strong></td>
                    <td style={{ textAlign: "right", padding: "8px" }}>{currency}{monthlyTotal}</td>
                  </tr>
                )}
                <tr>
                  <td style={{ textAlign: "right", padding: "8px" }}><strong>Taxes:</strong></td>
                  <td style={{ textAlign: "right", padding: "8px" }}>{currency}{taxes}</td>
                </tr>
                <tr>
                  <td style={{ textAlign: "right", padding: "8px" }}><strong>Total:</strong></td>
                  <td style={{ textAlign: "right", padding: "8px" }}>{currency}{total}</td>
                </tr>
              </table>
              <div style={{ marginBottom: "15px", fontSize: "10pt" }}>
                <strong>Invoicing:</strong> 100% invoicing after delivery or after activation of the SaaS/ASP solution.<br />
                <strong>Payment Terms:</strong> 30 days after the invoice date, 1% delay interest per month payable on late payment.<br />
                The customer accepts the terms and conditions of Synguard NV, available on website or on request.<br />
                All SaaS (rental) fees are subject to indexation in accordance with your SaaS agreement.<br />
                When paying, please mention reference {quoteNumber}.
              </div>
              <div style={{ marginBottom: "15px", fontSize: "10pt" }}>
                <strong>For approval</strong><br />
                {client || "Customer"}<br />
                Name and signature: ____________________________<br />
                Date: ____________________________
              </div>
              <div style={{ textAlign: "center", fontSize: "10pt", color: "#495057", borderTop: "1px solid #e1e5ea", paddingTop: "10px" }}>
                Synguard nv | Genebroekstraat 97 | B-3581 Beringen<br />
                IBAN: BE43 001930756001 | BIC: GEBABEBB | BTW: BE 0786.224.788
              </div>
            </>
          );
        })()}
      </div>

      {/* Floating Save Button */}
      <div className="floating-save">
        <button
          onClick={handleSaveQuote}
          disabled={!quoteName || !systemType || items.length === 0}
          title={
            !quoteName || !systemType || items.length === 0
              ? "Please complete all required fields"
              : "Save Quote"
          }
        >
          💾 Save Quote
        </button>
        <button
          onClick={generatePDF}
          style={{
            marginLeft: "10px",
            backgroundColor: "#007bff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            borderRadius: "5px",
            padding: "12px 18px",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1em"
          }}
        >
          📄 Print PDF
        </button>
        <button
          onClick={() => navigate("/")}
          style={{
            marginLeft: "10px",
            backgroundColor: "#6c757d",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            borderRadius: "5px",
            padding: "12px 18px",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "1em"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}