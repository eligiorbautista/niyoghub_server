import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachment: {
      type: String, // file path for attachments (images, videos, PDFs, etc.)
      default: null,
    },
  },
  { timestamps: true } 
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
