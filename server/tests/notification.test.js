const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');
const Notification = require('../src/models/Notification');

// Mock env
beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const url = process.env.MONGO_URI || 'mongodb://localhost:27017/task-manager-test';
    await mongoose.connect(url);
});

afterAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
});

describe('Notification Endpoints', () => {
    let tokenAssigner;
    let tokenAssignee;
    let assigneeId;
    let notificationId;

    beforeAll(async () => {
        // Register Assigner
        const assignerRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'assigner',
                email: 'assigner@example.com',
                password: 'password123'
            });
        tokenAssigner = assignerRes.body.token;

        // Register Assignee
        const assigneeRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'assignee',
                email: 'assignee@example.com',
                password: 'password123'
            });
        tokenAssignee = assigneeRes.body.token;
        assigneeId = assigneeRes.body._id; // Updated to flattened structure
    });

    it('should create a notification when a task is assigned', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${tokenAssigner}`)
            .send({
                title: 'Assigned Task',
                assignee: assigneeId,
                priority: 'High'
            });

        expect(res.statusCode).toEqual(201);

        // Verify notification exists in DB directly first
        const notification = await Notification.findOne({ recipient: assigneeId });
        expect(notification).not.toBeNull();
        expect(notification.message).toContain('You have been assigned to task');
        notificationId = notification._id;
    });

    it('should get notifications for the assignee', async () => {
        const res = await request(app)
            .get('/api/notifications')
            .set('Authorization', `Bearer ${tokenAssignee}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].message).toContain('You have been assigned');
        expect(res.body[0].isRead).toBe(false);
    });

    it('should mark a notification as read', async () => {
        const res = await request(app)
            .put(`/api/notifications/${notificationId}/read`)
            .set('Authorization', `Bearer ${tokenAssignee}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.isRead).toBe(true);
    });
});
