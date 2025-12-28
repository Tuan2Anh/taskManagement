const express = require('express');
const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    exportTasks, // Added exportTasks
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, createTask)
    .get(protect, getTasks);

router.get('/export', protect, exportTasks);

router.route('/:id')
    .get(protect, getTaskById)
    .put(protect, updateTask)
    .delete(protect, deleteTask);

module.exports = router;
