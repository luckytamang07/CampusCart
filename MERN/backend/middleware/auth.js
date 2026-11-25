const User = require("../models/User");
const { verifyToken } = require("../utils/token");

const readBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token ? token : null;
};

/**
 * Resolves the logged-in user from the Bearer token.
 * The role and status always come from the database, never from the token,
 * so a demoted or suspended account loses access immediately.
 * Returns { user } on success or { error } with a message on failure.
 */
const resolveUser = async (req) => {
  const token = readBearerToken(req);
  if (!token) return { error: "Authentication required. Please log in." };

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return { error: "Your session has expired. Please log in again." };
  }

  const user = await User.findById(payload.sub);
  if (!user) return { error: "Account not found. Please log in again." };
  if (user.status === "suspended") return { error: "This account has been suspended by campus moderators." };

  return { user: { id: String(user._id), role: user.role, email: user.email } };
};

/** Blocks the request unless a valid JWT is supplied. Sets req.user. */
const requireAuth = async (req, res, next) => {
  try {
    const { user, error } = await resolveUser(req);
    if (error) return res.status(401).json({ success: false, message: error });
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not verify your session." });
  }
};

/** Sets req.user when a valid JWT is supplied, but never blocks the request. */
const optionalAuth = async (req, res, next) => {
  try {
    const { user } = await resolveUser(req);
    if (user) req.user = user;
  } catch (err) {
    // treat as anonymous
  }
  next();
};

module.exports = { requireAuth, optionalAuth };
