const User = require('../models/User');

const getAllUsers = async () => {
    const users = await User.find({}).select('-password -verificationToken').sort({ username: 1 });
    return users;
};

module.exports = { getAllUsers };
