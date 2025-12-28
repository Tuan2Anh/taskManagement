const Subtask = require('../models/Subtask');
const Task = require('../models/Task');
const { createLog } = require('./commentLogController');

// @desc    Create a new subtask
// @route   POST /api/tasks/:taskId/subtasks
// @access  Private
exports.createSubtask = async (req, res) => {
    try {
        const { title, status, assignee } = req.body;
        const taskId = req.params.taskId;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const subtask = await Subtask.create({
            task: taskId,
            title,
            status,
            assignee,
        });

        await createLog(taskId, req.user._id, 'CREATED_SUBTASK', `Subtask "${title}" created.`);

        res.status(201).json(subtask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all subtasks for a task
// @route   GET /api/tasks/:taskId/subtasks
// @access  Private
exports.getSubtasks = async (req, res) => {
    try {
        const subtasks = await Subtask.find({ task: req.params.taskId })
            .populate('assignee', 'username email');

        res.json(subtasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single subtask
// @route   GET /api/subtasks/:id
// @access  Private
exports.getSubtaskById = async (req, res) => {
    try {
        const subtask = await Subtask.findById(req.params.id)
            .populate('assignee', 'username email')
            .populate('task', 'title');

        if (subtask) {
            res.json(subtask);
        } else {
            res.status(404).json({ message: 'Subtask not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a subtask
// @route   PUT /api/subtasks/:id
// @access  Private
exports.updateSubtask = async (req, res) => {
    try {
        const subtask = await Subtask.findById(req.params.id);

        if (subtask) {
            const updatedSubtask = await Subtask.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            }).populate('assignee', 'username email');

            await createLog(subtask.task, req.user._id, 'UPDATED_SUBTASK', `Subtask updated.`);

            res.json(updatedSubtask);
        } else {
            res.status(404).json({ message: 'Subtask not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Soft delete a subtask
// @route   DELETE /api/subtasks/:id
// @access  Private
exports.deleteSubtask = async (req, res) => {
    try {
        const subtask = await Subtask.findById(req.params.id);

        if (subtask) {
            subtask.isDeleted = true;
            await subtask.save();

            await createLog(subtask.task, req.user._id, 'DELETED_SUBTASK', `Subtask soft deleted.`);

            res.json({ message: 'Subtask removed (soft delete)' });
        } else {
            res.status(404).json({ message: 'Subtask not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
