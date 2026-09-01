import { generateTextChat } from "../services/chat.service.js";

export async function textChat(req, res) {
    try {
        const {
            message,
            topic,
            subtopic,
            slideTitle,
            slideContent,
        } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "A message is required",
            });
        }

        const chat = await generateTextChat({
            userMessage: message.trim(),
            topic,
            subtopic,
            slideTitle,
            slideContent,
        });

        return res.status(200).json({
            success: true,
            answer: chat.response,
        });
    } catch (error) {
        console.error("Chat controller error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate response",
        });
    }
}