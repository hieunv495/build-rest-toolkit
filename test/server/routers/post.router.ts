import * as mongoose from "mongoose";
import * as express from "express";

const Post = mongoose.model("Post");
const router = express.Router();

const getList = async (req, res) => {
  const items = await Post.find();
  return res.json(items);
};

router.get("/", getList);

export default router;
