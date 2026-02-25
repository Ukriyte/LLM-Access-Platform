const adminService = require("../services/admin.service");

/**
 * GET all users
 */
async function getUsers(req, res) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Update limits
 */
async function updateLimits(req, res) {
  try {
    const { userId, dailyLimit, monthlyLimit } = req.validated;

    const user = await adminService.updateLimits(
      userId,
      dailyLimit,
      monthlyLimit
    );

    res.json({ message: "Limits updated", user });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * Reset usage
 */
async function resetUsage(req, res) {
  try {
    const { userId } = req.validated;

    const user = await adminService.resetUsage(userId);
    res.json({ message: "Usage reset", user });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * Disable/enable user
 */
async function toggleUser(req, res) {
  try {
    const { userId, isActive } = req.validated;

    const user = await adminService.toggleUser(userId, isActive);
    res.json({ message: "User updated", user });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * Analytics Overview
 */
async function overview(req, res) {
  try {
    const data = await adminService.getOverview();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Daily usage
 */
async function daily(req, res) {
  try {
    const data = await adminService.getDailyUsage();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Top users
 */
async function topUsers(req, res) {
  try {
    const data = await adminService.getTopUsers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Model usage
 */
async function models(req, res) {
  try {
    const data = await adminService.getModelUsage();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
  updateLimits,
  resetUsage,
  toggleUser,
  overview,
  daily,
  topUsers,
  models
};