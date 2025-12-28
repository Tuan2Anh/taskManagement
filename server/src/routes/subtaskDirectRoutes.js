const express = require('express');
const {
    getSubtaskById,
    updateSubtask,
    deleteSubtask,
} = require('../controllers/subtaskController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for /:id


// Correcting the route mapping
router.route('/:id')
    .get(protect, getSubtaskById)
    .put(protect, updateSubtask)
    .delete(protect, deleteSubtask);

module.exports = router;
