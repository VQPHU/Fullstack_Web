import asyncHandler from 'express-async-handler';
import User from '../models/userModels.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists, Try login");
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

export { registerUser, loginUser, getUserProfile, logoutUser };