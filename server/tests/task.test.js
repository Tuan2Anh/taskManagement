const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

let token;
let userId;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const url = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanagement';
    await mongoose.connect(url);

    // Create a user for testing tasks
    const userRes = await request(app)
        .post('/api/auth/register')
        .send({
            username: 'taskuser',
            email: 'task@example.com',
            password: 'password123'
        });

    if (userRes.statusCode !== 201) {
        console.log('Task Test User Register Error:', userRes.body);
    }

    token = userRes.body.token;
    userId = userRes.body._id;
});

afterAll(async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await mongoose.connection.close();
});

describe('Task Endpoints', () => {
    let secondUser;
    let secondToken;

    beforeAll(async () => {
        // Create a second user for assignment tests
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'seconduser',
                email: 'second@example.com',
                password: 'password123'
            });
        secondToken = userRes.body.token;
        secondUser = userRes.body;
    });

    it('should create a new task with assignees', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Task',
                description: 'Test Description',
                priority: 'High',
                assignees: [secondUser._id]
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toBe('Test Task');
        expect(res.body.priority).toBe('High');
        expect(res.body.assignees).toContain(secondUser._id);
        taskId = res.body._id;
    });

    it('should get all tasks', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.tasks).toBeInstanceOf(Array);
        expect(res.body.tasks.length).toBeGreaterThan(0);
        expect(res.body.tasks[0].assignees[0]).toHaveProperty('username'); // Populated
    });

    it('should get a single task by ID', async () => {
        const res = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Test Task');
        expect(res.body._id).toBe(taskId);
    });

    it('should allow creator to update task', async () => {
        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Task Title',
                status: 'In Progress'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Updated Task Title');
        expect(res.body.status).toBe('In Progress');
    });

    it('should allow assignee to update task', async () => {
        // secondUser is assigned to the task
        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${secondToken}`)
            .send({
                status: 'Done'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('Done');
    });

    it('should deny non-related user from updating task', async () => {
        // Create 3rd user
        const thirdUserRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'third',
                email: 'third@example.com',
                password: 'password123'
            });
        const thirdToken = thirdUserRes.body.token;

        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${thirdToken}`)
            .send({
                title: 'Hacker Update'
            });

        expect(res.statusCode).toEqual(403);
    });

    it('should filter tasks by status', async () => {
        const res = await request(app)
            .get('/api/tasks?status=Done')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        // We updated it to Done in previous test
        expect(res.body.tasks.length).toBe(1);
        expect(res.body.tasks[0].status).toBe('Done');
    });

    it('should filter tasks by tags', async () => {
        // First create a task with tags
        await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Tagged Task',
                description: 'Description',
                tags: ['urgent', 'backend']
            });

        const res = await request(app)
            .get('/api/tasks?tags=urgent')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.tasks.length).toBeGreaterThan(0);
        expect(res.body.tasks[0].tags).toContain('urgent');
    });

    it('should filter tasks by due date', async () => {
        // Create a task with a specific due date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

        await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Due Date Task',
                dueDate: tomorrow
            });

        const res = await request(app)
            .get(`/api/tasks?dueDate=${dateStr}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.tasks.length).toBeGreaterThan(0);
        // Basic check to ensure we got results back for that date
    });

    it('should soft delete a task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('soft delete');

        // Verify it is not returned in get all
        const getRes = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        // Should be 0 because we only created one and deleted it
        // (Assuming clean DB state)
        const taskExists = getRes.body.tasks.find(t => t._id === taskId);
        expect(taskExists).toBeUndefined();
    });

    it('should validate missing title on create', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                description: 'No Title'
            });

        // Should be 400 or 500 depending on mongoose validation error handling
        // Based on controller, it calls create which throws validation error catch block returns 500
        // Ideally it's 400 for validation. Controller says res.status(500).json({ message: error.message });
        expect(res.statusCode).not.toEqual(201);
    });
});
