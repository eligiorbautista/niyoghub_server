import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "system", // updates, maintenance, etc.
        "user_activity", // user actions
        "message", // new messages
        "reminder", // events, deadlines, tasks, etc.
        "security", // account security (password changes, login attempts)
        "promotion", // promotional notifications
        "event", // upcoming or new events
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
