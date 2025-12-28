const express = require('express');
const {
    addComment,
    getComments,
    getLogs,
} = require('../controllers/commentLogController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

// Routes for /api/tasks/:taskId/comments
router.route('/comments')
    .post(protect, addComment)
    .get(protect, getComments);

// Routes for /api/tasks/:taskId/logs
router.route('/logs')
    .get(protect, getLogs);

module.exports = router;
