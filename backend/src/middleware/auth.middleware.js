const { verifyAccessToken } = require("../services/token.service");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });

  try {
    const token = header.split(" ")[1];
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    console.log(req.user)
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;