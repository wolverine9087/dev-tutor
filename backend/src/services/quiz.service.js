import ollama from "../config/ai.js";

export const generateQuiz = async (topic) => {
    try {
        if (!topic || !topic.trim()) {
            throw new Error(
                "Quiz topic is required"
            );
        }

        const cleanTopic = topic.trim();

        const prompt = `
You are an expert programming teacher.

Create exactly 20 multiple-choice questions about:

${cleanTopic}

IMPORTANT:

The correctAnswer MUST be a NUMBER.

It MUST be either:
0, 1, 2, or 3.

It represents the INDEX of the correct option.

Return ONLY valid JSON:

{
  "questions": [
    {
      "question": "What does JavaScript use to declare a constant?",
      "options": [
        "var",
        "let",
        "const",
        "static"
      ],
      "correctAnswer": 2,
      "explanation": "const is used to declare a variable that cannot be reassigned."
    }
  ]
}

RULES:

1. Create EXACTLY 20 questions.
2. Every question must be about "${cleanTopic}".
3. Every question must be related to the requested programming topic.
4. Exactly 4 options per question.
5. Options must be different from each other.
6. correctAnswer MUST be a NUMBER.
7. correctAnswer MUST be 0, 1, 2, or 3.
8. correctAnswer represents the INDEX of the correct option.
9. NEVER return the answer text in correctAnswer.
10. NEVER return "A", "B", "C", or "D".
11. NEVER return a string for correctAnswer.
12. Every question must have an explanation.
13. Explanations must clearly explain the correct answer.
14. Questions should range from beginner to intermediate.
15. Avoid duplicate questions.
16. Avoid nearly identical questions.
17. Write complete, self-contained questions.
18. If a question asks:
    "What will the following code print?"
    ALWAYS include the complete code immediately after the question.
19. NEVER write "following code" without providing the code.
20. Code examples must be valid and directly related to "${cleanTopic}".
21. Do not ask questions about unrelated technologies.
22. Return ONLY JSON.
23. Do NOT use Markdown.
24. Do NOT use code fences.
25. Do NOT add any text before or after the JSON.

The final response MUST contain exactly 20 questions.
`;

        console.log(
            `Generating quiz for: ${cleanTopic}`
        );

        const response = await ollama.chat({
            model: "gemma3:4b",

            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],

            // Force JSON response
            format: "json",

            options: {
                temperature: 0.2,
            },
        });

        // Check response
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

        // Remove accidental Markdown fences
        content = content
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        // Parse JSON
        let result;

        try {
            result = JSON.parse(content);
        } catch (parseError) {
            console.error(
                "Invalid JSON returned by Ollama:"
            );

            console.error(content);

            throw new Error(
                "Ollama returned invalid quiz JSON"
            );
        }

        // Validate questions array
        if (
            !result ||
            !Array.isArray(
                result.questions
            )
        ) {
            throw new Error(
                "AI response does not contain a valid questions array"
            );
        }

        // Exactly 20 questions
        if (
            result.questions.length !== 20
        ) {
            throw new Error(
                `AI generated ${result.questions.length} questions instead of exactly 20`
            );
        }

        // Validate every question
        result.questions =
            result.questions.map(
                (q, index) => {

                    if (
                        !q ||
                        typeof q !==
                            "object"
                    ) {
                        throw new Error(
                            `Question ${
                                index + 1
                            } is invalid`
                        );
                    }

                    // Question text
                    if (
                        typeof q.question !==
                            "string" ||
                        !q.question.trim()
                    ) {
                        throw new Error(
                            `Question ${
                                index + 1
                            } has invalid question text`
                        );
                    }

                    // Options
                    if (
                        !Array.isArray(
                            q.options
                        )
                    ) {
                        throw new Error(
                            `Question ${
                                index + 1
                            } does not have an options array`
                        );
                    }

                    // Exactly 4 options
                    if (
                        q.options.length !== 4
                    ) {
                        throw new Error(
                            `Question ${
                                index + 1
                            } must have exactly 4 options`
                        );
                    }

                    // Validate options
                    q.options.forEach(
                        (
                            option,
                            optionIndex
                        ) => {
                            if (
                                typeof option !==
                                    "string" ||
                                !option.trim()
                            ) {
                                throw new Error(
                                    `Question ${
                                        index + 1
                                    } option ${
                                        optionIndex +
                                        1
                                    } is invalid`
                                );
                            }
                        }
                    );

                    // Convert correctAnswer
                    const correctAnswer =
                        Number(
                            q.correctAnswer
                        );

                    // Validate correctAnswer
                    if (
                        !Number.isInteger(
                            correctAnswer
                        ) ||
                        correctAnswer < 0 ||
                        correctAnswer > 3
                    ) {
                        throw new Error(
                            `Question ${
                                index + 1
                            } has invalid correctAnswer: ${q.correctAnswer}`
                        );
                    }

                    // Explanation
                    if (
                        typeof q.explanation !==
                            "string" ||
                        !q.explanation.trim()
                    ) {
                        throw new Error(
                            `Question ${
                                index + 1
                            } is missing an explanation`
                        );
                    }

                    return {
                        question:
                            q.question.trim(),

                        options:
                            q.options.map(
                                (option) =>
                                    option.trim()
                            ),

                        correctAnswer,

                        explanation:
                            q.explanation.trim(),
                    };
                }
            );

        console.log(
            `Quiz generated successfully for: ${cleanTopic}`
        );

        return result;

    } catch (error) {
        console.error(
            "Quiz generation error:",
            error
        );

        throw error;
    }
};