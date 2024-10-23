import mongoose from "mongoose";

const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    image: {
      type: String, // file path of the uploaded image
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId, // reference to the admin
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
