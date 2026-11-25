const ALLOWED_CONDITIONS = new Set(["New", "Like New", "Good", "Fair"]);
const ALLOWED_STATUS = new Set(["active", "sold", "draft"]);
const ALLOWED_CONTACT = new Set(["In-App Chat", "Chat & Phone", "University Email"]);
const ALLOWED_LOCATIONS = new Set(["Admin Block", "Fountain", "Ground", "D Block", "L Block", "DSA"]);

const validateProduct = (req, res, next) => {
  const body = req.body || {};
  const isUpdate = req.method === "PUT";
  const errors = [];

  if (!isUpdate || body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !/^(?=.*[A-Za-z])[A-Za-z0-9][A-Za-z0-9 .&()/'-]{3,99}$/.test(body.title.trim())
    ) {
      errors.push("Product name must be 4–100 characters, contain at least one letter, and use letters, numbers, spaces, or basic punctuation.");
    }
  }
  if (!isUpdate || body.price !== undefined) {
    const price = Number(body.price);
    if (body.price === "" || !Number.isFinite(price) || price <= 0 || price > 100000) {
      errors.push("Price must be between ₹1 and ₹1,00,000.");
    }
  }
  if (!isUpdate || body.category !== undefined) {
    if (typeof body.category !== "string" || !body.category.trim()) {
      errors.push("Category is required and must be a string.");
    }
  }
  if (body.description !== undefined && typeof body.description !== "string") {
    errors.push("Description must be a string.");
  }
  if (body.images !== undefined && (!Array.isArray(body.images) || body.images.some((image) => typeof image !== "string"))) {
    errors.push("Images must be an array of strings.");
  }
  if (body.condition !== undefined && !ALLOWED_CONDITIONS.has(body.condition)) {
    errors.push("Invalid product condition.");
  }
  if (body.status !== undefined && !ALLOWED_STATUS.has(body.status)) {
    errors.push("Invalid listing status.");
  }
  if (body.contactPreference !== undefined && !ALLOWED_CONTACT.has(body.contactPreference)) {
    errors.push("Invalid contact preference.");
  }
  if (body.campusLocation !== undefined && !ALLOWED_LOCATIONS.has(body.campusLocation)) {
    errors.push("Invalid campus meeting spot.");
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }

  next();
};

module.exports = validateProduct;
