import express from "express";
import { getUser, signIn, signOut, signup } from "../controllers/authController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signIn);
router.post("/logout", signOut);
router.get("/me",protectedRoute,getUser)

export default router;