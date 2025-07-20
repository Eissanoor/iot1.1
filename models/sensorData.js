const mongoose = require('mongoose');

// Temperature Data Schema
const temperatureSchema = new mongoose.Schema({
  temperature: Number,
  humidity: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Temperature', temperatureSchema); 