import ollama from "../config/ai.js";

export async function generateTextChat({
    userMessage,
    topic,
    subtopic,
    slideTitle,
    slideContent,
}) {
    try {
        if (
            !userMessage ||
            !userMessage.trim()
        ) {
            throw new Error(
                "User message is required"
            );
        }

        const prompt = `
You are a patient programming tutor.

The student is currently studying:

Topic: ${topic || "Not specified"}

Subtopic: ${subtopic || "Not specified"}

Current slide:
${slideTitle || "Not specified"}

Current slide content:
${slideContent || "Not specified"}

Student's doubt:
${userMessage}

Explain the student's doubt clearly and simply.

Rules:

1. Explain the answer step by step.
2. Keep the answer beginner-friendly.
3. Stay relevant to the current lesson.
4. Use examples when useful.
5. Use code when necessary.
6. Explain code clearly.
7. Do not assume advanced knowledge.
8. Answer the student's actual question first.
9. Do not unnecessarily repeat the entire slide.
10. Do not go off-topic.
11. If the student has misunderstood something, politely correct them.
12. Do not mention that you are an AI model.
13. Keep the response clear and useful.
`;

        const response = await ollama.chat({
            model: "gemma3:4b",

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            options: {
                temperature: 0.3,
            },
        });

        if (
            !response ||
            !response.message ||
            !response.message.content
        ) {
            throw new Error(
                "Ollama returned an empty response"
            );
        }

        return {
            response:
                response.message.content.trim(),
        };

    } catch (error) {
        console.error(
            "Chat service error:",
            error
        );

        throw error;
    }
}