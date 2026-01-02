const taskService = require('../services/taskService');
const { validateTask } = require('../validations/taskValidation');
const ExcelJS = require('exceljs'); // Keep excel generation logic library usage here or in service? 
// I moved data fetching to service. I'll build excel here for now to keep service pure data, 
// OR I should move Excel logic to service to keep controller thin. Let's move Excel logic to service to be consistent. 
// Wait, I didn't import ExcelJS in service. Let me update controller to handle the View/Response part (Excel creation) 
// using data from service. This is a good MVC separation.

exports.createTask = async (req, res) => {
    try {
        validateTask(req.body);
        const task = await taskService.createTask(req.body, req.user);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            search: req.query.search,
            params: req.query // pass full query for tags/dueDate/assignee
        };

        const result = await taskService.getTasks(filters, page, limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id);
        res.json(task);
    } catch (error) {
        const status = error.message === 'Task not found' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await taskService.updateTask(req.params.id, req.body, req.user);
        res.json(task);
    } catch (error) {
        const status = error.message.includes('Not authorized') ? 403 : (error.message === 'Task not found' ? 404 : 500);
        res.status(status).json({ message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const result = await taskService.deleteTask(req.params.id, req.user);
        res.json(result);
    } catch (error) {
        const status = error.message.includes('Not authorized') ? 403 : (error.message === 'Task not found' ? 404 : 500);
        res.status(status).json({ message: error.message });
    }
};

exports.exportTasks = async (req, res) => {
    try {
        const tasks = await taskService.exportTasks();

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
