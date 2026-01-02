const User = require('../models/User');
const crypto = require('crypto');
const { generateToken } = require('../utils/jwtUtils');
const { sendEmail } = require('../providers/emailProvider');

const registerUser = async ({ username, email, password }) => {
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error('User already exists');
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
        username,
        email,
        password,
        verificationToken,
    });

    // Send email verification code (Simulation)
    // await sendEmail(email, 'Verify Email', `Token: ${verificationToken}`);

    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
        message: 'Registered successfully. Please verify your email (simulated).',
        verificationToken: verificationToken
    };
};

const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        return {
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id),
        };
    } else {
        throw new Error('Invalid email or password');
    }
};

const verifyEmail = async (token) => {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
        throw new Error('Invalid token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return { message: 'Email verified successfully' };
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // In production, use client URL from env
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail(email, 'Password Reset Token', message);

    return { message: 'Email sent (check server console)' };
};

const resetPassword = async (token, newPassword) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        throw new Error('Invalid token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return {
        success: true,
        message: 'Password updated success',
        token: generateToken(user._id),
    };
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword
};
