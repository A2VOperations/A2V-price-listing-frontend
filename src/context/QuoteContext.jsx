"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getActiveQuote,
  saveActiveQuote,
  getClientInfo,
  saveClientInfo,
  getCustomPrices,
  saveCustomPrice as persistCustomPrice,
  clearCustomPrices as resetPricesStorage
} from "../lib/storage";

const QuoteContext = createContext();

export function QuoteProvider({ children }) {
  const [quoteItems, setQuoteItems] = useState([]);
  const [clientInfo, setClientInfoState] = useState({
    clientName: "",
    companyName: "",
    phone: "",
    email: "",
    notes: ""
  });
  const [customPrices, setCustomPrices] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setQuoteItems(getActiveQuote());
    setClientInfoState(getClientInfo());
    setCustomPrices(getCustomPrices());
    setIsLoaded(true);
  }, []);

  const addToQuote = (product, selectedOptions, quantity, calculation) => {
    const newItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.image,
      unitName: product.unitName || "Units",
      selectedOptions,
      quantity,
      calculation,
      addedAt: new Date().toISOString()
    };

    const updated = [...quoteItems, newItem];
    setQuoteItems(updated);
    saveActiveQuote(updated);
  };

  const removeFromQuote = (index) => {
    const updated = quoteItems.filter((_, i) => i !== index);
    setQuoteItems(updated);
    saveActiveQuote(updated);
  };

  const clearQuote = () => {
    setQuoteItems([]);
    saveActiveQuote([]);
  };

  const updateClientInfo = (info) => {
    const updated = { ...clientInfo, ...info };
    setClientInfoState(updated);
    saveClientInfo(updated);
  };

  const updateCustomPrice = (productId, price) => {
    const updated = { ...customPrices, [productId]: Number(price) };
    setCustomPrices(updated);
    persistCustomPrice(productId, price);
  };

  const resetCustomPrices = () => {
    setCustomPrices({});
    resetPricesStorage();
  };

  const totalQuoteAmount = quoteItems.reduce(
    (sum, item) => sum + (item.calculation?.totalAmount || 0),
    0
  );

  const totalGstAmount = quoteItems.reduce(
    (sum, item) => sum + (item.calculation?.gstAmount || 0),
    0
  );

  const subtotalQuoteAmount = quoteItems.reduce(
    (sum, item) => sum + (item.calculation?.subtotal || 0),
    0
  );

  return (
    <QuoteContext.Provider
      value={{
        quoteItems,
        clientInfo,
        customPrices,
        addToQuote,
        removeFromQuote,
        clearQuote,
        updateClientInfo,
        updateCustomPrice,
        resetCustomPrices,
        totalQuoteAmount,
        totalGstAmount,
        subtotalQuoteAmount,
        itemCount: quoteItems.length,
        isLoaded
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
}
