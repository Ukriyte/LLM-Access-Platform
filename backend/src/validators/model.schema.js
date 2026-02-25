const { z } = require("zod");

const chatSchema = z.object({
  model: z.string().min(2).max(50),
  prompt: z.string().min(1).max(5000) // cost protection
});

module.exports = { chatSchema };