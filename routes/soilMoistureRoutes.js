const express = require('express');
const router = express.Router();
const soilMoistureController = require('../controllers/soilMoistureController');

// Routes for soil moisture data
router.post('/', soilMoistureController.createData);
router.get('/', soilMoistureController.getAllData);
router.get('/latest', soilMoistureController.getLatestData);

module.exports = router; 