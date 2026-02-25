const { runModel } = require("../services/modelWrapper.service");

async function chat(req, res) {
  try {
    const userId = req.user.id;
    const { model, prompt } = req.body;
    const result = await runModel({
      userId,
      model,
      prompt
    });

    res.json(result);

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}

module.exports = { chat };