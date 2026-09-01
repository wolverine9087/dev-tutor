import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_EXPIRES_IN || "7d",
        }
    );
};

// ===============================
// REGISTER
// ===============================
export const register = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message:
                "Name, email and password are required",
        });
    }

    const existingUser = await User.findOne({
        email: email.toLowerCase(),
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User already exists",
        });
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure:
            process.env.NODE_ENV === "production",
        maxAge:
            7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

// ===============================
// LOGIN
// ===============================
export const login = asyncHandler(async (req, res) => {
    const {
        email,
        password,
    } = req.body;

    const user = await User.findOne({
        email: email.toLowerCase(),
    }).select("+password");

    if (
        !user ||
        !(await user.matchPassword(password))
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure:
            process.env.NODE_ENV === "production",
        maxAge:
            7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

// ===============================
// GET CURRENT USER
// ===============================
export const getMe = asyncHandler(async (req, res) => {
    // Get the complete user directly from MongoDB
    const user = await User.findById(req.user._id).select(
        "-password"
    );

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
    }

    return res.json({
        success: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
});

// ===============================
// LOGOUT
// ===============================
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure:
            process.env.NODE_ENV === "production",
    });

    return res.json({
        success: true,
        message: "Logged out successfully",
    });
});

