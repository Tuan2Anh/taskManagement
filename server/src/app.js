const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const subtaskRoutes = require('./routes/subtaskRoutes');
const subtaskDirectRoutes = require('./routes/subtaskDirectRoutes');
const commentLogRoutes = require('./routes/commentLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Global Middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body with limit
app.use(morgan('dev')); // Development logging
app.use(compression()); // Compress all responses

// Data Sanitization against NoSQL query injection
if (process.env.NODE_ENV !== 'test') {
    // app.use(mongoSanitize()); // Disabled due to Express 5 compatibility issue
}

// Data Sanitization against XSS
if (process.env.NODE_ENV !== 'test') {
    // app.use(xss()); // Disabled due to Express 5 compatibility issue

    // Prevent parameter pollution
    app.use(hpp());
}

// Rate Limiting
if (process.env.NODE_ENV !== 'test') {
    const limiter = rateLimit({
        max: 100, // Limit each IP to 100 requests per windowMs
        windowMs: 15 * 60 * 1000, // 15 minutes
        message: 'Too many requests from this IP, please try again in an hour!'
    });
    app.use('/api', limiter);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:taskId/subtasks', subtaskRoutes); // Hierarchical
app.use('/api/tasks/:taskId', commentLogRoutes); // Hierarchical for comments/logs
app.use('/api/subtasks', subtaskDirectRoutes); // Direct
app.use('/api/notifications', notificationRoutes); // Notifications
app.use('/api/users', userRoutes); // User routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Middleware Error:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
});

module.exports = app;
