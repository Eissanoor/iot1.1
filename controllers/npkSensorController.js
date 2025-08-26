const NPKSensorData = require('../models/npkSensorData');

// Initial base values for NPK
let baseNitrogen = 140.0;    // Starting at 140 ppm (moderate nitrogen)
let basePhosphorus = 45.0;   // Starting at 45 ppm (moderate phosphorus)
let basePotassium = 180.0;   // Starting at 180 ppm (moderate potassium)
let basePH = 6.5;            // Starting at 6.5 pH (slightly acidic, good for most plants)
let counter = 0;             // Counter for time-based patterns

// NPK scenarios
const scenarios = {
  optimal: { 
    nitrogenModifier: 0, 
    phosphorusModifier: 0, 
    potassiumModifier: 0, 
    phModifier: 0 
  },
  lowNutrients: { 
    nitrogenModifier: -40, 
    phosphorusModifier: -15, 
    potassiumModifier: -50, 
    phModifier: -0.2 
  },
  highNitrogen: { 
    nitrogenModifier: 60, 
    phosphorusModifier: -5, 
    potassiumModifier: -10, 
    phModifier: -0.3 
  },
  highPhosphorus: { 
    nitrogenModifier: -10, 
    phosphorusModifier: 25, 
    potassiumModifier: -5, 
    phModifier: 0.2 
  },
  highPotassium: { 
    nitrogenModifier: -5, 
    phosphorusModifier: -5, 
    potassiumModifier: 70, 
    phModifier: 0.1 
  },
  acidic: { 
    nitrogenModifier: 10, 
    phosphorusModifier: -10, 
    potassiumModifier: 5, 
    phModifier: -1.0 
  },
  alkaline: { 
    nitrogenModifier: -15, 
    phosphorusModifier: 15, 
    potassiumModifier: -10, 
    phModifier: 1.0 
  }
};

// Current scenario (starts with optimal)
let currentScenario = 'optimal';

// Randomly change scenario occasionally
const changeScenario = () => {
  // Weight the scenarios to make extreme cases less common
  const scenarioWeights = {
    optimal: 0.3,
    lowNutrients: 0.15,
    highNitrogen: 0.15,
    highPhosphorus: 0.1,
    highPotassium: 0.1,
    acidic: 0.1,
    alkaline: 0.1
  };
  
  // Weighted random selection
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const [scenario, weight] of Object.entries(scenarioWeights)) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      currentScenario = scenario;
      break;
    }
  }
  
  console.log(`NPK scenario changed to: ${currentScenario}`);
};

// Function to generate realistic NPK data with patterns
const generateNPKData = (deviceId) => {
  counter++;
  
  // Add time-based patterns (slight sine wave pattern with longer period)
  const timePatternN = Math.sin(counter / 40) * 5;
  const timePatternP = Math.cos(counter / 30) * 2;
  const timePatternK = Math.sin(counter / 35) * 7;
  const timePatternPH = Math.sin(counter / 50) * 0.1;
  
  // Small random fluctuations
  const nitrogenChange = (Math.random() - 0.5) * 3;
  const phosphorusChange = (Math.random() - 0.5) * 1.5;
  const potassiumChange = (Math.random() - 0.5) * 4;
  const phChange = (Math.random() - 0.5) * 0.05;
  
  // Get current scenario modifiers
  const scenarioEffect = scenarios[currentScenario];
  
  // Update base values with combined changes
  baseNitrogen = baseNitrogen + nitrogenChange + timePatternN;
  basePhosphorus = basePhosphorus + phosphorusChange + timePatternP;
  basePotassium = basePotassium + potassiumChange + timePatternK;
  basePH = basePH + phChange + timePatternPH;
  
  // Apply scenario effect
  const targetNitrogen = 140 + scenarioEffect.nitrogenModifier;
  const targetPhosphorus = 45 + scenarioEffect.phosphorusModifier;
  const targetPotassium = 180 + scenarioEffect.potassiumModifier;
  const targetPH = 6.5 + scenarioEffect.phModifier;
  
  // Gradually move toward scenario values (5% adjustment per reading - soil changes slowly)
  baseNitrogen = baseNitrogen * 0.95 + targetNitrogen * 0.05;
  basePhosphorus = basePhosphorus * 0.95 + targetPhosphorus * 0.05;
  basePotassium = basePotassium * 0.95 + targetPotassium * 0.05;
  basePH = basePH * 0.97 + targetPH * 0.03;
  
  // Keep values within realistic ranges
  baseNitrogen = Math.max(20, Math.min(250, baseNitrogen));
  basePhosphorus = Math.max(5, Math.min(100, basePhosphorus));
  basePotassium = Math.max(40, Math.min(300, basePotassium));
  basePH = Math.max(3.5, Math.min(9.0, basePH));
  
  return {
    nitrogen: parseFloat(baseNitrogen.toFixed(1)),
    phosphorus: parseFloat(basePhosphorus.toFixed(1)),
    potassium: parseFloat(basePotassium.toFixed(1)),
    ph: parseFloat(basePH.toFixed(2)),
    deviceId
  };
};

