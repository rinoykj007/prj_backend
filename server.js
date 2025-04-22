// server.js - Main entry point
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const routes = require("./routes");
const logger = require("./utils/logger");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());

// Routes
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 3000;
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(` Server running on http://localhost:${PORT}`);
      logger.info(` API Documentation:`);
      logger.info(`   GET    /api/blogs     - Fetch all blogs`);
      logger.info(`   POST   /api/blogs     - Create new blog`);
      logger.info(`   PUT    /api/blogs/:id - Update blog`);
      logger.info(`   DELETE /api/blogs/:id - Delete blog`);
      logger.info(`   GET    /api/health    - Check server status`);
    });
  } catch (error) {
    logger.error(" Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await require("./config/db").closeConnection();
    logger.info("\n MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    logger.error(" Error during shutdown:", error);
    process.exit(1);
  }
});

startServer();
