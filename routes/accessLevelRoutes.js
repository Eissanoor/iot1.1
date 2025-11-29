const express = require('express');
const router = express.Router();
const accessLevelController = require('../controllers/accessLevelController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new access level - protected route
router.post('/', verifyAdminToken, accessLevelController.createAccessLevel);

// Get all access levels
router.get('/', accessLevelController.getAllAccessLevels);

// Get access level by ID - protected route
router.get('/:id', verifyAdminToken, accessLevelController.getAccessLevelById);

// Update access level - protected route
router.put('/:id', verifyAdminToken, accessLevelController.updateAccessLevel);

// Delete access level - protected route
router.delete('/:id', verifyAdminToken, accessLevelController.deleteAccessLevel);

module.exports = router;

