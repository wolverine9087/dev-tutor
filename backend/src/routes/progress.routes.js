import express from "express";

import {
    completeSubtopic,
    deleteProgress,
    getProgress,
    getQuizStats,
} from "../controllers/progress.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/complete", protect, completeSubtopic);

router.get("/", protect, getProgress);

router.get("/quiz-stats", protect, getQuizStats);

router.delete( "/:id", protect, deleteProgress);

export default router;