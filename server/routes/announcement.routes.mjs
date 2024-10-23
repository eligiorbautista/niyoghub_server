import express from "express";
import multer from "multer";
import {
  createAnnouncement,
  getAnnouncements,
  getSingleAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcement.controllers.mjs";
import { verifyAuth, verifyAdminAuth } from "../middleware/verifyAuth.mjs";

const router = express.Router();
const upload = multer({ dest: "./server/uploads/images/announcements" }); // upload destination

// CREATE NEW ANNOUNCEMENT (only admin)
router.post("/", verifyAdminAuth, upload.single("image"), createAnnouncement);

// FETCH ALL ANNOUNCEMENT (both user and admin)
router.get("/", verifyAuth, getAnnouncements);

// FETCH SINGLE ANNOUNCEMENT (both user and admin)
router.get("/:id", verifyAuth, getSingleAnnouncement);

// UPDATE ANNOUNCEMENT (only admin)
// router.put("/:id", verifyAdminAuth, upload.single("image"), updateAnnouncement);

// DELETE ANNOUNCEMENT (only admin)
router.delete("/:id", verifyAdminAuth, deleteAnnouncement);

export default router;
