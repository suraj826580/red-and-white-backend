import { Router } from "express";
import { tokenVerify } from "../middlewares/token-verify.js";
import { BlogModel } from "../models/blogs.js";
const routes = Router();

routes.post("/add-blogs", tokenVerify, async (req, res) => {
  try {
    const blog = req.body;
    const createBlog = new BlogModel(blog);
    const result = await createBlog.save();
    res.status(200).send({ msg: "Blog Added Successfully", result });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

routes.get("/get-blogs", tokenVerify, async (req, res) => {
  try {
    const { userId } = req.body;
    const blogList = await BlogModel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).send({ msg: "Blog List Retrived Successfully", blogList });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

routes.patch("/edit-blog/:id", async (req, res) => {
  try {
    const blogId = req.params.id;
    const data = req.body;
    const { _id, ...newData } = data;

    const blog = await BlogModel.findOneAndUpdate({ _id: blogId }, newData, {
      new: true,
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog Not Found" });
    }

    res.status(200).json({ message: "Blog Updated Successfully", blog });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

routes.delete("/delete-blog/:id", tokenVerify, async (req, res) => {
  try {
    const blogId = req.params.id;
    const { userId } = req.body;

    const blog = await BlogModel.findOneAndDelete({ _id: blogId, userId });

    if (!blog) {
      return res.status(404).json({ message: "Blog Not Found" });
    }
    res.status(200).json({ message: "Blog Deleted Successfully", blog });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

export default routes;
