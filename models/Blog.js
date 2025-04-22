const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");
const logger = require("../utils/logger");

class Blog {
  constructor(data) {
    this._id = data._id;
    this.title = data.title;
    this.content = data.content;
    this.author = data.author;
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Get all blogs
  static async findAll() {
    try {
      const db = getDb();
      return await db.collection("blogs").find().toArray();
    } catch (error) {
      logger.error("Error finding all blogs:", error);
      throw error;
    }
  }

  // Find blog by ID
  static async findById(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid blog ID format");
      }

      const db = getDb();
      return await db.collection("blogs").findOne({ _id: new ObjectId(id) });
    } catch (error) {
      logger.error(`Error finding blog with ID ${id}:`, error);
      throw error;
    }
  }

  // Create new blog
  static async create(blogData) {
    try {
      const blog = {
        ...blogData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log("Blog data:", blog);
      const db = getDb();
      const result = await db.collection("blogs").insertOne(blog);

      return { ...blog, _id: result.insertedId };
    } catch (error) {
      logger.error("Error creating blog:", error);
      throw error;
    }
  }

  // Update blog
  static async update(id, updateData) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid blog ID format");
      }

      const db = getDb();
      const result = await db
        .collection("blogs")
        .findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...updateData, updatedAt: new Date() } },
          { returnDocument: "after" }
        );

      return result.value;
    } catch (error) {
      logger.error(`Error updating blog with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete blog
  static async delete(id) {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid blog ID format");
      }

      const db = getDb();
      const result = await db
        .collection("blogs")
        .deleteOne({ _id: new ObjectId(id) });

      return result.deletedCount;
    } catch (error) {
      logger.error(`Error deleting blog with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = Blog;
