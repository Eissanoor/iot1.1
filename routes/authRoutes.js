const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/login/nfc', authController.loginWithNfc);
router.get('/me', authMiddleware.verifyToken, authController.getMe);

// NFC settings route
router.put('/nfc-settings', authMiddleware.verifyToken, authController.updateNfcSettings);

module.exports = router; 