import asyncHandler from 'express-async-handler';
import User from '../models/userModels.js';
import generateToken from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import generateOTP from '../utils/generateOTP.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists. Please login instead.");
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        addresses: [],
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = await req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses || [],
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses || [],
        });
    } else {
        console.error("Profile: User not found for ID", req.user?._id);
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
});

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
        res.status(500);
        throw new Error("Google login is not configured");
    }

    if (!credential) {
        res.status(400);
        throw new Error("Missing Google credential");
    }

    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, email_verified, name, picture } = ticket.getPayload();

    if (!email || !email_verified) {
        res.status(401);
        throw new Error("Google account email is not verified");
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
        user = await User.create({
            name,
            email,
            googleId,
            avatar: picture,
            password: Math.random().toString(36),
            addresses: [],
        });
    } else {
        let shouldSaveUser = false;

        if (!user.googleId) {
            user.googleId = googleId;
            shouldSaveUser = true;
        }

        if (picture && user.avatar !== picture) {
            user.avatar = picture;
            shouldSaveUser = true;
        }

        if (shouldSaveUser) {
            await user.save();
        }
    }

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses || [],
        token: generateToken(user._id),
    });
});

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("Email does not exist");
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    await sendEmail({
        to: email,
        subject: "Password Reset OTP - BabyMart",
        html: `
            <h2>Reset Your Password</h2>
            <p>Your OTP code is:</p>
            <h1 style="color: #e74c3c; letter-spacing: 8px">${otp}</h1>
            <p>This code is valid for <strong>5 minutes</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    });

    res.status(200).json({
        success: true,
        message: "OTP has been sent to your email",
    });
});

// @desc    Reset Password - Verify OTP & change password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("Email does not exist");
    }

    // Check OTP
    if (user.otp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }

    // Check Expiry
    if (user.otpExpiry < new Date()) {
        res.status(400);
        throw new Error("OTP has expired");
    }

    // Change password (automatically hashed via pre-save hook)
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password reset successful",
    });
});

export { registerUser, loginUser, getUserProfile, logoutUser, googleLogin, forgotPassword, resetPassword };