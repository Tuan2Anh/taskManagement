const Task = require('../models/Task');
const User = require('../models/User');
const { createLog } = require('./commentLogController');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
    try {
        let { title, description, status, priority, dueDate, tags, assignees } = req.body;

        // Ensure assignees is an array
        if (!assignees) {
            assignees = [];
        }

        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            tags,
            assignees,
            createdBy: req.user._id,
        });

        await createLog(task._id, req.user._id, 'CREATED_TASK', `Task "${title}" created.`);

        // Correct logic for multiple assignees notification would go here
        // For brevity, skipping loop for notifications in this snippet

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tasks with pagination and filter
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        const { status, priority, search, page = 1, limit = 10 } = req.query;
        const query = { isDeleted: false };

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (req.query.assignee) {
            // Check if assignee ID is in the assignees array
            query.assignees = req.query.assignee;
        }

        const count = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .populate('assignees', 'username email')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json({
            tasks,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalTasks: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignees', 'username email')
            .populate('createdBy', 'username');

        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            // Check ownership/permissions
            // Allow update if: User is Creator OR User is IN Assignees list OR User is Admin
            const isCreator = task.createdBy.toString() === req.user._id.toString();
            const isAssignee = task.assignees && task.assignees.some(id => id.toString() === req.user._id.toString());
            const isAdmin = req.user.role === 'admin';

            if (!isCreator && !isAssignee && !isAdmin) {
                return res.status(403).json({ message: 'Not authorized to update this task' });
            }
            const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            })
                .populate('assignees', 'username email')
                .populate('createdBy', 'username');

            await createLog(task._id, req.user._id, 'UPDATED_TASK', `Task updated.`);

            res.json(updatedTask);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Soft delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (task) {
            // Check ownership/permissions
            // Allow delete only if: User is Creator OR User is Admin
            const isCreator = task.createdBy.toString() === req.user._id.toString();
            const isAdmin = req.user.role === 'admin';

            if (!isCreator && !isAdmin) {
                return res.status(403).json({ message: 'Not authorized to delete this task' });
            }

            task.isDeleted = true;
            await task.save();

            await createLog(task._id, req.user._id, 'DELETED_TASK', `Task soft deleted.`);

            res.json({ message: 'Task removed (soft delete)' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export tasks to Excel
// @route   GET /api/tasks/export
// @access  Private
exports.exportTasks = async (req, res) => {
    try {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tasks');

        worksheet.columns = [
            { header: 'ID', key: '_id', width: 25 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Priority', key: 'priority', width: 15 },
            { header: 'Assignees', key: 'assignees', width: 30 },
            { header: 'Created By', key: 'createdBy', width: 20 },
            { header: 'Created At', key: 'createdAt', width: 20 },
        ];

        // Fetch tasks
        const tasks = await Task.find({ isDeleted: false })
            .populate('assignees', 'username email')
            .populate('createdBy', 'username');

        tasks.forEach((task) => {
            const assigneeNames = task.assignees ? task.assignees.map(u => u.username).join(', ') : '';
            worksheet.addRow({
                _id: task._id,
                title: task.title,
                status: task.status,
                priority: task.priority,
                assignees: assigneeNames,
                createdBy: task.createdBy ? task.createdBy.username : 'Unknown',
                createdAt: task.createdAt.toISOString().split('T')[0],
            });
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'tasks.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ message: error.message });
    }
};
