const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/auth');

// Route to get dashboard statistics
router.get('/stats', verifyToken, dashboardController.getDashboardStats);

// Route to get IoT sensor data
router.get('/iot-sensors', verifyToken, dashboardController.getIoTSensorData);

module.exports = router;
