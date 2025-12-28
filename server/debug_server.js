const mongoose = require('mongoose');
const User = require('./src/models/User');

// Mock environment
process.env.JWT_SECRET = 'debug_secret';

const run = async () => {
    try {
        console.log('1. Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/task-manager-debug');
        console.log('   Connected!');

        console.log('2. Cleaning up debug users...');
        await User.deleteMany({ email: 'debug@example.com' });

        console.log('3. Creating a new user...');
        const user = await User.create({
            username: 'debuguser',
            email: 'debug@example.com',
            password: 'password123'
        });
        console.log('   User created successfully:', user._id);

        console.log('4. Testing password match...');
        const isMatch = await user.matchPassword('password123');
        console.log('   Password match result:', isMatch);

        console.log('SUCCESS: Components are working.');
    } catch (error) {
        console.error('FAILURE:', error);
    } finally {
        await mongoose.connection.close();
    }
};

run();
