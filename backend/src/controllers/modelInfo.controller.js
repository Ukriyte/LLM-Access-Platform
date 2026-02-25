const MODEL_MAP = require("../config/modelMap");

function getModels(req, res) {
  try {
    const models = Object.keys(MODEL_MAP);

    res.json({
      models
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch models"
    });
  }
}

module.exports = { getModels };