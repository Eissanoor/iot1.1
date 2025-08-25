const express = require('express');
const router = express.Router();
const demoRequestController = require('../controllers/demoRequestController');
const { verifyAdminToken } = require('../middleware/auth');

// Admin-only routes for managing demo requests
router.get('/demo-requests', verifyAdminToken, demoRequestController.getAllDemoRequests);
router.get('/demo-requests/:id', verifyAdminToken, demoRequestController.getDemoRequestById);
router.put('/demo-requests/:id', verifyAdminToken, demoRequestController.updateDemoRequest);
router.delete('/demo-requests/:id', verifyAdminToken, demoRequestController.deleteDemoRequest);

module.exports = router;
