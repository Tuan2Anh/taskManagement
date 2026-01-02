const Log = require('../models/Log');

const createLog = async (taskId, userId, action, details) => {
    try {
        await Log.create({
            task: taskId,
            user: userId,
            action,
            details,
        });
    } catch (error) {
        console.error('Error creating log:', error);
    }
};

const getLogs = async (taskId) => {
    return await Log.find({ task: taskId })
        .populate('user', 'username email')
        .sort({ createdAt: -1 });
};

module.exports = { createLog, getLogs };
