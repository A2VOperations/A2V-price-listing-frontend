const API_BASE = ""; // Uses relative path, proxied by Vite or direct in production

export async function fetchCategoriesApi() {
  const res = await fetch(`${API_BASE}/api/categories`);
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
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/products${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  const data = await res.json();
  return data.data;
}

export async function fetchProductBySlugApi(slug) {
  const res = await fetch(`${API_BASE}/api/products/${slug}`);
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

export async function adminLoginApi(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Invalid Login ID or Password");
  return data;
}

export async function verifyAdminTokenApi(token) {
  const res = await fetch(`${API_BASE}/api/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Invalid Token");
  return data;
}
