const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

const app = express();

// Configure CORS with specific origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection URI
const uri = "mongodb+srv://20020565:EeO1yWXUg1JZ5ldb@educationblog.2mpyp.mongodb.net/educationblog?retryWrites=true&w=majority";

// MongoDB Client with optimized settings
const client = new MongoClient(uri, {
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 60000,
  maxPoolSize: 10,
  minPoolSize: 5
});

let db;
let isConnected = false;

// Connect to MongoDB with retry mechanism
async function connectDB() {
  try {
    if (!isConnected) {
      await client.connect();
      db = client.db("educationblog");
      await db.command({ ping: 1 });
      isConnected = true;
      console.log("✅ Successfully connected to MongoDB!");
    }
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    isConnected = false;
    await client.close();
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
    return false;
  }
}

// Middleware to ensure database connection
const ensureDbConnected = async (req, res, next) => {
  if (!isConnected) {
    const connected = await connectDB();
    if (!connected) {
      return res.status(503).json({ error: "Database connection not available" });
    }
  }
  next();
};

// API Routes
app.get("/api/blogs", ensureDbConnected, async (req, res) => {
  try {
    const blogs = await db.collection("blogs").find().toArray();
    console.log(`📚 Successfully fetched ${blogs.length} blogs`);
    res.json(blogs);
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs", details: error.message });
  }
});

app.post("/api/blogs", ensureDbConnected, async (req, res) => {
  try {
    const blog = { ...req.body, createdAt: new Date(), updatedAt: new Date() };
    const result = await db.collection("blogs").insertOne(blog);
    console.log(`✨ Created new blog with ID: ${result.insertedId}`);
    res.status(201).json({ ...blog, _id: result.insertedId });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog", details: error.message });
  }
});

app.put("/api/blogs/:id", ensureDbConnected, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Update data cannot be empty" });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const result = await db.collection("blogs").findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: "Blog not found" });
    }

    console.log(`✅ Updated blog with ID: ${id}`);
    res.json(result.value);
  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({ 
      error: "Failed to update blog", 
      details: error.message 
    });
  }
});

app.delete("/api/blogs/:id", ensureDbConnected, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid blog ID format" });
    }

    const result = await db.collection("blogs").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    console.log(`🗑️ Deleted blog with ID: ${id}`);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog", details: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  const healthStatus = { 
    status: "ok",
    dbConnected: isConnected,
    timestamp: new Date()
  };
  console.log("🏥 Health Check:", JSON.stringify(healthStatus, null, 2));
  res.json(healthStatus);
});

// Start server
const PORT = process.env.PORT || 3000;
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`💻 API Documentation:`);
      console.log(`   GET    /api/blogs     - Fetch all blogs`);
      console.log(`   POST   /api/blogs     - Create new blog`);
      console.log(`   PUT    /api/blogs/:id - Update blog`);
      console.log(`   DELETE /api/blogs/:id - Delete blog`);
      console.log(`   GET    /health        - Check server status`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('\n👋 MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
