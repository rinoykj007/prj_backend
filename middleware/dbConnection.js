const { connectDB, isDbConnected } = require("../config/db");
const logger = require("../utils/logger");

const ensureDbConnected = async (req, res, next) => {
  if (!isDbConnected()) {
    logger.info("No active database connection, attempting to connect...");
    const connected = await connectDB();
    if (!connected) {
      logger.error("Database connection failed during request");
      return res
        .status(503)
        .json({ error: "Database connection not available" });
    }
  }
  next();
};

module.exports = ensureDbConnected;
