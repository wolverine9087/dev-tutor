export function createLessonPrompt(topic, subtopic) {
    return `
You are an expert programming tutor.

Create a beginner-friendly lesson for the following topic and subtopic.

Topic: ${topic}
Subtopic: ${subtopic}

Your response MUST be valid JSON.

IMPORTANT:
- Return ONLY the JSON object.
- Do NOT return Markdown.
- Do NOT use code fences.
- Do NOT include any explanation outside the JSON.
- Do NOT add comments to the JSON.
- Use double quotes for all JSON keys and string values.

Use EXACTLY this structure:

{
    "title": "Lesson title",
    "topic": "${topic}",
    "subtopic": "${subtopic}",
    "slides": [
        {
            "type": "content",
            "title": "Introduction",
            "content": "Explain the concept clearly."
        },
        {
            "type": "content",
            "title": "Key Concepts",
            "content": "Explain important concepts."
        },
        {
            "type": "code",
            "title": "Practical Example",
            "content": "console.log('Hello');",
            "language": "javascript"
        },
        {
            "type": "content",
            "title": "Common Mistakes",
            "content": "Explain common mistakes."
        },
        {
            "type": "mcq",
            "title": "Practice Question",
            "question": "Question here?",
            "options": [
                "Option 1",
                "Option 2",
                "Option 3",
                "Option 4"
            ],
            "correctAnswer": 0,
            "explanation": "Explain why this answer is correct."
        }
    ]
}

RULES:

1. Generate an appropriate number of slides based on the complexity and breadth of the subtopic.
2. Generate a minimum of 6 slides and a maximum of 12 slides.
3. Simple subtopics should have around 6-7 slides.
4. Medium-complexity subtopics should have around 8-9 slides.
5. Complex subtopics should have around 10-12 slides.
6. Cover the subtopic thoroughly without unnecessary repetition.
7. Every slide before the final slide must teach or explain an important part of the subtopic.
8. The final slide MUST be an MCQ.
9. The MCQ must have exactly 4 options.
10. Only one option can be correct.
11. "correctAnswer" must be 0, 1, 2, or 3.
12. Do not write A, B, C, or D inside the options.
13. Make the question clear and unambiguous.
14. Include an explanation for the correct answer.
15. Use "content" for conceptual explanations.
16. Use "code" for programming examples.
17. Use "mcq" ONLY for the final slide.
18. Include practical programming examples whenever they help explain the concept.
19. Break large concepts into multiple slides instead of putting too much information on one slide.
20. Keep each slide focused on one main concept.
21. Keep the lesson beginner-friendly and easy to understand.
22. Do not skip important fundamental concepts just to reduce the number of slides.
23. Use concise but sufficiently detailed explanations.
24. Each MCQ option must be a separate string in the "options" array.
25. Keep MCQ options clear, readable, and reasonably similar in length.
26. Do not include multiple choices inside a single option.
27. Do not use unnecessary formatting.
28. Ensure all JSON strings are properly escaped.
29. Return valid JSON only.
30. Do not return Markdown.
31. Do not write anything outside the JSON object.
`;
}
