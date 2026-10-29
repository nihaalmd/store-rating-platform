
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const {
  verifyToken,
  authorizeRoles,
} = require("./src/middleware/authMiddleware");

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "StoreRate API is running!" });
});

const PORT = process.env.PORT || 5000;

app.use("/api/auth", require("./src/routes/authRoutes"));

app.get("/api/auth/me", verifyToken, (req, res) => {
  res.json({
    message: "Authenticated successfully",
    user: req.user,
  });
});

app.get(
  "/api/admin/test",
  verifyToken,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/stores", require("./src/routes/storeRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/ratings", require("./src/routes/ratingRoutes"));
app.use("/api/store-owner", require("./src/routes/storeOwnerRoutes"));
app.use("/api/password", require("./src/routes/passwordRoutes"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
