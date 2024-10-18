import express from "express";
import { getPublicProfile, getSuggestedConnections, updateProfile } from "../controllers/userController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/suggestions",protectedRoute,getSuggestedConnections)
router.get("/:username",protectedRoute,getPublicProfile)

router.put("/profile",protectedRoute,updateProfile)

export default router;
