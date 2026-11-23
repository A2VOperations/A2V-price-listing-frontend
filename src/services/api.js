const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function fetchCategoriesApi() {
  const res = await fetch(`${API_BASE}/api/categories?_t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.data;
}

export async function createCategoryApi(categoryData) {
  const res = await fetch(`${API_BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create category");
  return data.data;
}

export async function updateCategoryApi(id, categoryData) {
  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update category");
  return data.data;
}

export async function deleteCategoryApi(id) {
  const res = await fetch(`${API_BASE}/api/categories/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete category");
  return data;
}

export async function fetchProductsApi(params = {}) {
  const queryParams = new URLSearchParams({ ...params, _t: Date.now().toString() }).toString();
  const res = await fetch(`${API_BASE}/api/products?${queryParams}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.data;
}

export async function fetchProductBySlugApi(slug) {
  const res = await fetch(`${API_BASE}/api/products/${slug}?_t=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch product");
  const data = await res.json();
  return data.data;
}

export async function createProductApi(productData) {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create product");
  return data.data;
}

export async function updateProductApi(id, productData) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update product");
  return data.data;
}

export async function deleteProductApi(id) {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete product");
  return data;
}

export async function uploadImageApi(file) {
  const formData = new FormData();
  if (Array.isArray(file) || file instanceof FileList) {
    Array.from(file).forEach((f) => formData.append("images", f));
  } else {
    formData.append("image", file);
  }

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to upload image");
  return data.url || (data.urls && data.urls[0]) || "";
}

export async function uploadMultipleImagesApi(files) {
  const formData = new FormData();
  const fileArray = Array.isArray(files) ? files : Array.from(files);
  fileArray.forEach((f) => formData.append("images", f));

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to upload images");
  return data.urls || (data.url ? [data.url] : []);
}

// ----------------- Authentication & User Management APIs -----------------

export async function loginApi(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Invalid username or password");
  return data;
}

export async function verifyOtpApi(tempToken, otp) {
  const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempToken, otp }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to verify OTP code");
  return data;
}

export async function resendOtpApi(tempToken) {
  const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
  return data;
}

export async function fetchCurrentUserApi(token) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to authenticate session");
  return data.user;
}

export async function fetchUsersApi(token) {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch users");
  return data.data;
}

export async function createUserApi(userData, token) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create user");
  return data.data;
}

export async function updateUserApi(id, userData, token) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update user");
  return data.data;
}

export async function deleteUserApi(id, token) {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete user");
  return data;
}

// ----------------- Printing & Paper Masters APIs -----------------

function getStoredAuthToken(providedToken = null) {
  if (providedToken) return providedToken;
  try {
    const saved = localStorage.getItem("a2v_portal_auth_session");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed?.token || null;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export async function fetchPaperMastersApi(params = {}, token = null) {
  const query = new URLSearchParams(params).toString();
  const authToken = getStoredAuthToken(token);
  const headers = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}/api/masters/papers?${query}`, {
    cache: "no-store",
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch paper masters");
  return data.data;
}

export async function createPaperMasterApi(payload, token = null) {
  const authToken = getStoredAuthToken(token);
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}/api/masters/papers`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create paper");
  return data.data;
}

export async function updatePaperMasterApi(id, payload, token = null) {
  const authToken = getStoredAuthToken(token);
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}/api/masters/papers/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update paper");
  return data.data;
}

export async function deletePaperMasterApi(id, token = null) {
  const authToken = getStoredAuthToken(token);
  const headers = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}/api/masters/papers/${id}`, {
    method: "DELETE",
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete paper");
  return data;
}

export async function updatePaperRateApi(payload, token) {
  const res = await fetch(`${API_BASE}/api/masters/papers/rate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update paper rate");
  return data.data;
}

export async function fetchPrintingRatesApi() {
  const res = await fetch(`${API_BASE}/api/masters/printing-rates`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch printing rates");
  return data.data;
}

export async function updatePrintingRateApi(rateKey, payload, token) {
  const res = await fetch(`${API_BASE}/api/masters/printing-rates/${rateKey}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update printing rate");
  return data.data;
}

export async function fetchBindingRatesApi() {
  const res = await fetch(`${API_BASE}/api/masters/binding-rates`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch binding rates");
  return data.data;
}

export async function updateBindingRateApi(bindingCode, payload, token) {
  const res = await fetch(`${API_BASE}/api/masters/binding-rates/${bindingCode}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update binding rate");
  return data.data;
}

export async function fetchFinishingRatesApi() {
  const res = await fetch(`${API_BASE}/api/masters/finishing-rates`, {
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch finishing rates");
  return data.data;
}

export async function updateFinishingRateApi(serviceKey, payload, token) {
  const res = await fetch(`${API_BASE}/api/masters/finishing-rates/${serviceKey}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update finishing rate");
  return data.data;
}
