const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Admin auth routes
router.post('/signup', adminController.signup);
router.post('/login', adminController.login);
router.get('/me', authMiddleware.verifyAdminToken, adminController.getMe);

module.exports = router; 