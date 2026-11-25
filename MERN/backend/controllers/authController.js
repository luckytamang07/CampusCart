const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/token");

// Same rules the React forms use, enforced again here so the API cannot be bypassed.
const NAME_REGEX = /^[A-Za-z ]+$/;
const PHONE_REGEX = /^\d{10}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
const EMAIL_REGEX = /^[a-zA-Z]+\.(?=[a-zA-Z0-9]*\d)[a-zA-Z0-9]+@presidencyuniversity\.in$/i;

const UNIVERSITY_NAME = "Presidency University, Bangalore";
const CAMPUS_LOCATIONS = ["Admin Block", "Fountain", "Ground", "D Block", "L Block", "DSA"];
const GENERIC_LOGIN_ERROR = "Invalid university email or password.";

// Used to keep response time similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password-1", 10);

const DEFAULT_PREFERENCES = {
  notifyMessages: true,
  notifyInterest: true,
  notifyListingUpdates: true,
  notifySystem: true,
  showPhoneOnProfile: false,
  showOnlineStatus: true,
  campusOnlyVisibility: true,
};

const isDataOrPathImage = (value) =>
  typeof value === "string" && value.length <= 3000000 && /^(data:image\/|https?:\/\/|\/)/.test(value);

/**
 * Builds the profile object from what the client sent. Identity, role and status
 * are always decided here on the server - the client cannot choose them.
 */
const buildProfile = (clientProfile, { id, fullName, email, phone }) => {
  const source = clientProfile && typeof clientProfile === "object" ? clientProfile : {};
  const prefs = source.preferences && typeof source.preferences === "object" ? source.preferences : {};
  const preferences = {};
  Object.keys(DEFAULT_PREFERENCES).forEach((key) => {
    preferences[key] = typeof prefs[key] === "boolean" ? prefs[key] : DEFAULT_PREFERENCES[key];
  });

  return {
    id,
    fullName,
    email,
    phone,
    university: UNIVERSITY_NAME,
    campusLocation: CAMPUS_LOCATIONS.includes(source.campusLocation) ? source.campusLocation : "Admin Block",
    avatarUrl: isDataOrPathImage(source.avatarUrl) ? source.avatarUrl : undefined,
    role: "student",
    verified: false,
    memberSince: typeof source.memberSince === "string" ? source.memberSince.slice(0, 20) : "Nov 2026",
    rating: 5,
    reviewCount: 0,
    soldCount: 0,
    status: "active",
    preferences,
  };
};

/** The user object sent to the browser: stored profile + the authoritative account fields. */
const toClientUser = (userDoc) => ({
  ...(userDoc.profile || {}),
  id: String(userDoc._id),
  email: userDoc.email,
  role: userDoc.role,
  status: userDoc.status,
});

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const body = req.body || {};
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const errors = [];
    if (!NAME_REGEX.test(fullName)) errors.push("Name must contain letters and spaces only.");
    if (!PHONE_REGEX.test(phone)) errors.push("Phone number must contain exactly 10 digits.");
    if (!EMAIL_REGEX.test(email)) {
      errors.push("Email must follow name.rollnumber@presidencyuniversity.in (e.g. navya.46@presidencyuniversity.in).");
    }
    if (!PASSWORD_REGEX.test(password)) {
      errors.push("Password must contain at least 6 characters, including at least one letter and one number.");
    }
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors[0], errors });
    }

    if (await User.findOne({ email })) {
      return res.status(409).json({ success: false, message: "An account with this university email already exists." });
    }

    const id = `user-${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const profile = buildProfile(body.profile, { id, fullName, email, phone });
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ _id: id, email, passwordHash, role: "student", status: "active", profile });
    const token = signToken(user);
    res.status(201).json({ success: true, message: "Account created successfully", token, user: toClientUser(user) });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: "An account with this university email already exists." });
    }
    res.status(500).json({ success: false, message: "Could not create your account. Please try again." });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const user = email ? await User.findOne({ email }).select("+passwordHash") : null;
    const passwordOk = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

    if (!user || !passwordOk) {
      return res.status(401).json({ success: false, message: GENERIC_LOGIN_ERROR });
    }
    // Only revealed after the password has been proven correct.
    if (user.status === "suspended") {
      return res.status(403).json({ success: false, message: "This account has been suspended by campus moderators." });
    }

    const token = signToken(user);
    res.json({ success: true, message: "Login successful", token, user: toClientUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not log you in. Please try again." });
  }
};

// GET /api/auth/me  (requires a valid JWT)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ success: false, message: "Account not found. Please log in again." });
    res.json({ success: true, user: toClientUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not load your account." });
  }
};

module.exports = { register, login, getMe, toClientUser, buildProfile, UNIVERSITY_NAME };
