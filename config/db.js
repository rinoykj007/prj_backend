const { MongoClient } = require("mongodb");
const logger = require("../utils/logger");

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://username:password@cluster.mongodb.net/educationblog?retryWrites=true&w=majority";

// MongoDB Client with optimized settings with gen AI
const client = new MongoClient(uri, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
  maxPoolSize: 10,
  minPoolSize: 5,
});

let db;
let isConnected = false;

async function connectDB() {
  try {
    if (!isConnected) {
      await client.connect();
      db = client.db("educationblog");
      await db.command({ ping: 1 });
      isConnected = true;
      logger.info("Successfully connected to MongoDB!");
    }
    return true;
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    isConnected = false;
    await client.close();
    logger.info(" Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
    return false;
  }
}

// Close database connection
async function closeConnection() {
  if (isConnected) {
    await client.close();
    isConnected = false;
  }
}

// Get database instance
function getDb() {
  return db;
}

// Check if connected
function isDbConnected() {
  return isConnected;
}

module.exports = {
  connectDB,
  getDb,
  isDbConnected,
  closeConnection,
};
