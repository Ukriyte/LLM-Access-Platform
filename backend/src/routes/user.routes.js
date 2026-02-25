const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const ctrl = require("../controllers/user.controller");

router.get("/usage", auth, ctrl.usageSummary);

module.exports = router;