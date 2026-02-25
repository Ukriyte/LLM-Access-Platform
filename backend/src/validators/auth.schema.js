const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(4).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};