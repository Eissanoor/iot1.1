const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new location - protected route
router.post('/', verifyAdminToken, locationController.createLocation);

// Get all locations
router.get('/', locationController.getAllLocations);

// Get location by ID
router.get('/:id', locationController.getLocationById);

// Update location - protected route
router.put('/:id', verifyAdminToken, locationController.updateLocation);

// Delete location - protected route
router.delete('/:id', verifyAdminToken, locationController.deleteLocation);

module.exports = router; 