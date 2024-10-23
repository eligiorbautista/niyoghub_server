import Conversation from "../models/conversation.model.mjs";
import Message from "../models/message.model.mjs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Send a message from one user to another with optional file attachment
export const sendMessage = async (req, res, io) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let attachmentPath = null;

    if (req.file) {
      const __dirname = path.resolve();
      let folderName = "others";
      const fileType = req.file.mimetype;

      if (fileType.startsWith("image")) {
        folderName = "images";
      } else if (fileType.startsWith("video")) {
        folderName = "videos";
      } else if (fileType.startsWith("audio")) {
        folderName = "audios";
      } else if (fileType === "application/pdf") {
        folderName = "pdf";
      } else if (
        fileType.startsWith("application/vnd") ||
        fileType.startsWith("application/msword")
      ) {
        folderName = "documents";
      } else if (
        fileType === "application/zip" ||
        fileType === "application/x-rar-compressed"
      ) {
        folderName = "archives";
      }

      const uploadDir = path.join(__dirname, "server/uploads/chat", folderName);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const originalFileName = req.file.originalname;
      const ext = path.extname(originalFileName);
      const randomFileName = `${uuidv4()}${ext}`;
      const newPath = path.join(uploadDir, randomFileName);

      fs.renameSync(req.file.path, newPath);
      attachmentPath = path.join(folderName, randomFileName);
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      attachment: attachmentPath,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    req.io.emit("newMessage", newMessage); // Emit the new message event

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(`Error in sendMessage controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get all messages between two users (conversation)
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // The user the sender is chatting with (receiver)
    const senderId = req.user._id; // Sender's user ID from authentication middleware

    // Find the conversation between the sender and the receiver
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages"); // Populate the messages in the conversation

    // If no conversation exists, return an empty array
    if (!conversation) {
      return res.status(200).json([]);
    }

    // Return the messages array from the conversation
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error(`Error in getMessages controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error." });
  }
};
