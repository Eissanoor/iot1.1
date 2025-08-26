const Temperature = require('../models/temperatureData');

// Initial base values for sensor data
let baseTemperature = 25.0; // Starting at 25°C
let baseHumidity = 60.0;    // Starting at 60%
let counter = 0;            // Counter for time-based patterns

// Environmental scenarios
const scenarios = {
  normal: { temp: 0, humidity: 0 },
  hot: { temp: 5, humidity: -10 },
  cold: { temp: -5, humidity: 5 },
  rainy: { temp: -2, humidity: 15 },
  dry: { temp: 2, humidity: -15 }
};

// Current scenario (starts with normal)
let currentScenario = 'normal';

// Randomly change scenario occasionally
const changeScenario = () => {
  const scenarioKeys = Object.keys(scenarios);
  currentScenario = scenarioKeys[Math.floor(Math.random() * scenarioKeys.length)];
  console.log(`Weather scenario changed to: ${currentScenario}`);
};

// Function to generate realistic sensor data with patterns
const generateSensorData = () => {
  counter++;
  
  // Add time-based patterns (slight sine wave pattern)
  const timePattern = Math.sin(counter / 20) * 2; // Sine wave with period of ~120 seconds
  
  // Small random fluctuations (-0.3 to +0.3)
  const tempChange = (Math.random() - 0.5) * 0.6;
  const humidityChange = (Math.random() - 0.5) * 0.6;
  
  // Get current scenario modifiers
  const scenarioEffect = scenarios[currentScenario];
  
  // Update base values with combined changes
  baseTemperature = baseTemperature + tempChange + timePattern * 0.3;
  baseHumidity = baseHumidity + humidityChange - timePattern * 0.5; // Inverse relationship
  
  // Apply scenario effect
  const targetTemp = 25 + scenarioEffect.temp;
  const targetHumidity = 60 + scenarioEffect.humidity;
  
  // Gradually move toward scenario values (10% adjustment per reading)
  baseTemperature = baseTemperature * 0.9 + targetTemp * 0.1;
  baseHumidity = baseHumidity * 0.9 + targetHumidity * 0.1;
  
  // Keep values within realistic ranges
  baseTemperature = Math.max(15, Math.min(35, baseTemperature));
  baseHumidity = Math.max(40, Math.min(80, baseHumidity));
  
  return {
    temperature: parseFloat(baseTemperature.toFixed(2)),
    humidity: parseFloat(baseHumidity.toFixed(2))
  };
};

// Function to save temperature data
const saveSensorData = async () => {
  try {
    const { temperature, humidity } = generateSensorData();
    
    await Temperature.create({
      temperature,
      humidity
    });
    
    
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Controller methods
exports.createData = async (req, res) => {
  try {
    const { temperature, humidity } = req.body;
    
    await Temperature.create({
      temperature: parseFloat(temperature),
      humidity: parseFloat(humidity)
    });
    
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllData = async (req, res) => {
  try {
    // Get query parameters for filtering
    const limit = parseInt(req.query.limit) || 100; // Default to 100 records
    const skip = parseInt(req.query.skip) || 0;
    
    // Get data with pagination, sort by timestamp descending (newest first)
    const data = await Temperature.findMany({
      skip: skip,
      take: limit,
      orderBy: { timestamp: 'desc' }
    });
    
    // Get total count
    const count = await Temperature.count();
    
    res.status(200).json({
      count,
      data
    });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLatestData = async (req, res) => {
  try {
    const latestData = await Temperature.findFirst({
      orderBy: { timestamp: 'desc' }
    });
      
    if (!latestData) {
      return res.status(404).json({ message: 'No temperature data found' });
    }
    
    res.status(200).json(latestData);
  } catch (error) {
    console.error('Error retrieving latest data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Export functions for use in cron jobs
exports.generateSensorData = generateSensorData;
exports.saveSensorData = saveSensorData;
exports.changeScenario = changeScenario; 