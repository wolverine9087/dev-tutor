import express from "express";
import { textChat } from "../controllers/chat.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
    "/message",
    protect,
    textChat
);

export default router;