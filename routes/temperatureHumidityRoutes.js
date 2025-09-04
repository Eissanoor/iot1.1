const express = require('express');
const router = express.Router();
const tempHumidityController = require('../controllers/temperatureHumidityController');

// Routes for temperature data
router.post('/', tempHumidityController.createData);
router.get('/', tempHumidityController.getAllData);
router.get('/latest', tempHumidityController.getLatestData);
router.get('/stats', tempHumidityController.getStats);
router.get('/historical', tempHumidityController.getHistoricalData);
router.get('/trends', tempHumidityController.getTrends);

module.exports = router;