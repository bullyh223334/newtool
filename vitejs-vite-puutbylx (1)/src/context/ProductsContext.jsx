import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";

const ProductsContext = createContext();
export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
  // Default product list to initialize localStorage if empty
  const defaultProducts = [
    {
      id: uuid(),
      articleNumber: "S03835",
      model: "SynApp",
      descriptionEN: "SynApp-DIN-HW",
      msrpGBP: 1000,
      msrpEUR: 1200,
      method: "Upfront",
      type: "Hardware",
      discountStandard: 10,
      smc: 5,
    },
    {
      id: uuid(),
      articleNumber: "S12345",
      model: "SynOne",
      descriptionEN: "Synone-HW",
      msrpGBP: 800,
      msrpEUR: 950,
      method: "Upfront",
      type: "Hardware",
      discountStandard: 10,
      smc: 5,
    },
    {
      id: uuid(),
      articleNumber: "S03850",
      model: "SynConSC",
      descriptionEN: "SynConSC-HW",
      msrpGBP: 1200,
      msrpEUR: 1400,
      method: "Upfront",
      type: "Hardware",
      discountStandard: 10,
      smc: 5,
    },
    {
      id: uuid(),
      articleNumber: "S03846",
      model: "SynConDuoDuo",
      descriptionEN: "SynCon-HW",
      msrpGBP: 1500,
      msrpEUR: 1750,
      method: "Upfront",
      type: "Hardware",
      discountStandard: 10,
      smc: 5,
    },
    {
      id: uuid(),
      articleNumber: "S03855",
      model: "SynConEvo",
      descriptionEN: "SynConEvo-DIN-HW",
      msrpGBP: 2000,
      msrpEUR: 2300,
      method: "Upfront",
      type: "Hardware",
      discountStandard: 10,
      smc: 5,
    },
    {
      id: uuid(),
      articleNumber: "S03869",
      model: "SynIO",
      descriptionEN: "SynIO-DIN-HW",
      msrpGBP: 600,
      msrpEUR: 700,
      method: "Upfront",
      type: "Hardware",
      discountStandard: 10,
      smc: 5,
    },
    {
      id: uuid(),
      articleNumber: "S00531",
      model: "Synguard-Platform",
      descriptionEN: "Synguard-Platform",
      msrpGBP: 500,
      msrpEUR: 600,
      method: "Upfront",
      type: "Software",
      discountStandard: 0,
      smc: 0,
    },
    {
      id: uuid(),
      articleNumber: "S00531H",
      model: "H-Synguard-Platform",
      descriptionEN: "H-Synguard-Platform",
      msrpGBP: 50,
      msrpEUR: 60,
      method: "Recurring",
      type: "Cloud",
      discountStandard: 0,
      smc: 0,
    },
    {
      id: uuid(),
      articleNumber: "S00524",
      model: "Synguard",
      descriptionEN: "Synguard User License",
      msrpGBP: 100,
      msrpEUR: 120,
      method: "Upfront",
      type: "Software",
      discountStandard: 0,
      smc: 0,
    },
    {
      id: uuid(),
      articleNumber: "S00524H",
      model: "H-Synguard",
      descriptionEN: "H-Synguard User License",
      msrpGBP: 10,
      msrpEUR: 12,
      method: "Recurring",
      type: "Cloud",
      discountStandard: 0,
      smc: 0,
    },
  ];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products from localStorage on initial mount
  useEffect(() => {
    console.log("ProductsContext: Attempting initial load...");
    setLoading(true);
    try {
      const saved = localStorage.getItem("sg-products");
      if (saved) {
        const parsedProducts = JSON.parse(saved);
        if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
          setProducts(parsedProducts);
          console.log(`ProductsContext: Loaded ${parsedProducts.length} products from localStorage.`);
        } else {
          console.log("ProductsContext: No valid products in localStorage. Initializing with default products.");
          setProducts(defaultProducts);
          localStorage.setItem("sg-products", JSON.stringify(defaultProducts));
        }
      } else {
        console.log("ProductsContext: No products in localStorage. Initializing with default products.");
        setProducts(defaultProducts);
        localStorage.setItem("sg-products", JSON.stringify(defaultProducts));
      }
    } catch (error) {
      console.error("ProductsContext: Failed to load/parse products from localStorage:", error);
      setProducts(defaultProducts);
      localStorage.setItem("sg-products", JSON.stringify(defaultProducts));
    } finally {
      console.log("ProductsContext: Initial load finished.");
      setLoading(false);
    }
  }, []); // Empty dependency array for mount-only execution

  // Persist product's to localStorage when they change (after initial load)
  useEffect(() => {
    if (!loading && Array.isArray(products)) {
      try {
        console.log(`ProductsContext: Saving ${products.length} products to localStorage.`);
        localStorage.setItem("sg-products", JSON.stringify(products));
        console.log("ProductsContext: Successfully saved to localStorage.");
      } catch (error) {
        console.error("ProductsContext: Failed to save products to localStorage:", error);
      }
    } else if (!Array.isArray(products)) {
      console.warn("ProductsContext: Attempted to save non-array product state. Skipping save.", products);
    }
  }, [products, loading]);

  // Find product details by model name
  const getProductDetails = useCallback(
    (modelName) => {
      if (!Array.isArray(products) || !modelName) return null;
      return products.find((p) => p.model === modelName) || null;
    },
    [products]
  );

  // Find product details by article number
  const getProductByArticle = useCallback(
    (articleNo) => {
      if (!Array.isArray(products) || !articleNo) return null;
      return products.find((p) => p.articleNumber === articleNo) || null;
    },
    [products]
  );

  return (
    <ProductsContext.Provider
      value={{ products, loading, getProductDetails, getProductByArticle, setProducts }}
    >
      {children}
    </ProductsContext.Provider>
  );
};