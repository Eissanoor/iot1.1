const express = require('express');
const router = express.Router();
const npkSensorController = require('../controllers/npkSensorController');

// Routes for NPK sensor data
router.post('/', npkSensorController.createNPKData);
router.get('/', npkSensorController.getAllNPKData);
router.get('/latest', npkSensorController.getLatestNPKData);
router.get('/:id', npkSensorController.getNPKDataById);
router.get('/device/:deviceId', npkSensorController.getNPKDataByDeviceId);
router.get('/timerange', npkSensorController.getNPKDataByTimeRange);
router.delete('/:id', npkSensorController.deleteNPKData);

module.exports = router;