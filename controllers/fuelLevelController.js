const fuelLevelModel = require('../models/fuelLevelData');
const sensorUtils = require('../utils/sensorUtils');

/**
 * Record new fuel level data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function recordFuelLevel(req, res) {
  try {
    const { level, capacity } = req.body;
    
    // Validate input
    if (level === undefined || capacity === undefined) {
      return res.status(400).json({ error: 'Missing required fields: level and capacity' });
    }
    
    // Validate data types
    if (typeof level !== 'number' || typeof capacity !== 'number') {
      return res.status(400).json({ error: 'Level and capacity must be numbers' });
    }
    
    // Validate data ranges
    if (level < 0 || level > capacity) {
      return res.status(400).json({ error: 'Level must be between 0 and capacity' });
    }
    
    if (capacity <= 0) {
      return res.status(400).json({ error: 'Capacity must be greater than 0' });
    }
    
    const fuelData = await fuelLevelModel.createFuelLevelData({ level, capacity });
    res.status(201).json(fuelData);
  } catch (error) {
    console.error('Error recording fuel level:', error);
    res.status(500).json({ error: 'Failed to record fuel level data' });
  }
}

/**
 * Get all fuel level data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllFuelLevelData(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const data = await fuelLevelModel.getAllFuelLevelData({ limit });
    res.json(data);
  } catch (error) {
    console.error('Error fetching fuel level data:', error);
    res.status(500).json({ error: 'Failed to fetch fuel level data' });
  }
}

/**
 * Get the latest fuel level reading with additional calculated metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getLatestFuelLevel(req, res) {
  try {
    const data = await fuelLevelModel.getLatestFuelLevelData();
    if (!data) {
      return res.status(404).json({ error: 'No fuel level data found' });
    }
    
    // Calculate additional metrics
    const baseConsumptionRate = 0.5; // Base rate in units per hour
    const load = 75; // Example load percentage
    const temperature = 25; // Example temperature in Celsius
    
    const consumptionRate = sensorUtils.calculateFuelConsumptionRate(
      baseConsumptionRate, 
      load, 
      temperature
    );
    
    const remainingTime = sensorUtils.calculateRemainingTime(
      data.level, 
      data.capacity, 
      consumptionRate
    );
    
    const formattedTime = sensorUtils.formatRemainingTime(remainingTime);
    
    // Enhance the response with additional metrics
    const enhancedData = {
      ...data,
      metrics: {
        consumptionRate: sensorUtils.formatValue(consumptionRate, 2),
        remainingTime: remainingTime,
        remainingTimeFormatted: formattedTime,
        percentageFull: sensorUtils.formatValue((data.level / data.capacity) * 100, 1)
      }
    };
    
    res.json(enhancedData);
  } catch (error) {
    console.error('Error fetching latest fuel level:', error);
    res.status(500).json({ error: 'Failed to fetch latest fuel level data' });
  }
}

/**
 * Get fuel level data within a date range
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getFuelLevelByDateRange(req, res) {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    
    const data = await fuelLevelModel.getFuelLevelDataByDateRange({ 
      startDate: start, 
      endDate: end 
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching fuel level by date range:', error);
    res.status(500).json({ error: 'Failed to fetch fuel level data by date range' });
  }
}

module.exports = {
  recordFuelLevel,
  getAllFuelLevelData,
  getLatestFuelLevel,
  getFuelLevelByDateRange
}; 