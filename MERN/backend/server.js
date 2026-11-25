const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const ensureAdminUser = require("./config/seedAdmin");

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, ".env") });

// Login tokens (JWT) cannot be signed without a secret, so refuse to start without one.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("JWT_SECRET is missing or too short. Add a long random JWT_SECRET to backend/.env and restart.");
  process.exit(1);
}

// Connect to MongoDB, then make sure the admin account exists
connectDB().then((connected) => {
  if (connected) ensureAdminUser();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // profile photos / listing images arrive as data URLs
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Base health-check route
app.get("/", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    message: "CampusCart Backend API is running",
    database: isDbConnected
      ? "connected"
      : "not connected (ensure MongoDB is running and MONGODB_URI is set in backend/.env)",
  });
});

// Ensure database is connected before handling product or login requests
app.use(["/api/products", "/api/auth"], (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        "Database not connected. Make sure local MongoDB is running and MONGODB_URI is set in backend/.env.",
    });
  }
  next();
});

// Auth routes (register / login / me) and product routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// Handle unknown routes (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Global error handler (e.g., malformed JSON body)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
