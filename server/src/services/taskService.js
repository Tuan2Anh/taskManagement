const Task = require('../models/Task');
const Log = require('../models/Log');
const Notification = require('../models/Notification');
const { createLog } = require('./logService');
// Actually, I should probably move createLog entirely to a service or utils to avoid circular dependency if I'm not careful.
// Let's assume createLog is safe or move it. Checking taskController imports... it imports createLog.
// Log is simple. I'll just keep using it.

const createTask = async (taskData, user) => {
    let { title, description, status, priority, dueDate, tags, assignees } = taskData;

    if (!assignees) assignees = [];

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        tags,
        assignees,
        createdBy: user._id,
    });

    await createLog(task._id, user._id, 'CREATED_TASK', `Task "${title}" created.`);

    // Notifications
    if (assignees && assignees.length > 0) {
        const notifications = assignees
            .filter(assigneeId => assigneeId.toString() !== user._id.toString())
            .map(assigneeId => ({
                recipient: assigneeId,
                message: `You have been assigned to task "${title}"`,
                task: task._id,
                isRead: false
            }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }
    }

    return task;
};

const getTasks = async (filters, page, limit) => {
    const { status, priority, search, params } = filters;
    const query = { isDeleted: false };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (params.tags) query.tags = { $in: [params.tags] };

    if (params.dueDate) {
        const date = new Date(params.dueDate);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        query.dueDate = { $gte: date, $lt: nextDay };
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    if (params.assignee) {
        query.assignees = params.assignee;
    }

    const count = await Task.countDocuments(query);
    const tasks = await Task.find(query)
        .populate('assignees', 'username email')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    return {
        tasks,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalTasks: count,
    };
};

const getTaskById = async (id) => {
    const task = await Task.findById(id)
        .populate('assignees', 'username email')
        .populate('createdBy', 'username');
    if (!task) throw new Error('Task not found');
    return task;
};

const updateTask = async (id, updateData, user) => {
    const task = await Task.findById(id);
    if (!task) throw new Error('Task not found');

    const isCreator = task.createdBy.toString() === user._id.toString();
    const isAssignee = task.assignees && task.assignees.some(uid => uid.toString() === user._id.toString());
    const isAdmin = user.role === 'admin';

    if (!isCreator && !isAssignee && !isAdmin) {
        throw new Error('Not authorized to update this task');
    }

    // Handle tags format if coming from form as string (frontend handles it, but good to be safe)
    // Here we assume data is already formatted by controller or frontend.

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    })
        .populate('assignees', 'username email')
        .populate('createdBy', 'username');

    await createLog(task._id, user._id, 'UPDATED_TASK', `Task updated.`);
    return updatedTask;
};

const deleteTask = async (id, user) => {
    const task = await Task.findById(id);
    if (!task) throw new Error('Task not found');

    const isCreator = task.createdBy.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isCreator && !isAdmin) {
        throw new Error('Not authorized to delete this task');
    }

    task.isDeleted = true;
    await task.save();

    await createLog(task._id, user._id, 'DELETED_TASK', `Task soft deleted.`);
    return { message: 'Task removed (soft delete)' };
};

const exportTasks = async () => {
    // Logic for excel generation
    // We return the tasks list populated, the controller will handle ExcelJS buffer creation 
    // OR we move ExcelJS logic here. Moving it here is cleaner for "Service" pattern.
    const tasks = await Task.find({ isDeleted: false })
        .populate('assignees', 'username email')
        .populate('createdBy', 'username');
    return tasks;
};

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    exportTasks
};
