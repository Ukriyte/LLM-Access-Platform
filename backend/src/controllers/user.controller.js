const { getUsageSummary } = require("../services/usage.service");

async function usageSummary(req, res) {
  try {
    const data = await getUsageSummary(req.user.id);
    res.json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { usageSummary };