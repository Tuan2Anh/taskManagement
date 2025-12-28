const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String, // e.g., 'CREATED_TASK', 'UPDATED_STATUS', 'ADDED_COMMENT'
        required: true,
    },
    details: {
        type: String, // Readable description or JSON string
    },
}, { timestamps: true });

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
