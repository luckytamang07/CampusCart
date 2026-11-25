const Product = require("../models/Product");

const normalize = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const { _id, ...rest } = obj;
  return { ...rest, id: String(_id) };
};

const createProduct = async (req, res) => {
  try {
    const body = req.body || {};
    const id = typeof body.id === "string" && body.id.trim() ? body.id.trim() : `prod-${Date.now()}`;
    const product = await Product.create({
      ...body,
      _id: id,
      sellerId: req.user.id,
      title: String(body.title).trim(),
      price: Number(body.price),
      updatedAt: new Date().toISOString(),
      createdAt: body.createdAt || new Date().toISOString(),
    });
    res.status(201).json({ success: true, message: "Product created successfully", data: normalize(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: "Could not create product", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { category, name, sortBy, order } = req.query;
    const filter = {};
    if (category) filter.category = new RegExp(String(category).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
    if (name) filter.title = new RegExp(String(name).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "i");
    const sortField = sortBy === "price" ? "price" : "createdAt";
    const sortOrder = String(order || "desc").toLowerCase() === "asc" ? 1 : -1;
    const products = await Product.find(filter).sort({ [sortField]: sortOrder });
    res.json({ success: true, count: products.length, data: products.map(normalize) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching products", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: normalize(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product ID", error: error.message });
  }
};

// Owner or admin only. The one exception is "Buy Now": any logged-in user may mark an item as sold.
const canModifyProduct = (user, product, body) => {
  if (user.role === "admin" || product.sellerId === user.id) return true;
  const keys = Object.keys(body || {});
  return keys.length === 1 && keys[0] === "status" && body.status === "sold";
};

const updateProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });
    if (!canModifyProduct(req.user, existing, req.body)) {
      return res.status(403).json({ success: false, message: "You can only modify your own listings." });
    }

    const updates = { ...(req.body || {}), updatedAt: new Date().toISOString() };
    delete updates.id;
    delete updates.sellerId; // ownership can never be reassigned
    if (req.user.role !== "admin") delete updates.featured;
    if (updates.title !== undefined) updates.title = String(updates.title).trim();
    if (updates.price !== undefined) updates.price = Number(updates.price);
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product updated successfully", data: normalize(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: "Could not update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Product not found" });
    if (req.user.role !== "admin" && existing.sellerId !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own listings." });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted successfully", data: normalize(product) });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product ID", error: error.message });
  }
};

const bulkReplaceProducts = async (req, res) => {
  try {
    const products = Array.isArray(req.body) ? req.body : req.body.products;
    if (!Array.isArray(products)) return res.status(400).json({ success: false, message: "products must be an array" });
    // This call replaces ALL listings. Anyone may use it to seed an empty database; otherwise admins only.
    if ((await Product.countDocuments()) > 0 && !(req.user && req.user.role === "admin")) {
      return res.status(403).json({ success: false, message: "Only an administrator can replace existing listings." });
    }
    await Product.deleteMany({});
    if (products.length) {
      await Product.insertMany(products.map((p, index) => ({
        ...p,
        _id: typeof p.id === "string" && p.id.trim() ? p.id.trim() : `prod-${Date.now()}-${index}`,
        title: String(p.title || "").trim(),
        price: Number(p.price || 0),
      })));
    }
    const saved = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: saved.length, data: saved.map(normalize) });
  } catch (error) {
    res.status(400).json({ success: false, message: "Could not synchronize products", error: error.message });
  }
};

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, bulkReplaceProducts };
