const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');

// Connect to a test database so we don't pollute the dev db
beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    const url = process.env.MONGO_URI || 'mongodb://localhost:27017/task-manager-test';
    await mongoose.connect(url);
});

// Clean up database after each test run
afterAll(async () => {
    await User.deleteMany(); // Clean up users
    await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
    const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
    };

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        if (res.statusCode !== 201) {
            console.log('Register Error Body:', res.body);
        }
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('username');
        expect(res.body).toHaveProperty('email');
        expect(res.body.email).toBe(testUser.email);
    });

    it('should not register a user with existing email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should login with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should not login with invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
    });

    it('should request key for forgot password', async () => {
        const res = await request(app)
            .post('/api/auth/forgotpassword')
            .send({ email: testUser.email });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
    });

    it('should reset password with valid token', async () => {
        const crypto = require('crypto');
        const resetToken = 'testresettoken';
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Manually update user with reset token
        await User.findOneAndUpdate(
            { email: testUser.email },
            {
                resetPasswordToken,
                resetPasswordExpire: Date.now() + 10 * 60 * 1000
            }
        );

        const res = await request(app)
            .put(`/api/auth/resetpassword/${resetToken}`)
            .send({ password: 'newpassword123' });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);

        // Verify login with new password
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUser.email,
                password: 'newpassword123'
            });
        expect(loginRes.statusCode).toEqual(200);
    });
});
