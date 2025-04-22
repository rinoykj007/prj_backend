const Blog = require("../models/Blog");
const logger = require("../utils/logger");

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll();
    logger.info(`Successfully fetched ${blogs.length} blogs`);
    res.json(blogs);
  } catch (error) {
    logger.error("Error fetching blogs:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch blogs", details: error.message });
  }
};

// Create new blog
const createBlog = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Blog data cannot be empty" });
    }

    if (!req.body.title || !req.body.content) {
      return res
        .status(400)
        .json({ error: "Blog title and content are required" });
    }

    const blog = await Blog.create(req.body);
    logger.info(`Created new blog with ID: ${blog._id}`);
    res.status(201).json(blog);
  } catch (error) {
    logger.error("Error creating blog:", error);
    res
      .status(500)
      .json({ error: "Failed to create blog", details: error.message });
  }
};

// Get blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const blog = await Blog.findById(id);

      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }

      res.json(blog);
    } catch (error) {
      if (error.message === "Invalid blog ID format") {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    logger.error(`Error fetching blog with ID ${req.params.id}:`, error);
    res
      .status(500)
      .json({ error: "Failed to fetch blog", details: error.message });
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Update data cannot be empty" });
    }

    try {
      const updatedBlog = await Blog.update(id, req.body);

      if (!updatedBlog) {
        return res.status(404).json({ error: "Blog not found" });
      }

      logger.info(`Updated blog with ID: ${id}`);
      res.json(updatedBlog);
    } catch (error) {
      if (error.message === "Invalid blog ID format") {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    logger.error(" Error updating blog:", error);
    res
      .status(500)
      .json({ error: "Failed to update blog", details: error.message });
  }
};

// Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const deletedCount = await Blog.delete(id);

      if (deletedCount === 0) {
        return res.status(404).json({ error: "Blog not found" });
      }

      logger.info(` Deleted blog with ID: ${id}`);
      res.json({ message: "Blog deleted successfully" });
    } catch (error) {
      if (error.message === "Invalid blog ID format") {
        return res.status(400).json({ error: error.message });
      }
      throw error;
    }
  } catch (error) {
    logger.error("Error deleting blog:", error);
    res
      .status(500)
      .json({ error: "Failed to delete blog", details: error.message });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
};
