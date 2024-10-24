import Article from "../models/article.model.mjs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// CREATE NEW ARTICLE
export const createArticle = async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;

    // directory for image uploads
    const __dirname = path.resolve();
    const uploadDir = path.join(__dirname, "server/uploads/images", "articles");

    // create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // generate a unique file name for the image
    const originalFileName = req.file.originalname;
    const ext = path.extname(originalFileName);
    const randomFileName = `${uuidv4()}${ext}`;
    const newPath = path.join(uploadDir, randomFileName);

    // move the uploaded image to the new location
    fs.renameSync(req.file.path, newPath);

    // create a new article document
    const article = new Article({
      title,
      subtitle,
      content,
      image: randomFileName,
      author: req.user.id,
    });

    await article.save();

    // Emit socket event for article creation
    req.io.emit("articleCreated", article);

    return res
      .status(201)
      .json({ message: "Article created successfully", article });
  } catch (error) {
    console.error("Error creating article:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// FETCH ALL ARTICLES
export const getArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate("author", "fullName email");
    return res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// FETCH SINGLE ARTICLE BY ID
export const getSingleArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate(
      "author",
      "fullName email"
    );
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }
    return res.status(200).json(article);
  } catch (error) {
    console.error("Error fetching article:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// UPDATE EXISTING ARTICLE
export const updateArticle = async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;
    const updateData = { title, subtitle, content };

    // handle the uploaded image
    if (req.file) {
      const __dirname = path.resolve();
      const uploadDir = path.join(__dirname, "server/uploads", "images");
      const ext = path.extname(req.file.originalname);
      const randomFileName = `${uuidv4()}${ext}`;
      const newPath = path.join(uploadDir, randomFileName);
      fs.renameSync(req.file.path, newPath);
      updateData.image = randomFileName;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    // Emit socket event for article update
    req.io.emit("articleUpdated", article);

    return res
      .status(200)
      .json({ message: "Article updated successfully", article });
  } catch (error) {
    console.error("Error updating article:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// DELETE ARTICLE BY ID
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found." });
    }

    // Emit socket event for article deletion
    req.io.emit("articleDeleted", req.params.id);

    return res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
