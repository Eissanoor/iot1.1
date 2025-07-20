const mongoose = require('mongoose');

// Soil Moisture Data Schema
const soilMoistureDataSchema = new mongoose.Schema({
  moisture: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoilMoistureData', soilMoistureDataSchema); 