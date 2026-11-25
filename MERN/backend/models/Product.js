const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 1, max: 100000 },
    category: { type: String, required: true, trim: true },
    condition: { type: String, default: "Like New" },
    campusLocation: { type: String, enum: ["Admin Block", "Fountain", "Ground", "D Block", "L Block", "DSA"], default: "Admin Block" },
    university: { type: String, default: "Presidency University, Bangalore" },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["active", "sold", "draft"], default: "active" },
    sellerId: { type: String, default: "" },
    sellerName: { type: String, default: "" },
    sellerUniversity: { type: String, default: "" },
    sellerAvatar: { type: String, default: "" },
    sellerRating: { type: Number, default: 5 },
    sellerVerified: { type: Boolean, default: false },
    contactPreference: { type: String, default: "In-App Chat" },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
    views: { type: Number, default: 1 },
    featured: { type: Boolean, default: false },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Product", productSchema);
