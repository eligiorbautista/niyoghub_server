import express from "express";
import { verifyAuth } from "../middleware/verifyAuth.mjs";
import {
  getMessages,
  sendMessage,
} from "../controllers/message.controllers.mjs";
import multer from "multer";

const router = express.Router();

// Configure multer to handle file uploads
const upload = multer({ dest: "server/uploads/" });

router.get("/test", (req, res) => res.send("THE MESSAGE ROUTES ARE WORKING!"))

// GET MESSAGES (id - the user you are chatting with)
router.get("/:id", verifyAuth, getMessages);

// SEND MESSAGE (id - the user you are going to chat)
router.post("/send/:id", verifyAuth, upload.single("attachment"), sendMessage);

export default router;
