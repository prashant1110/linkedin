import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import {
    createComment,
  createPost,
  deletePost,
  getFeedPosts,
  getPostById,
  likePost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", protectedRoute, getFeedPosts);
router.post("/create", protectedRoute, createPost);
router.post("/delete/:id", protectedRoute, deletePost);
router.get("/:id", protectedRoute, getPostById);
router.post("/:id/comment", protectedRoute, createComment);
router.post("/:id/like", protectedRoute, likePost);

export default router;
