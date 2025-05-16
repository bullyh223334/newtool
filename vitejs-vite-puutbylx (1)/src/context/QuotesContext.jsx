import React, { createContext, useContext, useState } from "react";

const QuotesContext = createContext();

export const useQuotes = () => useContext(QuotesContext);

export const QuotesProvider = ({ children }) => {
  const [quotes, setQuotes] = useState([]);
  const [currentUser, setCurrentUser] = useState({ company: "Demo Company" });
  const [selectedCurrency, setSelectedCurrency] = useState("GBP");

  const addQuote = (quote) => {
    console.log("QuotesContext: Adding quote", quote);
    setQuotes((prev) => [...prev, quote]);
  };

  return (
    <QuotesContext.Provider
      value={{ quotes, addQuote, currentUser, selectedCurrency, setSelectedCurrency }}
    >
      {children}
    </QuotesContext.Provider>
  );
};