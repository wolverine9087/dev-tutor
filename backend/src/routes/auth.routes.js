import express from "express";

import {
    register,
    login,
    getMe,
    logout,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Current logged-in user
router.get("/me", protect, getMe);

// Logout
router.post("/logout", logout);

export default router;

