import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        topic: {
            type: String,
            required: true,
        },

        question: [
            {
                question: {
                    type: String,
                    required: true,
                },

                options: [
                    {
                        type: String,
                    },
                ],

                correctAnswer: {
                    type: String,
                    required: true,
                },
            },
        ],

        totalQuestions: {
            type: Number,
            default: 20,
        },

        score: {
            type: Number,
            default: 0,
        },

        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const Quiz = mongoose.model(
    "Quiz",
    quizSchema
);