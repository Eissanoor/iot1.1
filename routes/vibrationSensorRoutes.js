const express = require('express');
const router = express.Router();
const vibrationController = require('../controllers/vibrationSensorController');
const { verifyToken } = require('../middleware/auth');

// POST - Create new vibration sensor data
router.post('/', vibrationController.createVibrationData);

// GET - Get all vibration sensor data
router.get('/', verifyToken, vibrationController.getAllVibrationData);

// GET - Get latest vibration data
router.get('/latest', vibrationController.getLatestVibrationData);

// GET - Get vibration data by time range
router.get('/range', verifyToken, vibrationController.getVibrationDataByTimeRange);

// GET - Get vibration data by device ID
router.get('/device/:deviceId', verifyToken, vibrationController.getVibrationDataByDeviceId);

// GET - Get vibration data by ID
router.get('/:id', verifyToken, vibrationController.getVibrationDataById);

// DELETE - Delete vibration data by ID
router.delete('/:id', verifyToken, vibrationController.deleteVibrationData);

module.exports = router; 