const mongoose = require("mongoose");

/**
 * Login account. Holds the credentials (hashed password) plus the user's profile
 * object that the React app displays. The password hash is never returned by default.
 */
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
