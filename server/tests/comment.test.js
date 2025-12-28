const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Comment = require('../src/models/Comment');
const Log = require('../src/models/Log');

// Mock env
beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const url = process.env.MONGO_URI || 'mongodb://localhost:27017/task-manager-test';
    await mongoose.connect(url);
});

afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Log.deleteMany({});
    await mongoose.connection.close();
});

describe('Comment & Log Endpoints', () => {
    let token;
    let taskId;

    beforeAll(async () => {
        // Register User
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'commentuser',
                email: 'comment@example.com',
                password: 'password123'
            });
        token = userRes.body.token;

        // Create Task
        const taskRes = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Task with Comments',
                priority: 'Low'
            });
        taskId = taskRes.body._id;
    });

    it('should add a comment to a task', async () => {
        const res = await request(app)
            .post(`/api/tasks/${taskId}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                content: 'This is a test comment'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.content).toBe('This is a test comment');
        expect(res.body.task).toBe(taskId);
    });

    it('should get all comments for a task', async () => {
        const res = await request(app)
            .get(`/api/tasks/${taskId}/comments`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].content).toBe('This is a test comment');
    });

    it('should retrieve task logs including the comment action', async () => {
        const res = await request(app)
            .get(`/api/tasks/${taskId}/logs`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        // Should have CREATED_TASK and ADDED_COMMENT
        const hasCommentLog = res.body.some(log => log.action === 'ADDED_COMMENT');
        expect(hasCommentLog).toBeTruthy();
    });
});