// Function to save NPK data
const saveNPKData = async () => {
  try {
    // Generate data for multiple devices
    const devices = [
      { id: 'npk-sensor-001', name: 'Field NPK Sensor 1' },
      { id: 'npk-sensor-002', name: 'Greenhouse NPK Sensor 2' }
    ];
    
    for (const device of devices) {
      const npkData = generateNPKData(device.id);
      
      await NPKSensorData.createNPKData(npkData);
      
      
      // Log warning if values are extreme
      if (npkData.ph < 5.0 || npkData.ph > 8.0) {
        console.log(`WARNING: Extreme pH level detected on ${device.name}: ${npkData.ph}!`);
      }
      
      if (npkData.nitrogen < 50) {
        console.log(`WARNING: Low nitrogen level detected on ${device.name}: ${npkData.nitrogen} ppm!`);
      }
    }
  } catch (error) {
    console.error('Error saving NPK data:', error);
  }
};

// Controller methods
const createNPKData = async (req, res) => {
  try {
    const npkData = await NPKSensorData.createNPKData(req.body);
    res.status(201).json({
      success: true,
      data: npkData
    });
  } catch (error) {
    console.error('Error creating NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create NPK data',
      error: error.message
    });
  }
};

// Get all NPK sensor data
const getAllNPKData = async (req, res) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    const npkData = await NPKSensorData.getAllNPKData({
      skip: skip,
      take: limit,
      orderBy: { timestamp: 'desc' }
    });
    
    // Get total count
    const count = await NPKSensorData.count();
    
    res.status(200).json({
      success: true,
      count,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data',
      error: error.message
    });
  }
};

// Get NPK data by ID
const getNPKDataById = async (req, res) => {
  try {
    const npkData = await NPKSensorData.getNPKDataById(req.params.id);
    if (!npkData) {
      return res.status(404).json({
        success: false,
        message: 'NPK data not found'
      });
    }
    res.status(200).json({
      success: true,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data',
      error: error.message
    });
  }
};

// Get latest NPK data
const getLatestNPKData = async (req, res) => {
  try {
    const npkData = await NPKSensorData.getLatestNPKData();
    if (!npkData) {
      return res.status(404).json({
        success: false,
        message: 'No NPK data found'
      });
    }
    res.status(200).json({
      success: true,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching latest NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest NPK data',
      error: error.message
    });
  }
};

// Get NPK data by device ID
const getNPKDataByDeviceId = async (req, res) => {
  try {
    const npkData = await NPKSensorData.getNPKDataByDeviceId(req.params.deviceId);
    res.status(200).json({
      success: true,
      count: npkData.length,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data by device ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data by device ID',
      error: error.message
    });
  }
};

// Get NPK data by time range
const getNPKDataByTimeRange = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startTime and endTime parameters'
      });
    }
    
    const npkData = await NPKSensorData.getNPKDataByTimeRange(startTime, endTime);
    res.status(200).json({
      success: true,
      count: npkData.length,
      data: npkData
    });
  } catch (error) {
    console.error('Error fetching NPK data by time range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch NPK data by time range',
      error: error.message
    });
  }
};

// Delete NPK data by ID
const deleteNPKData = async (req, res) => {
  try {
    const npkData = await NPKSensorData.deleteNPKData(req.params.id);
    res.status(200).json({
      success: true,
      message: 'NPK data deleted successfully',
      data: npkData
    });
  } catch (error) {
    console.error('Error deleting NPK data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete NPK data',
      error: error.message
    });
  }
};

module.exports = {
  createNPKData,
  getAllNPKData,
  getNPKDataById,
  getLatestNPKData,
  getNPKDataByDeviceId,
  getNPKDataByTimeRange,
  deleteNPKData,
  generateNPKData,
  saveNPKData,
  changeScenario
};