import productsData from "./products.json";

export const products = productsData;

export const flexBoardProducts = products.filter((p) => p.categoryId === "flex-board");
export const visitingCards = products.filter((p) => p.categoryId === "visiting-cards");
export const cardHolders = products.filter((p) => p.categoryId === "card-holders");
export const pamphlets = products.filter((p) => p.categoryId === "pamphlets-posters");
export const tags = products.filter((p) => p.categoryId === "tags");
export const files = products.filter((p) => p.categoryId === "files");
export const letterHeads = products.filter((p) => p.categoryId === "letter-heads");
export const envelopes = products.filter((p) => p.categoryId === "envelopes");
export const digitalPaper = products.filter((p) => p.categoryId === "digital-paper-printing");
export const atmPouches = products.filter((p) => p.categoryId === "atm-pouches");
export const billBooks = products.filter((p) => p.categoryId === "bill-books");
export const stickers = products.filter((p) => p.categoryId === "stickers-labels");
export const pens = products.filter((p) => p.categoryId === "pens");

export function getProductBySlug(slug) {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categoryId) {
  return products.filter((p) => p.categoryId === categoryId);
}

export function searchProducts(query) {
  if (!query || query.trim() === "") return [];
  const q = query.toLowerCase().trim();
  return products.filter(
    (p) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.categoryId && p.categoryId.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.specifications?.material &&
        p.specifications.material.toLowerCase().includes(q)),
  );
}
