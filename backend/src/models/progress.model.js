import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
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

        subtopic: {
            type: String,
            required: true,
        },

        completed: {
            type: Boolean,
            default: false,
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// One progress record per user + topic + subtopic
progressSchema.index(
    {
        user: 1,
        topic: 1,
        subtopic: 1,
    },
    {
        unique: true,
    }
);

export const Progress = mongoose.model(
    "Progress",
    progressSchema
);