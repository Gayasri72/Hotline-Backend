import express from "express";
import { login, refreshToken, logout, getMe } from "../../controllers/auth/authController.js";
import { authenticate } from "../../middlewares/auth/authenticate.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/refresh", refreshToken);

// Protected routes
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
