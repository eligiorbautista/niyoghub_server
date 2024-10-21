import express from "express";
import { verifyAuth, verifyUserAuth } from "../middleware/verifyAuth.mjs";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../controllers/user.controllers.mjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Set up Multer storage configuration for profile pictures
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join("uploads", "profiles");
    // Create directory if it does not exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// Configure Multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

// FETCH USER PROFILE
router.get("/profile", verifyAuth, getUserProfile);

// UPDATE USER PROFILE with profile picture upload
router.put(
  "/profile",
  verifyAuth,
  upload.single("profilePicture"),
  updateUserProfile
);

// CHANGE PASSWORD
router.put("/change-password", verifyUserAuth, changeUserPassword);

export default router;
