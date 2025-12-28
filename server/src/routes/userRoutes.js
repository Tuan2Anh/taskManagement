const express = require('express');
const { getUsers } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getUsers);

module.exports = router;
