import Announcement from "../models/announcement.model.mjs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

// CREATE NEW ANNOUNCEMENT
export const createAnnouncement = async (req, res) => {
  try {
    const { title, subtitle, content } = req.body;

    // directory for image uploads
    const __dirname = path.resolve();
    const uploadDir = path.join(__dirname, "server/uploads/images", "announcements");

    // create directory if don't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // generate unique file name for the image
    const originalFileName = req.file.originalname;
    const ext = path.extname(originalFileName);
    const randomFileName = `${uuidv4()}${ext}`;
    const newPath = path.join(uploadDir, randomFileName);

    // move the uploaded image to the new location
    fs.renameSync(req.file.path, newPath);

    // create a new announcement document
    const announcement = new Announcement({
      image: randomFileName,
      author: req.user.id,
    });

    await announcement.save();
    return res
      .status(201)
      .json({ message: "Announcement created successfully", announcement });
  } catch (error) {
    console.error("Error creating announcement:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// FETCH ALL ANNOUNCEMENT
export const getAnnouncements = async (req, res) => {
  try {
    const announcement = await Announcement.find().populate(
      "author",
      "fullName email"
    );
    return res.status(200).json(announcement);
  } catch (error) {
    console.error("Error fetching announcements:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// FETCH SINGLE ANNOUNCEMENT BY ID
export const getSingleAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      "author",
      "fullName email"
    );
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }
    return res.status(200).json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// UPDATE EXISTING ANNOUNCEMENT
export const updateAnnouncement = async (req, res) => {
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

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }
    return res
      .status(200)
      .json({ message: "Announcement updated successfully", announcement });
  } catch (error) {
    console.error("Error updating announcement:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// DELETE ANNOUNCEMENT BY ID
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found." });
    }
    return res
      .status(200)
      .json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error.message);
    return res.status(500).json({ message: "Internal server error." });
  }
};
