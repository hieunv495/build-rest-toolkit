import * as mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    number: Number,
    views: Number,
    category1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    category2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    category3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
