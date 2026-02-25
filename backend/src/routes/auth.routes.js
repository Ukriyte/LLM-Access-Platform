const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");
const validate = require("../middleware/validation.middleware");
const { registerSchema, loginSchema, refreshSchema } = require("../validators/auth.schema");

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);
router.post("/refresh", validate(refreshSchema), ctrl.refresh);
router.post("/logout", ctrl.logout);

module.exports = router;