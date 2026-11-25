const jwt = require("jsonwebtoken");

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET is missing or too short (use at least 16 characters). Set it in backend/.env");
  }
  return secret;
};

/** Creates a signed JWT for a logged-in user. Expires after JWT_EXPIRES_IN (default 2h). */
const signToken = (user) =>
  jwt.sign({ sub: String(user._id), role: user.role, email: user.email }, getSecret(), {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  });

/** Verifies signature + expiry. Throws if the token is invalid or expired. */
const verifyToken = (token) => jwt.verify(token, getSecret(), { algorithms: ["HS256"] });

module.exports = { signToken, verifyToken, getSecret };
