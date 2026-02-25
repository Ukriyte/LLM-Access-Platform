const MODEL_MAP = require("../config/modelMap");
const { estimateTokens } = require("../utils/tokenEstimator");
const { callChatModel } = require("../providers/openai.provider");
const { addUsage, checkUserCanConsume } = require("./usage.service");

async function runModel({ userId, model, prompt }) {

  const internalModel = MODEL_MAP[model];
  if (!internalModel) {
    throw new Error("Invalid model selected");
  }

  // 🔥 STEP 1: estimate BEFORE call
  const estimatedInput = estimateTokens(prompt);

  // 🔥 STEP 2: check limit BEFORE LLM call
  await checkUserCanConsume(userId, estimatedInput);

  // 🔥 STEP 3: call LLM only if allowed
  const result = await callChatModel(internalModel, prompt);

  // 🔥 STEP 4: log usage (atomic + final check)
  await addUsage({
    userId,
    model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens
  });

  return {
    model,
    response: result.output,
    usage: {
      input: result.inputTokens,
      output: result.outputTokens,
      total: result.inputTokens + result.outputTokens
    }
  };
}

module.exports = { runModel };