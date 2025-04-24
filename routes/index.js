const express = require("express");
const router = express.Router();
const blogRoutes = require("./blogRoutes");
const healthRoutes = require("./healthRoutes");

// Register all routes
router.use("/blogs", blogRoutes);
router.use("/health", healthRoutes);

// 404 handler for undefined routes
router.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

module.exports = router;
