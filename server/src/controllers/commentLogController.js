const Comment = require('../models/Comment');
const Log = require('../models/Log');
const Task = require('../models/Task');

// Helper to create log (can be moved to utils)
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

exports.createLog = createLog; // Export for use in other controllers

// @desc    Add a comment to task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const taskId = req.params.taskId;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const comment = await Comment.create({
            task: taskId,
            user: req.user._id,
            content,
        });

        // Log the action
        await createLog(taskId, req.user._id, 'ADDED_COMMENT', `Added comment: ${content.substring(0, 50)}...`);

        const populatedComment = await Comment.findById(comment._id).populate('user', 'username email');

        res.status(201).json(populatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ task: req.params.taskId })
            .populate('user', 'username email')
            .sort({ createdAt: 1 }); // Oldest first

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logs for a task
// @route   GET /api/tasks/:taskId/logs
// @access  Private
exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.find({ task: req.params.taskId })
            .populate('user', 'username email')
            .sort({ createdAt: -1 }); // Newest first

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
