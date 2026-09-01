import { generateLessons } from "../services/lesson.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateLesson = asyncHandler(async (req, res) => {

    const { topic, subtopic } = req.body;

    // Check required fields
    if (!topic || !subtopic) {
        return res.status(400).json({
            success: false,
            message: "Topic and subtopic are required",
        });
    }

    console.log("correct untill here")

    // Generate a fresh lesson using Ollama AI
    const lesson = await generateLessons({
        topic,
        subtopic,
    });

    // Send lesson directly to frontend
    // Nothing is saved in MongoDB
    return res.status(200).json({
        success: true,
        lesson,
    });
});