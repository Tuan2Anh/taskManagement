const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Subtask = require('../src/models/Subtask');

// Mock env
beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const url = process.env.MONGO_URI || 'mongodb://localhost:27017/task-manager-test';
    await mongoose.connect(url);
});

afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await Subtask.deleteMany({});
    await mongoose.connection.close();
});

describe('Subtask Endpoints', () => {
    let token;
    let taskId;
    let subtaskId;

    beforeAll(async () => {
        // Register User
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'subtaskuser',
                email: 'subtask@example.com',
                password: 'password123'
            });
        token = userRes.body.token;

        // Create Parent Task
        const taskRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Parent Task',
                priority: 'Medium'
            });
        taskId = taskRes.body._id;
    });

    it('should create a new subtask', async () => {
        const res = await request(app)
            .post(`/api/tasks/${taskId}/subtasks`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Test Subtask'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.title).toBe('Test Subtask');
        expect(res.body.task).toBe(taskId);
        subtaskId = res.body._id;
    });

    it('should get all subtasks for a task', async () => {
        const res = await request(app)
            .get(`/api/tasks/${taskId}/subtasks`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].title).toBe('Test Subtask');
    });

    it('should update a subtask', async () => {
        const res = await request(app)
            .put(`/api/subtasks/${subtaskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Updated Subtask',
                status: 'Done'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.title).toBe('Updated Subtask');
        expect(res.body.status).toBe('Done');
    });

    it('should delete a subtask', async () => {
        const res = await request(app)
            .delete(`/api/subtasks/${subtaskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Subtask removed (soft delete)');

        // Verify deletion
        const getRes = await request(app)
            .get(`/api/tasks/${taskId}/subtasks`)
            .set('Authorization', `Bearer ${token}`);

        expect(getRes.body.length).toBe(0);
    });
});
