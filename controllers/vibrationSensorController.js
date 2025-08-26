const vibrationModel = require('../models/vibrationSensorData');
const sensorUtils = require('../utils/sensorUtils');

// Initial base values for vibration
let baseAmplitude = 0.4;   // Starting at moderate amplitude (mm/s or g)
let baseFrequency = 50.0;  // Starting at 50 Hz
let counter = 0;           // Counter for time-based patterns

// Vibration scenarios
const scenarios = {
  normal: { amplitudeModifier: 0, frequencyModifier: 0 },
  idle: { amplitudeModifier: -0.2, frequencyModifier: -10 },
  light: { amplitudeModifier: -0.1, frequencyModifier: -5 },
  moderate: { amplitudeModifier: 0.2, frequencyModifier: 5 },
  heavy: { amplitudeModifier: 0.4, frequencyModifier: 10 },
  critical: { amplitudeModifier: 0.7, frequencyModifier: 15 }
};

// Current scenario (starts with normal)
let currentScenario = 'normal';

// Randomly change scenario occasionally
const changeScenario = () => {
  // Weight the scenarios to make critical less common
  const scenarioWeights = {
    normal: 0.3,
    idle: 0.15,
    light: 0.2,
    moderate: 0.2,
    heavy: 0.1,
    critical: 0.05
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
  
  console.log(`Vibration scenario changed to: ${currentScenario}`);
};

// Function to generate realistic vibration data with patterns
const generateVibrationData = (deviceId) => {
  counter++;
  
  // Add time-based patterns (slight sine wave pattern)
  const timePattern = Math.sin(counter / 20) * 0.1;
  
  // Small random fluctuations
  const amplitudeChange = (Math.random() - 0.5) * 0.05;
  const frequencyChange = (Math.random() - 0.5) * 2;
  
  // Get current scenario modifiers
  const scenarioEffect = scenarios[currentScenario];
  
  // Update base values with combined changes
  baseAmplitude = baseAmplitude + amplitudeChange + timePattern;
  baseFrequency = baseFrequency + frequencyChange;
  
  // Apply scenario effect
  const targetAmplitude = 0.4 + scenarioEffect.amplitudeModifier;
  const targetFrequency = 50 + scenarioEffect.frequencyModifier;
  
  // Gradually move toward scenario values (10% adjustment per reading)
  baseAmplitude = baseAmplitude * 0.9 + targetAmplitude * 0.1;
  baseFrequency = baseFrequency * 0.9 + targetFrequency * 0.1;
  
  // Keep values within realistic ranges
  baseAmplitude = Math.max(0.05, Math.min(1.5, baseAmplitude));
  baseFrequency = Math.max(10, Math.min(100, baseFrequency));
  
  // Generate axis values with some correlation but also independence
  const axisX = baseAmplitude * (0.8 + Math.random() * 0.4);
  const axisY = baseAmplitude * (0.8 + Math.random() * 0.4);
  const axisZ = baseAmplitude * (0.8 + Math.random() * 0.4);
  
  // Calculate RMS value
  const rms = Math.sqrt((axisX * axisX + axisY * axisY + axisZ * axisZ) / 3);
  
  // Calculate peak value
  const peakValue = Math.max(axisX, axisY, axisZ);
  
  return {
    amplitude: parseFloat(baseAmplitude.toFixed(3)),
    frequency: parseFloat(baseFrequency.toFixed(2)),
    axisX: parseFloat(axisX.toFixed(3)),
    axisY: parseFloat(axisY.toFixed(3)),
    axisZ: parseFloat(axisZ.toFixed(3)),
    rms: parseFloat(rms.toFixed(3)),
    peakValue: parseFloat(peakValue.toFixed(3)),
    deviceId
  };
};

// Function to save vibration data
const saveVibrationData = async () => {
  try {
    // Generate data for multiple devices
    const devices = [
      { id: 'vib-sensor-001', name: 'Motor Vibration Sensor 1' },
      { id: 'vib-sensor-002', name: 'Pump Vibration Sensor 2' }
    ];
    
    for (const device of devices) {
      const vibrationData = generateVibrationData(device.id);
      
      await vibrationModel.createVibrationData(vibrationData);
      
     
      // Log warning if vibration is high
      if (vibrationData.amplitude > 0.8) {
        console.log(`WARNING: High vibration detected on ${device.name}!`);
      }
    }
  } catch (error) {
    console.error('Error saving vibration data:', error);
  }
};

// Controller methods
const createVibrationData = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.createVibrationData(req.body);
    res.status(201).json({
      success: true,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error creating vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vibration data',
      error: error.message
    });
  }
};

// Get all vibration sensor data
const getAllVibrationData = async (req, res) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    const vibrationData = await vibrationModel.getAllVibrationData();
    res.status(200).json({
      success: true,
      count: vibrationData.length,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data',
      error: error.message
    });
  }
};

// Get vibration data by ID
const getVibrationDataById = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.getVibrationDataById(req.params.id);
    if (!vibrationData) {
      return res.status(404).json({
        success: false,
        message: 'Vibration data not found'
      });
    }
    res.status(200).json({
      success: true,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data',
      error: error.message
    });
  }
};

// Get latest vibration data
const getLatestVibrationData = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.getLatestVibrationData();
    if (!vibrationData) {
      return res.status(404).json({
        success: false,
        message: 'No vibration data found'
      });
    }
    res.status(200).json({
      success: true,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching latest vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest vibration data',
      error: error.message
    });
  }
};

// Get vibration data by device ID
const getVibrationDataByDeviceId = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.getVibrationDataByDeviceId(req.params.deviceId);
    res.status(200).json({
      success: true,
      count: vibrationData.length,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data by device ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data by device ID',
      error: error.message
    });
  }
};

// Get vibration data by time range
const getVibrationDataByTimeRange = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startTime and endTime parameters'
      });
    }
    
    const vibrationData = await vibrationModel.getVibrationDataByTimeRange(startTime, endTime);
    res.status(200).json({
      success: true,
      count: vibrationData.length,
      data: vibrationData
    });
  } catch (error) {
    console.error('Error fetching vibration data by time range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vibration data by time range',
      error: error.message
    });
  }
};

// Delete vibration data by ID
const deleteVibrationData = async (req, res) => {
  try {
    const vibrationData = await vibrationModel.deleteVibrationData(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Vibration data deleted successfully',
      data: vibrationData
    });
  } catch (error) {
    console.error('Error deleting vibration data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vibration data',
      error: error.message
    });
  }
};

module.exports = {
  createVibrationData,
  getAllVibrationData,
  getVibrationDataById,
  getLatestVibrationData,
  getVibrationDataByDeviceId,
  getVibrationDataByTimeRange,
  deleteVibrationData,
  generateVibrationData,
  saveVibrationData,
  changeScenario
}; 