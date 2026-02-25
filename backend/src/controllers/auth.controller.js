const authService = require("../services/auth.service");
const {refreshAccessToken} = require("../services/token.service");

async function refresh(req, res) {
  try {
    const { refreshToken } = req.validated;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token required"
      });
    }

    const newAccessToken =
      await refreshAccessToken(refreshToken);

    res.json({
      accessToken: newAccessToken
    });

  } catch (e) {
    res.status(401).json({
      error: "Invalid or expired refresh token"
    });
  }
}


async function register(req, res) {
  try {
    const { email, password } = req.validated;
    const user = await authService.register(email, password);
    res.json({ message: "Registered", userId: user.id });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.validated;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);
  res.json({ message: "Logged out" });
}

module.exports = { register, login, logout, refresh };

