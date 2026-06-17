const User = require('../models/User');
const Catch = require('../models/Catch');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { catchAsync, AppError } = require('../middleware/errorHandler');

// ─── Generate JWT Token ───
function generateToken(userId) {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// ─── Register ───
const register = catchAsync(async function(req, res) {
    const { email, win_number, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the user
    const user = await User.create({
        email,
        win_number,
        phone,
        password: hashedPassword
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            win_number: user.win_number,
            phone: user.phone
        }
    });
});

// ─── Login ───
const login = catchAsync(async function(req, res) {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('Wrong email or password', 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError('Wrong email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            win_number: user.win_number,
            phone: user.phone
        }
    });
});

// ─── Get Profile ───
const getProfile = catchAsync(async function(req, res) {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    res.status(200).json({
        success: true,
        user: {
            email: user.email,
            win_number: user.win_number,
            phone: user.phone
        }
    });
});

// ─── Update Password ───
const updatePassword = catchAsync(async function(req, res) {
    const { current_password, new_password, confirm_password } = req.body;

    // Check passwords match
    if (new_password !== confirm_password) {
        throw new AppError('New passwords do not match', 400);
    }

    // Get user with password
    const user = await User.findById(req.user.id);

    // Check current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    user.password = await bcrypt.hash(new_password, 12);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});

module.exports = { register, login, getProfile, updatePassword };