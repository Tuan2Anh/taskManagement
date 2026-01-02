const authService = require('../services/authService');
const { validateRegister, validateLogin, validateEmail, validatePassword } = require('../validations/authValidation');

exports.register = async (req, res) => {
    try {
        validateRegister(req.body);
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Register Error:', error);
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        validateLogin(req.body);
        const result = await authService.loginUser(req.body);
        res.json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const result = await authService.verifyEmail(req.params.token);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        validateEmail(req.body.email);
        const result = await authService.forgotPassword(req.body.email);
        res.status(200).json({ success: true, data: result.message });
    } catch (error) {
        // Distinguish between 404 (User not found) and 500
        const status = error.message === 'User not found' ? 404 : 500;
        res.status(status).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        validatePassword(req.body.password);
        const result = await authService.resetPassword(req.params.resettoken, req.body.password);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
