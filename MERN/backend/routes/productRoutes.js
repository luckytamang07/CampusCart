const express = require("express");
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  bulkReplaceProducts,
} = require("../controllers/productController");
const validateProduct = require("../middleware/validateProduct");
const { requireAuth, optionalAuth } = require("../middleware/auth");

// Reading listings is public. Changing them needs a valid JWT (Authorization: Bearer <token>).
router.post("/bulk", optionalAuth, bulkReplaceProducts);
router.post("/", requireAuth, validateProduct, createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", requireAuth, validateProduct, updateProduct);
router.delete("/:id", requireAuth, deleteProduct);

module.exports = router;
