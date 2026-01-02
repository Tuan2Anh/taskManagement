const commentService = require('../services/commentService');
const logService = require('../services/logService');

// @desc    Add a comment to task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
exports.addComment = async (req, res) => {
    try {
        const comment = await commentService.addComment(req.params.taskId, req.user._id, req.body.content);
        res.status(201).json(comment);
    } catch (error) {
        const status = error.message === 'Task not found' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

// @desc    Get comments for a task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
exports.getComments = async (req, res) => {
    try {
        const comments = await commentService.getComments(req.params.taskId);
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
        const logs = await logService.getLogs(req.params.taskId);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Also export createLog if older consumers need it, but ideally they should use logService
// For specific backward compatibility with tests/routes that might import it from controller file:
exports.createLog = logService.createLog;
