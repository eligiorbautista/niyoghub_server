import mongoose from "mongoose";

const { Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // file path of the uploaded image
      required: true,
    },
    content: {
      type: String,
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

const Article = mongoose.model("Article", articleSchema);

export default Article;
