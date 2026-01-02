const validateRegister = ({ username, email, password }) => {
    if (!username || !email || !password) {
        throw new Error('Please provide username, email, and password');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }
};

const validateLogin = ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Please provide email and password');
    }
};

const validateEmail = (email) => {
    if (!email) throw new Error('Email is required');
};

const validatePassword = (password) => {
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
}

module.exports = {
    validateRegister,
    validateLogin,
    validateEmail,
    validatePassword
};
