import Conversation from "../models/conversation.model.mjs";
import Message from "../models/message.model.mjs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // For generating unique file names

// Send a message from one user to another with optional file attachment
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body; // Message content from request body
    const { id: receiverId } = req.params; // Receiver's user ID from URL params
    const senderId = req.user._id; // Sender's user ID from authentication middleware

    let attachmentPath = null; // Store the file path if a file is uploaded

    // Check if a file is uploaded
    if (req.file) {
      const __dirname = path.resolve();

      // Determine folder based on file type
      let folderName = "others"; // Default folder for unknown file types
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
        folderName = "documents"; // For Word, Excel, and PowerPoint files
      } else if (
        fileType === "application/zip" ||
        fileType === "application/x-rar-compressed"
      ) {
        folderName = "archives"; // For zip and rar files
      }

      // Create the folder if it doesn't exist
      const uploadDir = path.join(__dirname, "server/uploads/chat", folderName);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate a unique file name and move the file to the correct folder
      const originalFileName = req.file.originalname;
      const ext = path.extname(originalFileName);
      const randomFileName = `${uuidv4()}${ext}`;
      const newPath = path.join(uploadDir, randomFileName);

      fs.renameSync(req.file.path, newPath); // Move the file
      attachmentPath = path.join(folderName, randomFileName); // Save file path
    }

    // Check if a conversation already exists between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create a new message document
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      attachment: attachmentPath, // Add the file attachment path (if any)
    });

    // Add the new message to the conversation's messages array
    conversation.messages.push(newMessage._id);

    // Save both the conversation and the new message in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // Return the newly created message as a response
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
