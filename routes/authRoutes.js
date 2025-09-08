const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { upload } = require('../utils/uploadUtils');

// Auth routes
router.post('/signup', authController.signup);
router.post('/create-user', authController.createUser); // Comprehensive signup with subscription support
router.post('/login', authController.login);
router.post('/login/nfc', authController.loginWithNfc);
router.get('/me', authMiddleware.verifyToken, authController.getMe);

// NFC settings route
router.put('/nfc-settings', authMiddleware.verifyToken, authController.updateNfcSettings);

// Profile update route (with image upload support)
router.put('/profile', authMiddleware.verifyToken, upload.single('image'), authController.updateProfile);

module.exports = router;