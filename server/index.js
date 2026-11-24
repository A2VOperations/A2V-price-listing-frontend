import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Paths
const categoriesFilePath = path.join(__dirname, "data", "categories.json");
const productsFilePath = path.join(__dirname, "data", "products.json");

const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir));
app.use("/src/assets", express.static(path.join(__dirname, "..", "src", "assets")));

// Multer storage configuration for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// Helper functions for reading & writing JSON
function readCategories() {
  try {
    const data = fs.readFileSync(categoriesFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading categories:", err);
    return [];
  }
}

function saveCategories(categories) {
  try {
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving categories:", err);
    return false;
  }
}

function readProducts() {
  try {
    const data = fs.readFileSync(productsFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading products:", err);
    return [];
  }
}

function saveProducts(products) {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error saving products:", err);
    return false;
  }
}

// API Routes - Categories

// Get all categories
app.get("/api/categories", (req, res) => {
  const categories = readCategories();
  res.json({ success: true, data: categories });
});

// Create category
app.post("/api/categories", (req, res) => {
  const categories = readCategories();
  const newCategory = {
    id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: req.body.name,
    image: req.body.image || "/src/assets/images/categories (1).webp",
    description: req.body.description || "",
  };

  const existingIdx = categories.findIndex((c) => c.id === newCategory.id);
  if (existingIdx !== -1) {
    return res.status(400).json({ success: false, message: "Category ID or Slug already exists." });
  }

  categories.push(newCategory);
  saveCategories(categories);
  res.status(201).json({ success: true, data: newCategory });
});

// Update category
app.put("/api/categories/:id", (req, res) => {
  const categories = readCategories();
  const index = categories.findIndex((c) => c.id === req.params.id || c.slug === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Category not found." });
  }

  categories[index] = {
    ...categories[index],
    ...req.body,
  };

  saveCategories(categories);
  res.json({ success: true, data: categories[index] });
});

// Delete category
app.delete("/api/categories/:id", (req, res) => {
  let categories = readCategories();
  const initialLength = categories.length;
  categories = categories.filter((c) => c.id !== req.params.id && c.slug !== req.params.id);

  if (categories.length === initialLength) {
    return res.status(404).json({ success: false, message: "Category not found." });
  }

  saveCategories(categories);
  res.json({ success: true, message: "Category deleted successfully." });
});

// API Routes - Products

// Get products (with filtering)
app.get("/api/products", (req, res) => {
  const { categoryId, subCategory, search } = req.query;
  let products = readProducts();

  if (categoryId) {
    products = products.filter((p) => p.categoryId === categoryId);
  }

  if (subCategory) {
    products = products.filter((p) => p.subCategory === subCategory);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.categoryId && p.categoryId.toLowerCase().includes(q)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, data: products });
});

// Get single product by slug or id
app.get("/api/products/:slugOrId", (req, res) => {
  const products = readProducts();
  const product = products.find(
    (p) => p.slug === req.params.slugOrId || p.id === req.params.slugOrId || p.code === req.params.slugOrId
  );

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  res.json({ success: true, data: product });
});

// Create new product
app.post("/api/products", (req, res) => {
  const products = readProducts();
  const newProduct = {
    id: req.body.id || `AP-${Date.now().toString().slice(-5)}`,
    code: req.body.code || `CODE-${Math.floor(Math.random() * 1000)}`,
    categoryId: req.body.categoryId || "visiting-cards",
    subCategory: req.body.subCategory || "General Products",
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    image: req.body.image || "/src/assets/images/categories (1).webp",
    description: req.body.description || "",
    minQuantity: Number(req.body.minQuantity) || 1000,
    quantityStep: Number(req.body.quantityStep) || 1000,
    basePrice: Number(req.body.basePrice) || 0,
    unitName: req.body.unitName || "Cards",
    pricingModel: req.body.pricingModel || "quantity_tiered",
    variantCombinations: req.body.variantCombinations || [],
    variantDetails: req.body.variantDetails || {},
    quantityPricingTiers: req.body.quantityPricingTiers || [],
    specifications: req.body.specifications || {},
    ourSpecialization: req.body.ourSpecialization || [],
    productSpecialization: req.body.productSpecialization || [],
    importantNotes: req.body.importantNotes || [],
    fileRequirements: req.body.fileRequirements || {},
    options: req.body.options || [],
  };

  products.push(newProduct);
  saveProducts(products);
  res.status(201).json({ success: true, data: newProduct });
});

