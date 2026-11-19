const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRegistration } = require('../middleware/validateMiddleware');

// Public authentication routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', authController.login);

// Protected profile routes
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;
