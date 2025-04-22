const Blog = require("../models/Blog");
const logger = require("../utils/logger");

// validation function
const validateEmptyBody = (req, res, type = "Blog") => {
  if (!req.body?.title || !req.body?.content) {
    res.status(400).json({ error: `${type} title and content are required` });
    return true;
  }
  return false;
};

// error handler
const handleError = (res, error, opertion = "fetching") => {
  logger.error("Error fetching blogs:", error);
  res
    .status(500)
    .json({ error: `Failed to ${opertion} blogs`, details: error.message });
};

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll();
    logger.info(`Successfully fetched ${blogs.length} blogs`);
    res.json(blogs);
  } catch (error) {
    handleError(res, error, "fetching blogs");
  }
};

// Create new blog
const createBlog = async (req, res) => {
  try {
    // validation
    if (validateEmptyBody(req, res)) return;

    const blog = await Blog.create(req.body);
    logger.info(`Created new blog with ID: ${blog._id}`);
    res.status(201).json(blog);
  } catch (error) {
    handleError(res, error, "creating blog");
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
    handleError(res, error, "fetching blog by id");
  }
};

// Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // validation
    if (validateEmptyBody(req, res)) return;

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
    handleError(res, error, "updating blog");
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
    handleError(res, error, "deleting blog");
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
};
