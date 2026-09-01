import ollama from "../config/ai.js";
import { createLessonPrompt } from "../utils/prompt.js";

export async function generateLessons({
    topic,
    subtopic,
}) {
    try {
        // Validate input
        if (!topic || !subtopic) {
            throw new Error(
                "Topic and subtopic are required to generate a lesson"
            );
        }

        const prompt = createLessonPrompt(
            topic,
            subtopic
        );

        console.log(
            `Generating lesson for: ${topic} → ${subtopic}`
        );

        const response = await ollama.chat({
            model: "gemma3:4b",

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            // Ask Ollama to return JSON
            format: "json",

            options: {
                temperature: 0.2,
            },
        });

        // Check Ollama response
        if (
            !response ||
            !response.message ||
            !response.message.content
        ) {
            throw new Error(
                "Ollama returned an empty response"
            );
        }

        let content =
            response.message.content.trim();

        /*
         * Remove Markdown code fences if
         * the model accidentally returns them.
         */
        content = content
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        // Parse JSON safely
        let lesson;

        try {
            lesson = JSON.parse(content);
        } catch (parseError) {
            console.error(
                "Invalid JSON returned by Ollama:"
            );

            console.error(content);

            throw new Error(
                "AI returned invalid JSON"
            );
        }

        // Basic lesson validation
        if (
            !lesson ||
            typeof lesson !== "object"
        ) {
            throw new Error(
                "AI returned an invalid lesson object"
            );
        }

        // Validate title
        if (
            typeof lesson.title !== "string" ||
            !lesson.title.trim()
        ) {
            throw new Error(
                "AI lesson is missing a valid title"
            );
        }

        // Validate slides
        if (!Array.isArray(lesson.slides)) {
            throw new Error(
                "AI lesson does not contain a slides array"
            );
        }

        // Validate slide count
        if (
            lesson.slides.length < 6 ||
            lesson.slides.length > 12
        ) {
            throw new Error(
                `AI returned ${lesson.slides.length} slides. Expected between 6 and 12 slides.`
            );
        }

        // Validate every slide
        lesson.slides.forEach(
            (slide, index) => {
                if (
                    !slide ||
                    typeof slide !== "object"
                ) {
                    throw new Error(
                        `Invalid slide at position ${
                            index + 1
                        }`
                    );
                }

                if (
                    typeof slide.type !== "string"
                ) {
                    throw new Error(
                        `Slide ${
                            index + 1
                        } is missing a type`
                    );
                }

                if (
                    typeof slide.title !== "string"
                ) {
                    throw new Error(
                        `Slide ${
                            index + 1
                        } is missing a title`
                    );
                }
            }
        );

        // Final slide must be MCQ
        const lastSlide =
            lesson.slides[
                lesson.slides.length - 1
            ];

        if (lastSlide.type !== "mcq") {
            throw new Error(
                "Final slide must be an MCQ"
            );
        }

        // Preserve topic information
        lesson.topic = topic;
        lesson.subtopic = subtopic;

        console.log(
            `Lesson generated successfully: ${topic} → ${subtopic}`
        );

        return lesson;

    } catch (error) {
        console.error(
            "Lesson service error:",
            error
        );

        throw error;
    }
}