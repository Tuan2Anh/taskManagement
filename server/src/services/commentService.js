const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { createLog } = require('../services/logService');

const addComment = async (taskId, userId, content) => {
    const task = await Task.findById(taskId);
    if (!task) {
        throw new Error('Task not found');
    }

    const comment = await Comment.create({
        task: taskId,
        user: userId,
        content,
    });

    await createLog(taskId, userId, 'ADDED_COMMENT', `Added comment: ${content.substring(0, 50)}...`);

    return await Comment.findById(comment._id).populate('user', 'username email');
};

const getComments = async (taskId) => {
    return await Comment.find({ task: taskId })
        .populate('user', 'username email')
        .sort({ createdAt: 1 });
};

module.exports = { addComment, getComments };
