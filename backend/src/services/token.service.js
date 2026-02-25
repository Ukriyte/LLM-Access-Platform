const jwt = require("jsonwebtoken");
const refreshRepo = require("../repositories/refreshToken.repo");
const userRepo = require("../repositories/user.repo");

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

/**
 * Generate Access Token
 */
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role   // add this
    },
    ACCESS_SECRET,
    { expiresIn: "1h" }
  );
}

/**
 * Generate Refresh Token
 */
async function generateRefreshToken(user) {
  const token = jwt.sign(
    { id: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await refreshRepo.saveRefreshToken(user.id, token);

  return token;
}

/**
 * Verify Access Token
 */
function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Refresh Access Token
 */
async function refreshAccessToken(refreshToken) {
  const stored = await refreshRepo.findRefreshToken(refreshToken);
  if (!stored) throw new Error("Invalid refresh token");
  const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
  const user = await userRepo.findUserById(decoded.id);
  if (!user) throw new Error("User not found");
  if (!user.is_active) {
    throw new Error("User disabled");
  }
  const newAccessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    ACCESS_SECRET,
    { expiresIn: "1h" }
  );
  return newAccessToken;
}

/**
 * Logout (remove refresh token)
 */
async function revokeRefreshToken(refreshToken) {
  await refreshRepo.deleteRefreshToken(refreshToken);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  refreshAccessToken,
  revokeRefreshToken
};