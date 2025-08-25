const express = require('express');
const router = express.Router();
const demoRequestController = require('../controllers/demoRequestController');
const { verifyAdminToken } = require('../middleware/auth');

// Public route for creating demo requests
router.post('/', demoRequestController.createDemoRequest);

// Admin-only routes for managing demo requests
router.get('/', verifyAdminToken, demoRequestController.getAllDemoRequests);
router.get('/:id', verifyAdminToken, demoRequestController.getDemoRequestById);
router.put('/:id', verifyAdminToken, demoRequestController.updateDemoRequest);
router.delete('/:id', verifyAdminToken, demoRequestController.deleteDemoRequest);

module.exports = router;
