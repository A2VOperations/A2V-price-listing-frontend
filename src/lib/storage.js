const STORAGE_KEYS = {
  CUSTOM_PRICES: "a2v_custom_prices",
  ACTIVE_QUOTE: "a2v_active_quote",
  CLIENT_INFO: "a2v_client_info"
};

export function getCustomPrices() {
  if (typeof window === "undefined") return {};
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRICES);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error reading custom prices", e);
    return {};
  }
}

export function saveCustomPrice(productId, newPrice) {
  if (typeof window === "undefined") return;
  try {
    const current = getCustomPrices();
    current[productId] = Number(newPrice);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRICES, JSON.stringify(current));
  } catch (e) {
    console.error("Error saving custom price", e);
  }
}

export function clearCustomPrices() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_PRICES);
}

export function getActiveQuote() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUOTE);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading active quote", e);
    return [];
  }
}

export function saveActiveQuote(items) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_QUOTE, JSON.stringify(items));
  } catch (e) {
    console.error("Error saving active quote", e);
  }
}

export function getClientInfo() {
  if (typeof window === "undefined") return { clientName: "", companyName: "", phone: "", email: "", notes: "" };
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENT_INFO);
    return data ? JSON.parse(data) : { clientName: "", companyName: "", phone: "", email: "", notes: "" };
  } catch (e) {
    return { clientName: "", companyName: "", phone: "", email: "", notes: "" };
  }
}

export function saveClientInfo(info) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENT_INFO, JSON.stringify(info));
  } catch (e) {
    console.error("Error saving client info", e);
  }
}
