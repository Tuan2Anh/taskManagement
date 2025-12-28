const Notification = require('../models/Notification');

// Helper to create notification
const createNotification = async (recipientId, message, taskId) => {
    try {
        await Notification.create({
            recipient: recipientId,
            message,
            relatedTask: taskId,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

exports.createNotification = createNotification;

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification && notification.recipient.toString() === req.user._id.toString()) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
