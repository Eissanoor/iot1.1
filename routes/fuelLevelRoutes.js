const express = require('express');
const router = express.Router();
const fuelLevelController = require('../controllers/fuelLevelController');
const authMiddleware = require('../middleware/auth');

/**
 * @route POST /api/fuel-level
 * @desc Record new fuel level data
 * @access Protected
 */
router.post('/', authMiddleware, fuelLevelController.recordFuelLevel);

/**
 * @route GET /api/fuel-level
 * @desc Get all fuel level data
 * @access Protected
 */
router.get('/', authMiddleware, fuelLevelController.getAllFuelLevelData);

/**
 * @route GET /api/fuel-level/latest
 * @desc Get the latest fuel level reading
 * @access Protected
 */
router.get('/latest', authMiddleware, fuelLevelController.getLatestFuelLevel);

/**
 * @route GET /api/fuel-level/range
 * @desc Get fuel level data within a date range
 * @access Protected
 */
router.get('/range', authMiddleware, fuelLevelController.getFuelLevelByDateRange);

module.exports = router; 