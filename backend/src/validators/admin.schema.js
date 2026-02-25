const { z } = require("zod");

const updateLimitSchema = z.object({
  userId: z.string().uuid(),
  dailyLimit: z.number().min(100).max(1000000),
  monthlyLimit: z.number().min(1000).max(10000000)
});

const toggleSchema = z.object({
  userId: z.string().uuid(),
  isActive: z.boolean()
});

const resetSchema = z.object({
  userId: z.string().uuid()
});

module.exports = {
  updateLimitSchema,
  toggleSchema,
  resetSchema
};