// Update product
app.put("/api/products/:id", (req, res) => {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === req.params.id || p.slug === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  products[index] = {
    ...products[index],
    ...req.body,
  };

  saveProducts(products);
  res.json({ success: true, data: products[index] });
});

// Delete product
app.delete("/api/products/:id", (req, res) => {
  let products = readProducts();
  const initialLength = products.length;
  products = products.filter((p) => p.id !== req.params.id && p.slug !== req.params.id);

  if (products.length === initialLength) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  saveProducts(products);
  res.json({ success: true, message: "Product deleted successfully." });
});

// Image Upload Endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Mock Master Rates for Dev/Stand-alone Mode
const defaultMockPapers = [
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Newspaper", gsm: 58, colour: "White", looseSheetRate: 1.20, reamRate: 520, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Newspaper", gsm: 58, colour: "Yellow", looseSheetRate: 1.25, reamRate: 545, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Newspaper", gsm: 58, colour: "Pink", looseSheetRate: 1.25, reamRate: 545, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "White", looseSheetRate: 1.50, reamRate: 700, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "Yellow", looseSheetRate: 1.55, reamRate: 725, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "Pink", looseSheetRate: 1.55, reamRate: 725, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Maplitho", gsm: 70, colour: "Blue", looseSheetRate: 1.55, reamRate: 725, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Bond", gsm: 70, colour: "White", looseSheetRate: 2.10, reamRate: 950, isActive: true },
  { rawWidthInch: 18, rawHeightInch: 22, paperType: "Bond", gsm: 80, colour: "White", looseSheetRate: 2.40, reamRate: 1100, isActive: true },
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 70, colour: "White", looseSheetRate: 3.10, reamRate: 1400, isActive: true },
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 70, colour: "Yellow", looseSheetRate: 3.15, reamRate: 1425, isActive: true },
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 70, colour: "Pink", looseSheetRate: 3.15, reamRate: 1425, isActive: true },
  { rawWidthInch: 23, rawHeightInch: 36, paperType: "Maplitho", gsm: 80, colour: "White", looseSheetRate: 3.50, reamRate: 1600, isActive: true },
];

app.get("/api/masters/papers", (req, res) => {
  res.json({ success: true, count: defaultMockPapers.length, data: defaultMockPapers });
});

app.get("/api/masters/printing-rates", (req, res) => {
  res.json({
    success: true,
    data: [
      { rateKey: "OFFSET_MASTER_LEGAL", rate: 30, unit: "per_master" },
      { rateKey: "OFFSET_MASTER_DEMY", rate: 50, unit: "per_master" },
      { rateKey: "OFFSET_IMPRESSION_RUN_1000", rate: 70, unit: "per_1000_impressions" },
    ],
  });
});

app.get("/api/masters/binding-rates", (req, res) => {
  res.json({
    success: true,
    data: [
      { bindingCode: "normal", name: "Normal Binding", ratePerBook: 25 },
      { bindingCode: "stapler", name: "Stapler Binding", ratePerBook: 12 },
      { bindingCode: "gumming", name: "Top Gumming", ratePerBook: 10 },
      { bindingCode: "hardbound", name: "Hardbound Register", ratePerBook: 45 },
      { bindingCode: "spiral", name: "Spiral Binding", ratePerBook: 30 },
    ],
  });
});

app.get("/api/masters/finishing-rates", (req, res) => {
  res.json({
    success: true,
    data: [
      { serviceKey: "FINISH_NUMBERING_PER_BOOK", name: "Serial Numbering", ratePerBook: 2 },
      { serviceKey: "FINISH_PUNCHING_PER_BOOK", name: "Hole Punching", ratePerBook: 2 },
    ],
  });
});

app.listen(PORT, () => {
  console.log(`Backend Express server listening at http://localhost:${PORT}`);
});
