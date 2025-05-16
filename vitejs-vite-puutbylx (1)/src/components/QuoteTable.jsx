// src/components/QuoteTable.jsx
import React from "react";
import { useQuotes } from "../context/QuotesContext";

export default function QuoteTable() {
  const { quotes, deleteQuote, requestDiscount } = useQuotes();

  const calculateTotals = (items) => {
    let oneOff = 0;
    let monthly = 0;

    items.forEach(({ msrp, discount, quantity, costType }) => {
      const discounted = msrp * (1 - discount / 100);
      const total = discounted * quantity;
      costType === "monthly" ? monthly += total : oneOff += total;
    });

    return { oneOff, monthly };
  };

  return (
    <div>
      <h2>Saved Quotes</h2>
      <table>
        <thead>
          <tr>
            <th>Quote Name</th>
            <th>Status</th>
            <th>One-Off Total</th>
            <th>Monthly Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const totals = calculateTotals(quote.items);
            return (
              <tr key={quote.id}>
                <td>{quote.name}</td>
                <td>{quote.status}</td>
                <td>£{totals.oneOff.toFixed(2)}</td>
                <td>£{totals.monthly.toFixed(2)}</td>
                <td>
                  <button onClick={() => requestDiscount(quote.id)}>Request Discount</button>
                  <button onClick={() => deleteQuote(quote.id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
