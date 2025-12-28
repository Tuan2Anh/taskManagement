const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -verificationToken').sort({ username: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
