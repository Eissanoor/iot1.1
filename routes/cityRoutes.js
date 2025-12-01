const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');
const { verifyAdminToken } = require('../middleware/auth');

// Create a new city - protected
router.post('/', verifyAdminToken, cityController.createCity);

// Get all cities - protected
router.get('/', verifyAdminToken, cityController.getAllCities);

// Get city by ID - protected
router.get('/:id', verifyAdminToken, cityController.getCityById);

// Update city - protected
router.put('/:id', verifyAdminToken, cityController.updateCity);

// Delete city - protected
router.delete('/:id', verifyAdminToken, cityController.deleteCity);

module.exports = router;


