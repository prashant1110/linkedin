import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import {
  deleteNotification,
  getNotification,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protectedRoute, getNotification);

router.put("/:id/read", protectedRoute, markNotificationAsRead);
router.delete("/:id", protectedRoute, deleteNotification);

export default router;
