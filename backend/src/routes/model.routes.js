const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const ctrl = require("../controllers/model.controller");
const { getModels } = require("../controllers/modelInfo.controller");
const { aiLimiter } = require("../middleware/rateLimiter");
const validate = require("../middleware/validation.middleware");
const { chatSchema } = require("../validators/model.schema");

router.post("/chat", auth, aiLimiter, validate(chatSchema), ctrl.chat);
router.get("/models", auth, getModels);

module.exports = router;
