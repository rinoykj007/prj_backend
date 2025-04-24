const express = require("express");
const router = express.Router();
const { isDbConnected } = require("../config/db");
const logger = require("../utils/logger");

// Health check endpoint
router.get("/", (req, res) => {
  const healthStatus = {
    status: "ok",
    dbConnected: isDbConnected(),
    timestamp: new Date(),
  };

  logger.info("🏥 Health Check:", JSON.stringify(healthStatus, null, 2));
  res.json(healthStatus);
});

module.exports = router;
