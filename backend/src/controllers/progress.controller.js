import { Progress } from "../models/progress.model.js";
import { Quiz } from "../models/quiz.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const completeSubtopic = asyncHandler(async (req, res) => {
    const { topic, subtopic } = req.body;

    if (!topic || !subtopic) {
        return res.status(400).json({
            success: false,
            message: "Topic and subtopic are required",
        });
    }

    const progress = await Progress.findOneAndUpdate(
        {
            user: req.user._id,
            topic,
            subtopic,
        },
        {
            $set: {
                completed: true,
                completedAt: new Date(),
            },
        },
        {
            new: true,
            upsert: true,
        }
    );

    res.json({
        success: true,
        message: "Subtopic completed",
        progress,
    });
});

export const getProgress = asyncHandler(async (req, res) => {
    const progress = await Progress.find({
        user: req.user._id,
    });

    res.json({
        success: true,
        progress,
    });
});


/* GET QUIZ STATISTICS */
export const getQuizStats = asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find({
        user: req.user._id,
        completed: true,
    });

    const quizzesCompleted = quizzes.length;

    if (quizzesCompleted === 0) {
        return res.json({
            success: true,
            averageScore: 0,
            quizzesCompleted: 0,
        });
    }

    let totalPercentage = 0;

    quizzes.forEach((quiz) => {
        const score = quiz.score || 0;
        const totalQuestions = quiz.totalQuestions || 20;

        const percentage =
            (score / totalQuestions) * 100;

        totalPercentage += percentage;
    });

    const averageScore = Math.round(
        totalPercentage / quizzesCompleted
    );

    res.json({
        success: true,
        averageScore,
        quizzesCompleted,
    });
});

export const deleteProgress = asyncHandler(
    async (req, res) => {
        const { id } = req.params;

        const progress =
            await Progress.findOneAndDelete({
                _id: id,
                user: req.user._id,
            });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: "Progress not found",
            });
        }

        res.json({
            success: true,
            message: "Completed topic removed",
        });
    }
);