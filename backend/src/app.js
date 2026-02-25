const express = require("express");
const cors = require('cors');
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const modelRoutes = require("./routes/model.routes");
const adminRoutes = require("./routes/admin.routes");
const { generalLimiter } = require("./middleware/rateLimiter");

const app = express();

app.use(express.json({ limit: "20kb" }));
app.use(cors({origin: "http://localhost:5173",credentials: true}));
app.use(generalLimiter);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/model", modelRoutes);
app.use("/admin", adminRoutes);

module.exports = app;