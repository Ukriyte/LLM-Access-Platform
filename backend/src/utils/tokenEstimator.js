function estimateTokens(text) {
  if (!text) return 0;

  // chars / 4 ≈ tokens (OpenAI rule)
  const charCount = text.length;
  return Math.ceil(charCount / 4);
}

module.exports = { estimateTokens };