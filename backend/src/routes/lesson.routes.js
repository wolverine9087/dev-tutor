import express from "express";

import { generateLesson } from "../controllers/lesson.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/generate",
    protect,
    generateLesson
);

export default router;