import express from "express";

import {
    generateRandomQuiz,
    submitQuiz
} from "../controllers/quiz.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/generate",
    protect,
    generateRandomQuiz
);

router.post(
    "/:id/submit",
    protect,
    submitQuiz
);

export default router;