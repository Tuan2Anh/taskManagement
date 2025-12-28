const express = require('express');
const {
    createSubtask,
    getSubtasks,
    getSubtaskById,
    updateSubtask,
    deleteSubtask,
} = require('../controllers/subtaskController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

// Routes for /api/tasks/:taskId/subtasks
router.route('/')
    .post(protect, createSubtask)
    .get(protect, getSubtasks);

// Routes for /api/subtasks/:id (needs separate mounting in app.js or careful routing)
// The controller method createSubtask expects :taskId in params.
// So we will stick to /api/tasks/:taskId/subtasks for creation/listing
// And /api/subtasks/:id for direct manipulation if needed, or keeping it hierarchical.
// Let's implement hierarchy for create/list, and direct for update/delete/getById.

module.exports = router;
