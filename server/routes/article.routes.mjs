import express from "express";
import multer from "multer";
import {
  createArticle,
  getArticles,
  getSingleArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/article.controllers.mjs";
import { verifyAuth, verifyAdminAuth } from "../middleware/verifyAuth.mjs"; 

const router = express.Router();
const upload = multer({ dest: "./server/uploads/images" }); // upload destination

// CREATE NEW ARTICLE (only admin)
router.post("/", verifyAdminAuth, upload.single("image"), createArticle);

// FETCH ALL ARTICLES (both user and admin)
router.get("/", verifyAuth, getArticles);

// FETCH SINGLE ARTICLE (both user and admin)
router.get("/:id", verifyAuth, getSingleArticle);

// UPDATE ARTICLE (only admin)
router.put("/:id", verifyAdminAuth, upload.single("image"), updateArticle);

// DELETE ARTICLE (only admin)
router.delete("/:id", verifyAdminAuth, deleteArticle);

export default router;
