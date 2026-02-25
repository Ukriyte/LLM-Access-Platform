const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");
const validate = require("../middleware/validation.middleware");

const {
  updateLimitSchema,
  resetSchema,
  toggleSchema
} = require("../validators/admin.schema");

const ctrl = require("../controllers/admin.controller");

// users
router.get("/users", auth, admin, ctrl.getUsers);

// update limits
router.post(
  "/limits",
  auth,
  admin,
  validate(updateLimitSchema),
  ctrl.updateLimits
);

// reset usage
router.post(
  "/reset",
  auth,
  admin,
  validate(resetSchema),
  ctrl.resetUsage
);

// enable/disable
router.post(
  "/toggle",
  auth,
  admin,
  validate(toggleSchema),
  ctrl.toggleUser
);

// analytics
router.get("/analytics/overview", auth, admin, ctrl.overview);
router.get("/analytics/daily", auth, admin, ctrl.daily);
router.get("/analytics/top-users", auth, admin, ctrl.topUsers);
router.get("/analytics/models", auth, admin, ctrl.models);

module.exports = router;