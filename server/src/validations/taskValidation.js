const validateTask = ({ title }) => {
    if (!title || title.trim().length === 0) {
        throw new Error('Title is required');
    }
};

module.exports = { validateTask };
