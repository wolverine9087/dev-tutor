import { Quiz } from "../models/quiz.model.js";
import { generateQuiz } from "../services/quiz.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// =========================================
// GENERATE RANDOM QUIZ
// =========================================

export const generateRandomQuiz = asyncHandler(
  async (req, res) => {
    const topics = [
      "JavaScript",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "HTML",
      "CSS",
    ];

    // Pick random topic
    const topic =
      topics[
        Math.floor(Math.random() * topics.length)
      ];

    console.log("Generating quiz for:", topic);

    // Generate quiz using AI
    const quizData = await generateQuiz(topic);

    // Safety check
    if (
      !quizData ||
      !Array.isArray(quizData.questions) ||
      quizData.questions.length === 0
    ) {
      return res.status(500).json({
        success: false,
        message: "AI failed to generate quiz questions.",
      });
    }

    // Create quiz in database
    const quiz = await Quiz.create({
      user: req.user._id,
      topic: topic,

      question: quizData.questions,

      totalQuestions:
        quizData.questions.length,

      score: 0,

      completed: false,
    });

    console.log(
      "Quiz created:",
      quiz._id
    );

    return res.status(201).json({
      success: true,
      message: "Quiz generated successfully",

      quiz,
    });
  }
);

// =========================================
// SUBMIT QUIZ
// =========================================

export const submitQuiz = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body;

    console.log(
      "Submitting quiz:",
      id
    );

    console.log(
      "Received answers:",
      answers
    );

    // =========================================
    // FIND QUIZ
    // =========================================

    const quiz = await Quiz.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // =========================================
    // CHECK ALREADY COMPLETED
    // =========================================

    if (quiz.completed) {
      return res.status(400).json({
        success: false,
        message: "Quiz already submitted",
      });
    }

    // =========================================
    // CHECK ANSWERS
    // =========================================

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    // =========================================
    // CALCULATE SCORE
    // =========================================

    let score = 0;

    quiz.question.forEach(
      (question, index) => {
        const userAnswer =
          answers[index];

        const correctAnswer =
          question.correctAnswer;

        console.log(
          `Question ${index + 1}`
        );

        console.log(
          "User answer:",
          userAnswer
        );

        console.log(
          "Correct answer:",
          correctAnswer
        );

        // User didn't answer
        if (
          userAnswer === undefined ||
          userAnswer === null ||
          userAnswer === ""
        ) {
          return;
        }

        // =========================================
        // NORMALIZE VALUES
        // =========================================

        const userValue =
          String(userAnswer)
            .trim()
            .toLowerCase();

        const correctValue =
          String(correctAnswer)
            .trim()
            .toLowerCase();

        // =========================================
        // 1. DIRECT TEXT MATCH
        // =========================================

        if (
          userValue === correctValue
        ) {
          score++;

          console.log(
            "CORRECT - direct match"
          );

          return;
        }

        // =========================================
        // 2. CORRECT ANSWER IS A/B/C/D
        // =========================================

        if (
          ["a", "b", "c", "d"].includes(
            correctValue
          )
        ) {
          const correctIndex =
            correctValue.charCodeAt(0) -
            97;

          const correctOption =
            question.options?.[
              correctIndex
            ];

          if (
            correctOption &&
            String(correctOption)
              .trim()
              .toLowerCase() ===
              userValue
          ) {
            score++;

            console.log(
              "CORRECT - A/B/C/D match"
            );

            return;
          }
        }

        // =========================================
        // 3. CORRECT ANSWER IS NUMBER
        // =========================================

        if (
          !isNaN(Number(correctAnswer))
        ) {
          const correctIndex =
            Number(correctAnswer);

          const correctOption =
            question.options?.[
              correctIndex
            ];

          if (
            correctOption &&
            String(correctOption)
              .trim()
              .toLowerCase() ===
              userValue
          ) {
            score++;

            console.log(
              "CORRECT - index match"
            );

            return;
          }
        }

        // =========================================
        // 4. CHECK WHETHER USER ANSWER
        //    IS A/B/C/D
        // =========================================

        if (
          ["a", "b", "c", "d"].includes(
            userValue
          )
        ) {
          const userIndex =
            userValue.charCodeAt(0) -
            97;

          const correctOption =
            question.options?.[
              userIndex
            ];

          if (
            correctOption &&
            String(correctOption)
              .trim()
              .toLowerCase() ===
              correctValue
          ) {
            score++;

            console.log(
              "CORRECT - user A/B/C/D match"
            );

            return;
          }
        }

        // =========================================
        // WRONG ANSWER
        // =========================================

        console.log(
          "WRONG ANSWER"
        );
      }
    );

    // =========================================
    // TOTAL QUESTIONS
    // =========================================

    const totalQuestions =
      quiz.question.length;

    // =========================================
    // CALCULATE PERCENTAGE
    // =========================================

    const percentage =
      totalQuestions > 0
        ? Math.round(
            (score /
              totalQuestions) *
              100
          )
        : 0;

    // =========================================
    // SAVE SCORE TO DATABASE
    // =========================================

    quiz.score = score;

    quiz.totalQuestions =
      totalQuestions;

    quiz.completed = true;

    await quiz.save();

    console.log(
      "================================="
    );

    console.log(
      "QUIZ SUBMITTED"
    );

    console.log(
      "Score:",
      score
    );

    console.log(
      "Total:",
      totalQuestions
    );

    console.log(
      "Percentage:",
      percentage
    );

    console.log(
      "================================="
    );

    // =========================================
    // SEND RESPONSE
    // =========================================

    return res.status(200).json({
      success: true,

      message:
        "Quiz submitted successfully",

      score,

      totalQuestions,

      percentage,

      quiz,
    });
  }
);

